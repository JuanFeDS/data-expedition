import { dimensionesDelCurso } from './radar';
import { supabase } from './supabase';

export interface Subida { nombre: string; cambio: number }
export interface ResumenSemanal { subidas: Subida[]; vigilar: { nombre: string; valor: number } | null; hayEvidencias: boolean }
export interface PerfilEstudiante { xp: number; sesiones: number; fuerte: { nombre: string; valor: number } | null; evidencias: number }
export interface RelampagoPropio { formularioId: string; titulo: string; fecha: string; acerto: boolean | null }
export interface ParticipacionPropia { formularioId: string; titulo: string; fecha: string; estado: string }
export interface HistoricoPropio { relampagos: RelampagoPropio[]; encuestas: ParticipacionPropia[]; votaciones: ParticipacionPropia[] }

interface FilaEvidencia { dimension_id: string; valor: number | string; peso: number | string; creada_en: string }

const promedio = (filas: FilaEvidencia[]) => {
  const pesos = filas.reduce((total, fila) => total + Number(fila.peso), 0);
  return pesos === 0 ? null : filas.reduce((total, fila) => total + Number(fila.valor) * Number(fila.peso), 0) / pesos;
};

const miId = async () => {
  const { data } = await supabase!.auth.getSession();
  return data.session?.user.id ?? null;
};

const evidenciasPropias = async (cursoId: string) => {
  const yo = await miId();
  const dimensiones = await dimensionesDelCurso(cursoId);
  if (!yo || dimensiones.length === 0) return { dimensiones, filas: [] as FilaEvidencia[] };
  const { data, error } = await supabase!.from('evidencias_radar').select('dimension_id, valor, peso, creada_en').eq('perfil_id', yo).in('dimension_id', dimensiones.map((dimension) => dimension.id));
  if (error) throw error;
  return { dimensiones, filas: (data ?? []) as FilaEvidencia[] };
};

export const miResumenSemanal = async (cursoId: string): Promise<ResumenSemanal> => {
  const { dimensiones, filas } = await evidenciasPropias(cursoId);
  const hace7 = new Date(Date.now() - 7 * 86400000).toISOString();
  const puntos = dimensiones.map((dimension) => {
    const propias = filas.filter((fila) => fila.dimension_id === dimension.id);
    const ahora = promedio(propias);
    const antes = promedio(propias.filter((fila) => fila.creada_en < hace7));
    return { nombre: dimension.nombre, ahora, cambio: ahora !== null && antes !== null ? Math.round(ahora - antes) : 0 };
  });
  const conValor = puntos.filter((punto) => punto.ahora !== null);
  const flojo = [...conValor].sort((a, b) => (a.ahora ?? 0) - (b.ahora ?? 0))[0];
  return {
    subidas: puntos.filter((punto) => punto.cambio > 0).sort((a, b) => b.cambio - a.cambio).slice(0, 3).map((punto) => ({ nombre: punto.nombre, cambio: punto.cambio })),
    vigilar: flojo ? { nombre: flojo.nombre, valor: Math.round(flojo.ahora ?? 0) } : null,
    hayEvidencias: filas.length > 0,
  };
};

export const miPerfil = async (cursoId: string): Promise<PerfilEstudiante> => {
  const yo = await miId();
  const [{ dimensiones, filas }, practica] = await Promise.all([
    evidenciasPropias(cursoId),
    yo ? supabase!.from('practica_sesiones').select('xp').eq('perfil_id', yo).eq('edicion_id', cursoId) : Promise.resolve({ data: [], error: null }),
  ]);
  const sesiones = (practica.data ?? []) as { xp: number }[];
  const puntos = dimensiones.map((dimension) => ({ nombre: dimension.nombre, valor: promedio(filas.filter((fila) => fila.dimension_id === dimension.id)) })).filter((punto): punto is { nombre: string; valor: number } => punto.valor !== null);
  const fuerte = [...puntos].sort((a, b) => b.valor - a.valor)[0];
  return { xp: sesiones.reduce((total, fila) => total + fila.xp, 0), sesiones: sesiones.length, fuerte: fuerte ? { nombre: fuerte.nombre, valor: Math.round(fuerte.valor) } : null, evidencias: filas.length };
};

export const miHistorico = async (cursoId: string): Promise<HistoricoPropio> => {
  const yo = await miId();
  if (!yo) return { relampagos: [], encuestas: [], votaciones: [] };
  const [participaciones, respuestas] = await Promise.all([
    supabase!.from('participaciones_formulario').select('formulario_id, respondida_en, formularios!inner(titulo, tipo, edicion_id)').eq('perfil_id', yo).eq('formularios.edicion_id', cursoId).order('respondida_en', { ascending: false }),
    supabase!.from('respuestas_formulario').select('formulario_id, es_correcta').eq('perfil_id', yo).not('es_correcta', 'is', null),
  ]);
  if (participaciones.error) throw participaciones.error;
  const acierto = new Map((respuestas.data ?? []).map((fila) => [fila.formulario_id as string, fila.es_correcta as boolean]));
  const filas = (participaciones.data ?? []).map((fila) => {
    const formulario = fila.formularios as unknown as { titulo: string; tipo: string };
    return { formularioId: fila.formulario_id as string, titulo: formulario.titulo, tipo: formulario.tipo, fecha: fila.respondida_en as string };
  });
  return {
    relampagos: filas.filter((fila) => fila.tipo === 'relampago').map((fila) => ({ formularioId: fila.formularioId, titulo: fila.titulo, fecha: fila.fecha, acerto: acierto.get(fila.formularioId) ?? null })),
    encuestas: filas.filter((fila) => fila.tipo === 'encuesta').map((fila) => ({ formularioId: fila.formularioId, titulo: fila.titulo, fecha: fila.fecha, estado: 'Enviada' })),
    votaciones: filas.filter((fila) => fila.tipo === 'votacion').map((fila) => ({ formularioId: fila.formularioId, titulo: fila.titulo, fecha: fila.fecha, estado: 'Votaste' })),
  };
};
