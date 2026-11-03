import { useMemo } from 'react';
import { useSesion } from '../componentes/sesion';
import type { ModoIa } from './trabajos';
import { supabase } from './supabase';

export interface Dimension { id: string; nombre: string; descripcion: string; orden: number }

export interface Criterio {
  id: string;
  trabajoId: string;
  dimensionId: string;
  modoIa: ModoIa;
  nombre: string;
  peso: number;
  descriptores: [string, string, string, string, string];
}

export type DatosCriterio = Omit<Criterio, 'id'> & { id?: string };

export interface ServicioRubricas {
  dimensiones: (cursoId: string) => Promise<Dimension[]>;
  cargarPlantilla: (cursoId: string) => Promise<string | null>;
  crearDimension: (cursoId: string, nombre: string, descripcion: string, orden: number) => Promise<string | null>;
  eliminarDimension: (id: string) => Promise<string | null>;
  criterios: (trabajoId: string) => Promise<Criterio[]>;
  guardarCriterio: (criterio: DatosCriterio) => Promise<string | null>;
  eliminarCriterio: (id: string) => Promise<string | null>;
}

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';

const filaACriterio = (fila: Record<string, unknown>): Criterio => ({
  id: fila.id as string,
  trabajoId: fila.trabajo_id as string,
  dimensionId: fila.dimension_id as string,
  modoIa: fila.modo_ia as ModoIa,
  nombre: fila.nombre as string,
  peso: Number(fila.peso),
  descriptores: [fila.descriptor_nivel_1, fila.descriptor_nivel_2, fila.descriptor_nivel_3, fila.descriptor_nivel_4, fila.descriptor_nivel_5] as Criterio['descriptores'],
});

const servicioSupabase: ServicioRubricas = {
  async dimensiones(cursoId) {
    const { data, error } = await supabase!.from('dimensiones').select('id, nombre, descripcion, orden').eq('edicion_id', cursoId).order('orden');
    if (error) throw error;
    return (data ?? []).map((fila) => ({ id: fila.id as string, nombre: fila.nombre as string, descripcion: (fila.descripcion as string | null) ?? '', orden: fila.orden as number }));
  },

  async cargarPlantilla(cursoId) {
    const { data: plantilla } = await supabase!.from('ediciones').select('id').eq('es_plantilla', true).order('creada_en').limit(1);
    const origen = plantilla?.[0]?.id as string | undefined;
    if (!origen) return 'No hay una plantilla de dimensiones para copiar.';
    const { data, error } = await supabase!.from('dimensiones').select('nombre, descripcion, orden').eq('edicion_id', origen).order('orden');
    if (error || !data) return FALLO;
    const { error: falloCopia } = await supabase!.from('dimensiones').insert(data.map((fila) => ({ edicion_id: cursoId, nombre: fila.nombre, descripcion: fila.descripcion, orden: fila.orden })));
    return falloCopia ? FALLO : null;
  },

  async crearDimension(cursoId, nombre, descripcion, orden) {
    const { error } = await supabase!.from('dimensiones').insert({ edicion_id: cursoId, nombre, descripcion: descripcion || null, orden });
    return error ? (error.code === '23505' ? 'Ya existe una dimensión con ese nombre.' : FALLO) : null;
  },

  async eliminarDimension(id) {
    const { error } = await supabase!.from('dimensiones').delete().eq('id', id);
    return error ? 'No se puede eliminar: ya tiene criterios o evidencias.' : null;
  },

  async criterios(trabajoId) {
    const { data, error } = await supabase!.from('criterios').select('*').eq('trabajo_id', trabajoId).order('nombre');
    if (error) throw error;
    return (data ?? []).map(filaACriterio);
  },

  async guardarCriterio(criterio) {
    const fila = {
      trabajo_id: criterio.trabajoId,
      dimension_id: criterio.dimensionId,
      modo_ia: criterio.modoIa,
      nombre: criterio.nombre,
      peso: criterio.peso,
      descriptor_nivel_1: criterio.descriptores[0],
      descriptor_nivel_2: criterio.descriptores[1],
      descriptor_nivel_3: criterio.descriptores[2],
      descriptor_nivel_4: criterio.descriptores[3],
      descriptor_nivel_5: criterio.descriptores[4],
    };
    const { error } = criterio.id ? await supabase!.from('criterios').update(fila).eq('id', criterio.id) : await supabase!.from('criterios').insert(fila);
    return error ? FALLO : null;
  },

  async eliminarCriterio(id) {
    const { error } = await supabase!.from('criterios').delete().eq('id', id);
    return error ? 'No se puede eliminar: ya hay calificaciones con este criterio.' : null;
  },
};

const PLANTILLA_DEMO = ['Datos', 'Análisis', 'Modelado', 'Validación', 'Comunicación', 'Producción', 'Dirección de IA'];

function crearServicioDemo(): ServicioRubricas {
  let dimensiones: Dimension[] = PLANTILLA_DEMO.map((nombre, indice) => ({ id: `dim-${indice + 1}`, nombre, descripcion: '', orden: indice + 1 }));
  let criterios: Criterio[] = [
    { id: 'cri-1', trabajoId: 'T3', dimensionId: 'dim-1', modoIa: 'sin_ia', nombre: 'Transformaciones con PySpark', peso: 2, descriptores: ['No usa DataFrames.', 'Usa DataFrames con ayuda.', 'Transforma con claridad.', 'Optimiza las transformaciones.', 'Transforma, optimiza y explica.'] },
  ];
  return {
    dimensiones: async () => [...dimensiones],
    cargarPlantilla: async () => null,
    crearDimension: async (_curso, nombre, descripcion, orden) => { dimensiones = [...dimensiones, { id: `dim-${dimensiones.length + 1}-${orden}`, nombre, descripcion, orden }]; return null; },
    eliminarDimension: async (id) => { dimensiones = dimensiones.filter((dimension) => dimension.id !== id); return null; },
    criterios: async (trabajoId) => criterios.filter((criterio) => criterio.trabajoId === trabajoId),
    guardarCriterio: async (criterio) => {
      if (criterio.id) criterios = criterios.map((existente) => (existente.id === criterio.id ? { ...criterio, id: criterio.id } : existente));
      else criterios = [...criterios, { ...criterio, id: `cri-${criterios.length + 1}-${Date.now()}` }];
      return null;
    },
    eliminarCriterio: async (id) => { criterios = criterios.filter((criterio) => criterio.id !== id); return null; },
  };
}

const servicioDemo = crearServicioDemo();

export const useServicioRubricas = (): ServicioRubricas => {
  const { modoDemo } = useSesion();
  return useMemo(() => (modoDemo ? servicioDemo : servicioSupabase), [modoDemo]);
};
