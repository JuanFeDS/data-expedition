import { supabase } from './supabase';

export interface TrabajoAgregado { nombre: string; semana: number | null; entregadas: number; aTiempo: number; notas: { bajas: number; medias: number; altas: number; excelentes: number } | null }
export interface DimensionAgregada { nombre: string; ahora: number | null; entrada: number | null }
export interface ResumenAgregado {
  visible: boolean;
  estudiantes: number;
  minimo: number;
  trabajos: TrabajoAgregado[];
  radar: DimensionAgregada[];
  asistencia: number | null;
}
export interface PuestoLiga { usuario: string; xp: number; soyYo: boolean }

export const resumenAgregado = async (cursoId: string): Promise<ResumenAgregado> => {
  const { data, error } = await supabase!.rpc('resumen_agregado', { p_edicion: cursoId });
  if (error) throw error;
  const crudo = data as Record<string, unknown>;
  const trabajos = ((crudo.trabajos as Record<string, unknown>[] | undefined) ?? []).map((fila) => ({
    nombre: fila.nombre as string,
    semana: fila.semana as number | null,
    entregadas: Number(fila.entregadas),
    aTiempo: Number(fila.a_tiempo),
    notas: (fila.notas as TrabajoAgregado['notas']) ?? null,
  }));
  const radar = ((crudo.radar as Record<string, unknown>[] | undefined) ?? []).map((fila) => ({ nombre: fila.nombre as string, ahora: fila.ahora as number | null, entrada: fila.entrada as number | null }));
  return {
    visible: Boolean(crudo.visible),
    estudiantes: Number(crudo.estudiantes),
    minimo: Number(crudo.minimo),
    trabajos,
    radar,
    asistencia: (crudo.asistencia as { porcentaje: number } | null)?.porcentaje ?? null,
  };
};

export const ligaSemanal = async (cursoId: string): Promise<PuestoLiga[]> => {
  const { data, error } = await supabase!.rpc('liga_semanal', { p_edicion: cursoId });
  if (error) throw error;
  return ((data ?? []) as { usuario: string; xp: number; soy_yo: boolean }[]).map((fila) => ({ usuario: fila.usuario, xp: fila.xp, soyYo: fila.soy_yo }));
};
