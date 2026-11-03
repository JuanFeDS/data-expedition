import { registrarEvento } from './eventos';
import { supabase } from './supabase';

export interface TrabajoConEquipo { id: string; nombre: string; tamanoEquipo: number | null }
export interface Equipo { id: string; nombre: string; miembros: string[] }
export interface IntegranteEquipo { nombre: string; usuario: string | null; soyYo: boolean }
export interface MiEquipo { trabajoId: string; equipo: string; integrantes: IntegranteEquipo[] }

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';

export const trabajosConEquipo = async (cursoId: string): Promise<TrabajoConEquipo[]> => {
  const { data, error } = await supabase!.from('trabajos').select('id, nombre, tamano_equipo').eq('edicion_id', cursoId).eq('es_diagnostico', false).order('semana').order('vence_en');
  if (error) throw error;
  return (data ?? []).map((fila) => ({ id: fila.id as string, nombre: fila.nombre as string, tamanoEquipo: fila.tamano_equipo as number | null }));
};

export const fijarTamanoEquipo = async (trabajoId: string, tamano: number | null): Promise<string | null> => {
  const { error } = await supabase!.from('trabajos').update({ por_equipo: tamano !== null, tamano_equipo: tamano }).eq('id', trabajoId);
  return error ? FALLO : null;
};

export const equiposDeTrabajo = async (trabajoId: string): Promise<Equipo[]> => {
  const { data, error } = await supabase!.from('equipos_trabajo').select('id, nombre, miembros_equipo(perfil_id)').eq('trabajo_id', trabajoId).order('nombre');
  if (error) throw error;
  return (data ?? []).map((fila) => ({
    id: fila.id as string,
    nombre: fila.nombre as string,
    miembros: ((fila.miembros_equipo as { perfil_id: string }[] | null) ?? []).map((miembro) => miembro.perfil_id),
  })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }));
};

export const sortearEquipos = async (cursoId: string, trabajoId: string): Promise<string | null> => {
  const { error } = await supabase!.rpc('sortear_equipos', { p_trabajo: trabajoId });
  if (error) return error.message.includes('No hay estudiantes') ? 'No hay estudiantes en el curso para sortear.' : FALLO;
  registrarEvento('equipos_sorteados', { edicionId: cursoId, entidad: 'trabajo', entidadId: trabajoId });
  return null;
};

export const moverMiembro = async (trabajoId: string, perfilId: string, equipoId: string | null): Promise<string | null> => {
  const { error: falloQuitar } = await supabase!.from('miembros_equipo').delete().eq('trabajo_id', trabajoId).eq('perfil_id', perfilId);
  if (falloQuitar) return FALLO;
  if (equipoId === null) return null;
  const { error } = await supabase!.from('miembros_equipo').insert({ equipo_id: equipoId, trabajo_id: trabajoId, perfil_id: perfilId });
  return error ? FALLO : null;
};

export const misEquipos = async (cursoId: string): Promise<MiEquipo[]> => {
  const trabajos = (await trabajosConEquipo(cursoId)).filter((trabajo) => trabajo.tamanoEquipo !== null);
  const filas = await Promise.all(trabajos.map(async (trabajo) => {
    const { data, error } = await supabase!.rpc('mi_equipo', { p_trabajo: trabajo.id });
    if (error) throw error;
    const integrantes = ((data ?? []) as { equipo: string; nombre: string; usuario: string | null; soy_yo: boolean }[]);
    return integrantes.length > 0 ? { trabajoId: trabajo.id, equipo: integrantes[0].equipo, integrantes: integrantes.map((fila) => ({ nombre: fila.nombre, usuario: fila.usuario, soyYo: fila.soy_yo })) } : null;
  }));
  return filas.filter((fila): fila is MiEquipo => fila !== null);
};
