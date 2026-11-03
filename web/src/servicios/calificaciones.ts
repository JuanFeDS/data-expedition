import { calcularNota } from '../dominio/nota.ts';
import { registrarEvento } from './eventos';
import { supabase } from './supabase';
import type { EstadoEntrega, ModoIa } from './trabajos';

export interface CriterioCalificable {
  id: string;
  nombre: string;
  dimension: string;
  peso: number;
  descriptores: [string, string, string, string, string];
}

export interface EntregaCalificable {
  entregaId: string;
  trabajoId: string;
  trabajo: string;
  estudiante: string;
  usuario: string | null;
  modoIa: ModoIa;
  estado: EstadoEntrega;
  enlacePr: string | null;
  bitacora: string | null;
  nota: number | null;
  retroalimentacion: string;
  criterios: CriterioCalificable[];
  niveles: Record<string, number>;
}

const FALLO = 'No pudimos guardar la calificación. Intenta de nuevo.';

// La regla de la nota vive en el dominio; aquí solo se adapta la rúbrica (sin criterios, la nota es 0).
export const notaPonderada = (criterios: CriterioCalificable[], niveles: Record<string, number>) => (
  criterios.length === 0 ? 0 : calcularNota(criterios.map((criterio) => ({ nivel: niveles[criterio.id] ?? 1, peso: criterio.peso })))
);

const cargarCriterios = async (trabajoId: string, modoIa: ModoIa): Promise<CriterioCalificable[]> => {
  const { data, error } = await supabase!.from('criterios')
    .select('id, nombre, peso, descriptor_nivel_1, descriptor_nivel_2, descriptor_nivel_3, descriptor_nivel_4, descriptor_nivel_5, dimensiones(nombre)')
    .eq('trabajo_id', trabajoId).eq('modo_ia', modoIa).order('nombre');
  if (error) throw error;
  return (data ?? []).map((fila) => ({
    id: fila.id as string,
    nombre: fila.nombre as string,
    dimension: (fila.dimensiones as unknown as { nombre: string } | null)?.nombre ?? '—',
    peso: Number(fila.peso),
    descriptores: [fila.descriptor_nivel_1, fila.descriptor_nivel_2, fila.descriptor_nivel_3, fila.descriptor_nivel_4, fila.descriptor_nivel_5] as CriterioCalificable['descriptores'],
  }));
};

const armar = async (fila: Record<string, unknown>): Promise<EntregaCalificable> => {
  const perfil = fila.perfiles as unknown as { nombre: string | null; usuario: string | null; correo: string } | null;
  const trabajo = fila.trabajos as unknown as { nombre: string } | null;
  const modoIa = fila.modo_ia as ModoIa;
  const entregaId = fila.id as string;
  const [criterios, calificaciones] = await Promise.all([
    cargarCriterios(fila.trabajo_id as string, modoIa),
    supabase!.from('calificaciones').select('criterio_id, nivel').eq('entrega_id', entregaId),
  ]);
  if (calificaciones.error) throw calificaciones.error;
  return {
    entregaId,
    trabajoId: fila.trabajo_id as string,
    trabajo: trabajo?.nombre ?? 'Trabajo',
    estudiante: perfil?.nombre ?? perfil?.correo ?? 'Sin nombre',
    usuario: perfil?.usuario ?? null,
    modoIa,
    estado: fila.estado as EstadoEntrega,
    enlacePr: fila.enlace_pr as string | null,
    bitacora: fila.bitacora as string | null,
    nota: fila.nota === null ? null : Number(fila.nota),
    retroalimentacion: (fila.retroalimentacion as string | null) ?? '',
    criterios,
    niveles: Object.fromEntries((calificaciones.data ?? []).map((nivel) => [nivel.criterio_id as string, Number(nivel.nivel)])),
  };
};

const COLUMNAS = 'id, trabajo_id, modo_ia, bitacora, estado, nota, enlace_pr, retroalimentacion, perfiles(nombre, usuario, correo), trabajos(nombre)';

export const entregaParaCalificar = async (entregaId: string): Promise<EntregaCalificable | null> => {
  const { data, error } = await supabase!.from('entregas').select(COLUMNAS).eq('id', entregaId).maybeSingle();
  if (error) throw error;
  return data ? armar(data) : null;
};

export const miEntregaCalificada = async (trabajoId: string): Promise<EntregaCalificable | null> => {
  const { data: sesion } = await supabase!.auth.getSession();
  const yo = sesion.session?.user.id;
  if (!yo) return null;
  const { data, error } = await supabase!.from('entregas').select(COLUMNAS).eq('trabajo_id', trabajoId).eq('perfil_id', yo).maybeSingle();
  if (error) throw error;
  return data ? armar(data) : null;
};

export const calificar = async (entrega: EntregaCalificable, niveles: Record<string, number>, retroalimentacion: string): Promise<{ nota: number | null; error: string | null }> => {
  const carga = entrega.criterios.map((criterio) => ({ criterio_id: criterio.id, nivel: niveles[criterio.id] ?? 1 }));
  const { data, error } = await supabase!.rpc('calificar_entrega', { p_entrega: entrega.entregaId, p_niveles: carga, p_retroalimentacion: retroalimentacion });
  if (error) return { nota: null, error: FALLO };
  registrarEvento('entrega_calificada', { entidad: 'entrega', entidadId: entrega.entregaId, datos: { nota: Number(data), criterios: carga.length } });
  return { nota: Number(data), error: null };
};
