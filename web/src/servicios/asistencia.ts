import { registrarEvento } from './eventos';
import { supabase } from './supabase';

export type EstadoAsistencia = 'presente' | 'ausente' | 'justificado';
export interface RegistroAsistencia { estado: EstadoAsistencia; origen: 'codigo' | 'manual'; registradaEn: string }
export interface CodigoVigente { codigo: string; segundos: number }
export interface MiAsistencia { sesionId: string; estado: EstadoAsistencia }

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';

export const asistenciaAbierta = async (sesionId: string): Promise<boolean> => {
  const { data, error } = await supabase!.from('sesiones_asistencia').select('abierta').eq('sesion_id', sesionId).maybeSingle();
  if (error) throw error;
  return Boolean(data?.abierta);
};

export const abrirAsistencia = async (cursoId: string, sesionId: string): Promise<string | null> => {
  const { error } = await supabase!.rpc('abrir_asistencia', { p_sesion: sesionId });
  if (error) return FALLO;
  registrarEvento('asistencia_abierta', { edicionId: cursoId, entidad: 'sesion', entidadId: sesionId });
  return null;
};

export const cerrarAsistencia = async (cursoId: string, sesionId: string): Promise<string | null> => {
  const { error } = await supabase!.rpc('cerrar_asistencia', { p_sesion: sesionId });
  if (error) return FALLO;
  registrarEvento('asistencia_cerrada', { edicionId: cursoId, entidad: 'sesion', entidadId: sesionId });
  return null;
};

export const codigoVigente = async (sesionId: string): Promise<CodigoVigente | null> => {
  const { data, error } = await supabase!.rpc('codigo_asistencia', { p_sesion: sesionId });
  if (error) return null;
  const fila = (data as { codigo: string; segundos: number }[] | null)?.[0];
  return fila ? { codigo: fila.codigo, segundos: fila.segundos } : null;
};

export const registrosDeSesion = async (sesionId: string): Promise<Map<string, RegistroAsistencia>> => {
  const { data, error } = await supabase!.from('asistencias').select('perfil_id, estado, origen, registrada_en').eq('sesion_id', sesionId);
  if (error) throw error;
  return new Map((data ?? []).map((fila) => [fila.perfil_id as string, { estado: fila.estado as EstadoAsistencia, origen: fila.origen as 'codigo' | 'manual', registradaEn: fila.registrada_en as string }]));
};

export const marcarAsistencia = async (cursoId: string, sesionId: string, perfilId: string, estado: EstadoAsistencia | null): Promise<string | null> => {
  const { error } = estado === null
    ? await supabase!.from('asistencias').delete().eq('sesion_id', sesionId).eq('perfil_id', perfilId)
    : await supabase!.from('asistencias').upsert({ sesion_id: sesionId, perfil_id: perfilId, estado, origen: 'manual', registrada_en: new Date().toISOString() }, { onConflict: 'sesion_id,perfil_id' });
  if (error) return FALLO;
  registrarEvento('asistencia_marcada', { edicionId: cursoId, entidad: 'sesion', entidadId: sesionId, datos: { estado } });
  return null;
};

export const registrarAsistencia = async (cursoId: string, codigo: string, sesionId?: string): Promise<{ error: string | null; sesionId: string | null }> => {
  const { data, error } = await supabase!.rpc('registrar_asistencia', { p_edicion: cursoId, p_codigo: codigo, p_sesion: sesionId ?? null });
  if (error) return { error: error.message.includes('inválido') ? 'Ese código no es válido o ya venció. Pide al docente que te lo muestre de nuevo.' : FALLO, sesionId: null };
  registrarEvento('asistencia_registrada', { edicionId: cursoId, entidad: 'sesion', entidadId: data as string });
  return { error: null, sesionId: data as string };
};

export const misAsistencias = async (): Promise<MiAsistencia[]> => {
  const { data: sesion } = await supabase!.auth.getSession();
  const yo = sesion.session?.user.id;
  if (!yo) return [];
  const { data, error } = await supabase!.from('asistencias').select('sesion_id, estado').eq('perfil_id', yo);
  if (error) throw error;
  return (data ?? []).map((fila) => ({ sesionId: fila.sesion_id as string, estado: fila.estado as EstadoAsistencia }));
};
