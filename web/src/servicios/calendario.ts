import { supabase } from './supabase';

export type Modalidad = 'virtual' | 'presencial';
export type Idioma = 'ES' | 'EN';

export interface MomentoSesion { min: string; dinamica: string; detalle: string }

export interface Sesion {
  id: string;
  codigo: string;
  semana: number | null;
  modalidad: Modalidad;
  iniciaEn: string | null;
  tema: string;
  dinamica: MomentoSesion[];
}

export type DatosSesion = Omit<Sesion, 'id'> & { id?: string };

export interface Recurso {
  id: string;
  sesionId: string | null;
  titulo: string;
  enlace: string;
  tipo: string;
  idioma: Idioma;
  gratis: boolean;
  verificadoEn: string | null;
  resumen: string;
  glosario: string[];
}

export type DatosRecurso = Omit<Recurso, 'id' | 'verificadoEn'> & { id?: string };

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';

export const dinamicaATexto = (momentos: MomentoSesion[]) => momentos.map((momento) => `${momento.min} | ${momento.dinamica} | ${momento.detalle}`).join('\n');

export const textoADinamica = (texto: string): MomentoSesion[] => texto.split('\n')
  .map((linea) => linea.split('|').map((parte) => parte.trim()))
  .filter((partes) => partes[1])
  .map(([min, dinamica, detalle]) => ({ min: min ?? '', dinamica, detalle: detalle ?? '' }));

export const horaLocal = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : '');
export const fechaCorta = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }) : 'sin fecha');
export const fechaAEntrada = (iso: string | null) => {
  if (!iso) return '';
  const fecha = new Date(iso);
  const dos = (valor: number) => String(valor).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
};

const aSesion = (fila: Record<string, unknown>): Sesion => ({
  id: fila.id as string,
  codigo: fila.codigo as string,
  semana: fila.semana as number | null,
  modalidad: fila.modalidad as Modalidad,
  iniciaEn: fila.inicia_en as string | null,
  tema: fila.tema as string,
  dinamica: (fila.dinamica as MomentoSesion[]) ?? [],
});

const aRecurso = (fila: Record<string, unknown>): Recurso => ({
  id: fila.id as string,
  sesionId: fila.sesion_id as string | null,
  titulo: fila.titulo as string,
  enlace: (fila.enlace as string | null) ?? '',
  tipo: (fila.tipo as string | null) ?? '',
  idioma: fila.idioma as Idioma,
  gratis: fila.gratis as boolean,
  verificadoEn: fila.verificado_en as string | null,
  resumen: (fila.resumen as string | null) ?? '',
  glosario: (fila.glosario as string[]) ?? [],
});

export const listarSesiones = async (cursoId: string): Promise<Sesion[]> => {
  const { data, error } = await supabase!.from('sesiones').select('*').eq('edicion_id', cursoId).order('inicia_en', { nullsFirst: false }).order('codigo');
  if (error) throw error;
  return (data ?? []).map(aSesion);
};

export const sesionPorId = async (id: string): Promise<Sesion | null> => {
  const { data, error } = await supabase!.from('sesiones').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? aSesion(data) : null;
};

export const guardarSesion = async (cursoId: string, datos: DatosSesion): Promise<string | null> => {
  const fila = { edicion_id: cursoId, codigo: datos.codigo, semana: datos.semana, modalidad: datos.modalidad, inicia_en: datos.iniciaEn, tema: datos.tema, dinamica: datos.dinamica };
  const { error } = datos.id ? await supabase!.from('sesiones').update(fila).eq('id', datos.id) : await supabase!.from('sesiones').insert(fila);
  return error ? (error.code === '23505' ? 'Ya existe una sesión con ese código.' : FALLO) : null;
};

export const eliminarSesion = async (id: string): Promise<string | null> => {
  const { error } = await supabase!.from('sesiones').delete().eq('id', id);
  return error ? FALLO : null;
};

export const listarRecursos = async (cursoId: string): Promise<Recurso[]> => {
  const { data, error } = await supabase!.from('recursos').select('*').eq('edicion_id', cursoId).order('creado_en');
  if (error) throw error;
  return (data ?? []).map(aRecurso);
};

export const guardarRecurso = async (cursoId: string, datos: DatosRecurso): Promise<string | null> => {
  const fila = { edicion_id: cursoId, sesion_id: datos.sesionId, titulo: datos.titulo, enlace: datos.enlace || null, tipo: datos.tipo || null, idioma: datos.idioma, gratis: datos.gratis, resumen: datos.resumen || null, glosario: datos.glosario };
  const { error } = datos.id ? await supabase!.from('recursos').update(fila).eq('id', datos.id) : await supabase!.from('recursos').insert(fila);
  return error ? FALLO : null;
};

export const verificarRecurso = async (id: string, verificado: boolean): Promise<string | null> => {
  const { error } = await supabase!.from('recursos').update({ verificado_en: verificado ? new Date().toISOString() : null }).eq('id', id);
  return error ? FALLO : null;
};

export const eliminarRecurso = async (id: string): Promise<string | null> => {
  const { error } = await supabase!.from('recursos').delete().eq('id', id);
  return error ? FALLO : null;
};
