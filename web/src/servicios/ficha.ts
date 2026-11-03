import { calcularRadar, dimensionesDelCurso, type PuntoRadar } from './radar';
import { supabase } from './supabase';
import type { EstadoEntrega, ModoIa } from './trabajos';

export interface EntregaDeEstudiante { trabajoId: string; trabajo: string; semana: number | null; estado: EstadoEntrega; modoIa: ModoIa; nota: number | null }
export interface ResumenAsistencia { dadas: number; cuentan: number; ausentes: number }
export interface ResumenPracticaEstudiante { sesiones: number; xp: number; sesionesSemana: number }
export interface FichaEstudiante {
  radar: PuntoRadar[];
  entregas: EntregaDeEstudiante[];
  asistencia: ResumenAsistencia;
  practica: ResumenPracticaEstudiante;
  diagnosticoRegistrado: boolean;
}

export const cargarFicha = async (cursoId: string, perfilId: string): Promise<FichaEstudiante> => {
  const dimensiones = await dimensionesDelCurso(cursoId);
  const ids = dimensiones.map((dimension) => dimension.id);
  const hace7 = new Date(Date.now() - 7 * 86400000).toISOString();
  const [evidencias, entregas, asistencias, sesiones, practica, diagnostico] = await Promise.all([
    ids.length ? supabase!.from('evidencias_radar').select('dimension_id, fuente, valor, peso').eq('perfil_id', perfilId).in('dimension_id', ids) : Promise.resolve({ data: [], error: null }),
    supabase!.from('entregas').select('trabajo_id, estado, modo_ia, nota, trabajos!inner(nombre, semana, edicion_id)').eq('perfil_id', perfilId).eq('trabajos.edicion_id', cursoId).neq('estado', 'borrador'),
    supabase!.from('asistencias').select('sesion_id, estado, sesiones!inner(edicion_id)').eq('perfil_id', perfilId).eq('sesiones.edicion_id', cursoId),
    supabase!.from('sesiones').select('id, inicia_en').eq('edicion_id', cursoId).eq('modalidad', 'virtual'),
    supabase!.from('practica_sesiones').select('xp, terminada_en').eq('perfil_id', perfilId).eq('edicion_id', cursoId),
    ids.length ? supabase!.from('diagnosticos').select('dimension_id', { count: 'exact', head: true }).eq('perfil_id', perfilId).in('dimension_id', ids).or('con_ia.not.is.null,sin_ia.not.is.null') : Promise.resolve({ count: 0, error: null }),
  ]);
  const dadas = (sesiones.data ?? []).filter((sesion) => sesion.inicia_en && new Date(sesion.inicia_en as string).getTime() < Date.now());
  const marcas = (asistencias.data ?? []) as { sesion_id: string; estado: string }[];
  const dePractica = (practica.data ?? []) as { xp: number; terminada_en: string }[];
  return {
    radar: calcularRadar(dimensiones, (evidencias.data ?? []) as { dimension_id: string; fuente: string; valor: number; peso: number }[]),
    entregas: (entregas.data ?? []).map((fila) => {
      const trabajo = fila.trabajos as unknown as { nombre: string; semana: number | null };
      return { trabajoId: fila.trabajo_id as string, trabajo: trabajo.nombre, semana: trabajo.semana, estado: fila.estado as EstadoEntrega, modoIa: fila.modo_ia as ModoIa, nota: fila.nota === null ? null : Number(fila.nota) };
    }),
    asistencia: {
      dadas: dadas.length,
      cuentan: marcas.filter((marca) => marca.estado === 'presente' || marca.estado === 'justificado').length,
      ausentes: marcas.filter((marca) => marca.estado === 'ausente').length,
    },
    practica: { sesiones: dePractica.length, xp: dePractica.reduce((total, fila) => total + fila.xp, 0), sesionesSemana: dePractica.filter((fila) => fila.terminada_en >= hace7).length },
    diagnosticoRegistrado: ((diagnostico as { count: number | null }).count ?? 0) > 0,
  };
};
