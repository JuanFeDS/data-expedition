import { supabase } from './supabase';

export interface DetalleTrabajo {
  id: string;
  edicionId: string;
  nombre: string;
  tema: string;
  semana: number | null;
  venceEn: string | null;
  minPylint: number;
  tamanoEquipo: number | null;
  descripcion: string;
  entregables: string;
  enlaceBase: string;
}

export interface EdicionDetalle {
  nombre: string;
  tema: string;
  semana: number | null;
  venceEn: string | null;
  minPylint: number;
  descripcion: string;
  entregables: string;
  enlaceBase: string;
}

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';

export const cargarDetalle = async (id: string): Promise<DetalleTrabajo | null> => {
  const { data, error } = await supabase!.from('trabajos').select('id, edicion_id, nombre, tema, semana, vence_en, min_pylint, tamano_equipo, descripcion, entregables, enlace_base').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id as string,
    edicionId: data.edicion_id as string,
    nombre: data.nombre as string,
    tema: (data.tema as string | null) ?? '',
    semana: data.semana as number | null,
    venceEn: data.vence_en as string | null,
    minPylint: data.min_pylint as number,
    tamanoEquipo: data.tamano_equipo as number | null,
    descripcion: (data.descripcion as string | null) ?? '',
    entregables: (data.entregables as string | null) ?? '',
    enlaceBase: (data.enlace_base as string | null) ?? '',
  };
};

export const guardarDetalle = async (id: string, datos: EdicionDetalle): Promise<string | null> => {
  const { error } = await supabase!.from('trabajos').update({
    nombre: datos.nombre, tema: datos.tema || null, semana: datos.semana, vence_en: datos.venceEn, min_pylint: datos.minPylint,
    descripcion: datos.descripcion.trim() || null, entregables: datos.entregables.trim() || null, enlace_base: datos.enlaceBase.trim() || null,
  }).eq('id', id);
  return error ? FALLO : null;
};
