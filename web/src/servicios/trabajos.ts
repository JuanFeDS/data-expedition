import { useMemo } from 'react';
import { useSesion } from '../componentes/sesion';
import { crearServicioTrabajosDemo } from './trabajosDemo';
import { supabase } from './supabase';

export type EstadoEntrega = 'borrador' | 'entregada' | 'calificada' | 'no_presento';
export type ModoIa = 'sin_ia' | 'con_ia';

export interface TrabajoCurso {
  id: string;
  nombre: string;
  tema: string;
  semana: number | null;
  venceEn: string | null;
  minPylint: number;
}

export interface EntregaPropia {
  trabajoId: string;
  estado: EstadoEntrega;
  modoIa: ModoIa;
  enlacePr: string | null;
  entregadaEn: string | null;
  nota: number | null;
}

export interface EntregaVista {
  id: string;
  trabajoId: string;
  estudiante: string;
  usuario: string | null;
  grupo: string | null;
  estado: EstadoEntrega;
  modoIa: ModoIa;
  enlacePr: string | null;
  entregadaEn: string | null;
  nota: number | null;
}

export interface NuevoTrabajo { nombre: string; tema: string; semana: number | null; venceEn: string | null; minPylint: number }
export interface NuevaEntrega { trabajoId: string; enlacePr: string; modoIa: ModoIa; bitacora: string | null }

export interface ServicioTrabajos {
  cargarTrabajos: (cursoId: string) => Promise<TrabajoCurso[]>;
  crearTrabajo: (cursoId: string, datos: NuevoTrabajo) => Promise<string | null>;
  eliminarTrabajo: (id: string) => Promise<string | null>;
  misEntregas: (cursoId: string) => Promise<EntregaPropia[]>;
  entregar: (entrega: NuevaEntrega) => Promise<string | null>;
  entregasDelCurso: (cursoId: string) => Promise<EntregaVista[]>;
}

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export const formatoFecha = (iso: string | null) => {
  if (!iso) return { dia: '—', numero: '', largo: 'sin fecha' };
  const fecha = new Date(iso);
  const dia = DIAS[fecha.getDay()];
  return { dia: dia.slice(0, 3).toUpperCase(), numero: String(fecha.getDate()), largo: `${dia} ${fecha.getDate()} ${MESES[fecha.getMonth()]}` };
};

export const finDelDia = (fechaLocal: string) => new Date(`${fechaLocal}T23:59:00`).toISOString();

export const trabajoPorEntregar = (trabajos: TrabajoCurso[], entregas: EntregaPropia[]) => {
  const hechos = new Set(entregas.filter((entrega) => entrega.estado !== 'borrador').map((entrega) => entrega.trabajoId));
  return trabajos.find((trabajo) => !hechos.has(trabajo.id)) ?? null;
};

const servicioSupabase: ServicioTrabajos = {
  async cargarTrabajos(cursoId) {
    const { data, error } = await supabase!.from('trabajos').select('id, nombre, tema, semana, vence_en, min_pylint').eq('edicion_id', cursoId).eq('es_diagnostico', false).order('semana').order('vence_en');
    if (error) throw error;
    return (data ?? []).map((fila) => ({ id: fila.id as string, nombre: fila.nombre as string, tema: (fila.tema as string | null) ?? '', semana: fila.semana as number | null, venceEn: fila.vence_en as string | null, minPylint: fila.min_pylint as number }));
  },

  async crearTrabajo(cursoId, datos) {
    const { error } = await supabase!.from('trabajos').insert({ edicion_id: cursoId, nombre: datos.nombre, tema: datos.tema || null, semana: datos.semana, vence_en: datos.venceEn, min_pylint: datos.minPylint });
    return error ? FALLO : null;
  },

  async eliminarTrabajo(id) {
    const { error } = await supabase!.from('trabajos').delete().eq('id', id);
    return error ? 'No se pudo eliminar. Si ya tiene entregas, no se puede borrar.' : null;
  },

  async misEntregas(cursoId) {
    const { data: sesion } = await supabase!.auth.getSession();
    const yo = sesion.session?.user.id;
    if (!yo) return [];
    const { data, error } = await supabase!.from('entregas').select('trabajo_id, estado, modo_ia, enlace_pr, entregada_en, nota, trabajos!inner(edicion_id)').eq('perfil_id', yo).eq('trabajos.edicion_id', cursoId);
    if (error) throw error;
    return (data ?? []).map((fila) => ({ trabajoId: fila.trabajo_id as string, estado: fila.estado as EstadoEntrega, modoIa: fila.modo_ia as ModoIa, enlacePr: fila.enlace_pr as string | null, entregadaEn: fila.entregada_en as string | null, nota: fila.nota as number | null }));
  },

  async entregar(entrega) {
    const { data: sesion } = await supabase!.auth.getSession();
    const yo = sesion.session?.user.id;
    if (!yo) return 'Tu sesión venció. Vuelve a entrar.';
    const { error } = await supabase!.from('entregas').upsert(
      { trabajo_id: entrega.trabajoId, perfil_id: yo, modo_ia: entrega.modoIa, bitacora: entrega.bitacora, estado: 'entregada', enlace_pr: entrega.enlacePr, entregada_en: new Date().toISOString() },
      { onConflict: 'trabajo_id,perfil_id' },
    );
    return error ? FALLO : null;
  },

  async entregasDelCurso(cursoId) {
    const [entregas, matriculas] = await Promise.all([
      supabase!.from('entregas').select('id, trabajo_id, perfil_id, modo_ia, estado, enlace_pr, entregada_en, nota, perfiles(nombre, usuario, correo), trabajos!inner(edicion_id)').eq('trabajos.edicion_id', cursoId).neq('estado', 'borrador').order('entregada_en', { ascending: false }),
      supabase!.from('matriculas').select('perfil_id, grupos(nombre)').eq('edicion_id', cursoId),
    ]);
    if (entregas.error || matriculas.error) throw new Error('Consulta fallida');
    const grupoDe = new Map((matriculas.data ?? []).map((fila) => [fila.perfil_id as string, (fila.grupos as unknown as { nombre: string } | null)?.nombre ?? null]));
    return (entregas.data ?? []).map((fila) => {
      const perfil = fila.perfiles as unknown as { nombre: string | null; usuario: string | null; correo: string } | null;
      return {
        id: fila.id as string,
        trabajoId: fila.trabajo_id as string,
        estudiante: perfil?.nombre ?? perfil?.correo ?? 'Sin nombre',
        usuario: perfil?.usuario ?? null,
        grupo: grupoDe.get(fila.perfil_id as string) ?? null,
        estado: fila.estado as EstadoEntrega,
        modoIa: fila.modo_ia as ModoIa,
        enlacePr: fila.enlace_pr as string | null,
        entregadaEn: fila.entregada_en as string | null,
        nota: fila.nota as number | null,
      };
    });
  },
};

const servicioDemo = crearServicioTrabajosDemo();

export const useServicioTrabajos = (): ServicioTrabajos => {
  const { modoDemo } = useSesion();
  return useMemo(() => (modoDemo ? servicioDemo : servicioSupabase), [modoDemo]);
};
