import type { PreguntaDatos } from '../compartido/ui/preguntas';
import { META_XP_SEMANA, PREGUNTAS_POR_SESION, XP_POR_SESION } from '../dominio/reglas';
import { registrarEvento } from './eventos';
import type { DimensionCurso, PuntoRadar } from './radar';
import { UMBRAL_NIVELACION, UMBRAL_PROFUNDIZACION } from './radar';
import { supabase } from './supabase';

export type Dificultad = 'base' | 'estandar' | 'reto';
export type Formato = PreguntaDatos['tipo'];

export interface PreguntaBanco { id: string; dimensionId: string; dificultad: Dificultad; datos: PreguntaDatos }
export interface PreguntaImportada { dimensionId: string; dificultad: Dificultad; formato: Formato; contenido: Record<string, unknown>; explicacion: string }
export interface ResultadoImportacion { filas: PreguntaImportada[]; errores: string[] }
export interface ResumenPractica { dias: boolean[]; hoy: number; racha: number; sesionesHoy: number; sesionesSemana: number; xpSemana: number }
export interface ResultadoSesion { xp: number; aciertos: number; total: number }

export { META_XP_SEMANA, PREGUNTAS_POR_SESION, XP_POR_SESION };
export const NOMBRE_DIFICULTAD: Record<Dificultad, string> = { base: 'Base', estandar: 'Estándar', reto: 'Reto' };

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';
const FORMATOS: Formato[] = ['opciones', 'vf', 'unir', 'ordenar', 'completar'];
const DIFICULTADES: Dificultad[] = ['base', 'estandar', 'reto'];

export const dificultadPara = (valor: number): Dificultad => (valor < UMBRAL_NIVELACION ? 'base' : valor > UMBRAL_PROFUNDIZACION ? 'reto' : 'estandar');

const esTexto = (valor: unknown): valor is string => typeof valor === 'string' && valor.trim() !== '';
const esListaTextos = (valor: unknown, minimo: number): valor is string[] => Array.isArray(valor) && valor.length >= minimo && valor.every(esTexto);
const esIndice = (valor: unknown, largo: number): valor is number => Number.isInteger(valor) && (valor as number) >= 0 && (valor as number) < largo;

const validarContenido = (formato: Formato, bruto: Record<string, unknown>): Record<string, unknown> | string => {
  switch (formato) {
    case 'opciones':
      if (!esTexto(bruto.enunciado) || !esListaTextos(bruto.opciones, 2) || !esIndice(bruto.correcta, bruto.opciones.length)) return 'opciones: faltan enunciado, opciones (2 o más) o una «correcta» válida';
      return { enunciado: bruto.enunciado, opciones: bruto.opciones, correcta: bruto.correcta };
    case 'vf':
      if (!esTexto(bruto.enunciado) || typeof bruto.verdadera !== 'boolean' || !esListaTextos(bruto.justificaciones, 2) || !esIndice(bruto.correctaJustificacion, bruto.justificaciones.length)) return 'vf: faltan enunciado, verdadera, justificaciones (2 o más) o correctaJustificacion válida';
      return { enunciado: bruto.enunciado, verdadera: bruto.verdadera, justificaciones: bruto.justificaciones, correctaJustificacion: bruto.correctaJustificacion };
    case 'unir': {
      const pares = bruto.pares;
      if (!esTexto(bruto.enunciado) || !Array.isArray(pares) || pares.length < 2 || !pares.every((par) => par && esTexto((par as Record<string, unknown>).concepto) && esTexto((par as Record<string, unknown>).definicion))) return 'unir: faltan enunciado o pares (2 o más) con concepto y definicion';
      return { enunciado: bruto.enunciado, pares: pares.map((par) => ({ concepto: (par as Record<string, string>).concepto, definicion: (par as Record<string, string>).definicion })) };
    }
    case 'ordenar':
      if (!esTexto(bruto.enunciado) || !esListaTextos(bruto.pasos, 2)) return 'ordenar: faltan enunciado o pasos (2 o más) en el orden correcto';
      return { enunciado: bruto.enunciado, pasos: bruto.pasos };
    case 'completar':
      if (!esTexto(bruto.antes) || !esTexto(bruto.despues) || !esListaTextos(bruto.opciones, 2) || !esIndice(bruto.correcta, bruto.opciones.length)) return 'completar: faltan antes, despues, opciones (2 o más) o una «correcta» válida';
      return { antes: bruto.antes, despues: bruto.despues, opciones: bruto.opciones, correcta: bruto.correcta };
  }
};

const partirCsv = (linea: string) => {
  const celdas: string[] = [];
  let actual = '';
  let entreComillas = false;
  for (let i = 0; i < linea.length; i += 1) {
    const caracter = linea[i];
    if (caracter === '"') {
      if (entreComillas && linea[i + 1] === '"') { actual += '"'; i += 1; } else entreComillas = !entreComillas;
    } else if (caracter === ',' && !entreComillas) { celdas.push(actual.trim()); actual = ''; } else actual += caracter;
  }
  celdas.push(actual.trim());
  return celdas;
};

const desdeCsv = (texto: string): Record<string, unknown>[] => {
  const [cabecera, ...lineas] = texto.split(/\r?\n/).filter((linea) => linea.trim() !== '');
  const columnas = partirCsv(cabecera ?? '').map((columna) => columna.toLowerCase());
  return lineas.map((linea) => {
    const celdas = partirCsv(linea);
    const dato = (nombre: string) => celdas[columnas.indexOf(nombre)] ?? '';
    const opciones = ['a', 'b', 'c', 'd', 'e', 'f'].map(dato).filter(Boolean);
    return { dimension: dato('dimension'), dificultad: dato('dificultad') || 'estandar', tipo: 'opciones', enunciado: dato('enunciado'), opciones, correcta: 'abcdef'.indexOf(dato('correcta').toLowerCase()), explicacion: dato('explicacion') };
  });
};

export const leerBanco = (texto: string, dimensiones: DimensionCurso[]): ResultadoImportacion => {
  const recorte = texto.trim();
  if (recorte === '') return { filas: [], errores: ['Pega las preguntas o sube un archivo.'] };
  let crudas: unknown;
  try {
    crudas = recorte.startsWith('[') ? JSON.parse(recorte) : desdeCsv(recorte);
  } catch {
    return { filas: [], errores: ['El JSON no es válido. Revisa comas y comillas.'] };
  }
  if (!Array.isArray(crudas)) return { filas: [], errores: ['Se esperaba una lista de preguntas.'] };
  const filas: PreguntaImportada[] = [];
  const errores: string[] = [];
  crudas.forEach((cruda, indice) => {
    const etiqueta = `Pregunta ${indice + 1}`;
    const bruto = (cruda ?? {}) as Record<string, unknown>;
    const dimension = dimensiones.find((candidata) => candidata.nombre.toLowerCase() === String(bruto.dimension ?? '').trim().toLowerCase());
    if (!dimension) { errores.push(`${etiqueta}: la dimensión «${String(bruto.dimension ?? '')}» no existe en el curso.`); return; }
    const dificultad = String(bruto.dificultad ?? 'estandar') as Dificultad;
    if (!DIFICULTADES.includes(dificultad)) { errores.push(`${etiqueta}: la dificultad debe ser base, estandar o reto.`); return; }
    const formato = String(bruto.tipo ?? '') as Formato;
    if (!FORMATOS.includes(formato)) { errores.push(`${etiqueta}: el tipo debe ser ${FORMATOS.join(', ')}.`); return; }
    const contenido = validarContenido(formato, bruto);
    if (typeof contenido === 'string') { errores.push(`${etiqueta}: ${contenido}.`); return; }
    filas.push({ dimensionId: dimension.id, dificultad, formato, contenido, explicacion: typeof bruto.explicacion === 'string' ? bruto.explicacion : '' });
  });
  return { filas, errores };
};

export const importarBanco = async (cursoId: string, filas: PreguntaImportada[]): Promise<string | null> => {
  const { error } = await supabase!.from('banco_preguntas').insert(filas.map((fila) => ({ edicion_id: cursoId, dimension_id: fila.dimensionId, dificultad: fila.dificultad, formato: fila.formato, contenido: fila.contenido, explicacion: fila.explicacion })));
  if (error) return FALLO;
  registrarEvento('banco_importado', { edicionId: cursoId, entidad: 'banco', datos: { preguntas: filas.length } });
  return null;
};

export interface FilaBanco { id: string; dimensionId: string; dificultad: Dificultad; formato: Formato; enunciado: string; activa: boolean }

export const listarBanco = async (cursoId: string): Promise<FilaBanco[]> => {
  const { data, error } = await supabase!.from('banco_preguntas').select('id, dimension_id, dificultad, formato, contenido, activa').eq('edicion_id', cursoId).order('creada_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((fila) => {
    const contenido = fila.contenido as Record<string, unknown>;
    return { id: fila.id as string, dimensionId: fila.dimension_id as string, dificultad: fila.dificultad as Dificultad, formato: fila.formato as Formato, enunciado: String(contenido.enunciado ?? `${contenido.antes ?? ''} … ${contenido.despues ?? ''}`), activa: fila.activa as boolean };
  });
};

export const alternarPregunta = async (id: string, activa: boolean): Promise<string | null> => {
  const { error } = await supabase!.from('banco_preguntas').update({ activa }).eq('id', id);
  return error ? FALLO : null;
};

export const eliminarPregunta = async (id: string): Promise<string | null> => {
  const { error } = await supabase!.from('banco_preguntas').delete().eq('id', id);
  return error ? 'No se puede borrar: ya hay respuestas con ella. Desactívala en su lugar.' : null;
};

const permutacion = (largo: number) => {
  const orden = Array.from({ length: largo }, (_, indice) => indice);
  for (let i = largo - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return orden;
};

const aDatos = (formato: Formato, contenido: Record<string, unknown>, explicacion: string): PreguntaDatos => {
  const base = { ...contenido, tipo: formato, explicacion } as unknown as PreguntaDatos;
  if (base.tipo === 'unir') return { ...base, orden: permutacion(base.pares.length) };
  if (base.tipo === 'ordenar') return { ...base, mezcla: permutacion(base.pasos.length) };
  return base;
};

export const cargarBancoActivo = async (cursoId: string): Promise<PreguntaBanco[]> => {
  const { data, error } = await supabase!.from('banco_preguntas').select('id, dimension_id, dificultad, formato, contenido, explicacion').eq('edicion_id', cursoId).eq('activa', true);
  if (error) throw error;
  return (data ?? []).map((fila) => ({ id: fila.id as string, dimensionId: fila.dimension_id as string, dificultad: fila.dificultad as Dificultad, datos: aDatos(fila.formato as Formato, fila.contenido as Record<string, unknown>, fila.explicacion as string) }));
};

export const pesoDeDimension = (punto: PuntoRadar | undefined) => 110 - (punto?.tieneEvidencia ? punto.ahora : 50);

export const armarSesion = (banco: PreguntaBanco[], radar: PuntoRadar[], cantidad = PREGUNTAS_POR_SESION): PreguntaBanco[] => {
  const disponibles = [...banco];
  const elegidas: PreguntaBanco[] = [];
  while (elegidas.length < cantidad && disponibles.length > 0) {
    const dimensiones = [...new Set(disponibles.map((pregunta) => pregunta.dimensionId))];
    const pesos = dimensiones.map((id) => Math.max(10, pesoDeDimension(radar.find((punto) => punto.id === id))));
    let azar = Math.random() * pesos.reduce((total, peso) => total + peso, 0);
    const dimensionId = dimensiones.find((_, indice) => (azar -= pesos[indice]) <= 0) ?? dimensiones[0];
    const punto = radar.find((candidato) => candidato.id === dimensionId);
    const deseada = dificultadPara(punto?.tieneEvidencia ? punto.ahora : 50);
    const deLaDimension = disponibles.filter((pregunta) => pregunta.dimensionId === dimensionId);
    const candidatas = deLaDimension.filter((pregunta) => pregunta.dificultad === deseada);
    const lista = candidatas.length > 0 ? candidatas : deLaDimension;
    const elegida = lista[Math.floor(Math.random() * lista.length)];
    elegidas.push(elegida);
    disponibles.splice(disponibles.indexOf(elegida), 1);
  }
  return elegidas;
};

const diaLocal = (fecha: Date) => `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;

export const miPractica = async (cursoId: string): Promise<ResumenPractica> => {
  const { data: sesion } = await supabase!.auth.getSession();
  const yo = sesion.session?.user.id;
  const desde = new Date(Date.now() - 60 * 86400000).toISOString();
  const { data, error } = yo ? await supabase!.from('practica_sesiones').select('xp, terminada_en').eq('perfil_id', yo).eq('edicion_id', cursoId).gte('terminada_en', desde) : { data: [], error: null };
  if (error) throw error;
  const sesiones = (data ?? []).map((fila) => ({ xp: fila.xp as number, fecha: new Date(fila.terminada_en as string) }));
  const hoyFecha = new Date();
  const dias = new Set(sesiones.map((fila) => diaLocal(fila.fecha)));
  let racha = 0;
  const cursor = new Date(hoyFecha);
  if (!dias.has(diaLocal(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dias.has(diaLocal(cursor))) { racha += 1; cursor.setDate(cursor.getDate() - 1); }
  const lunes = new Date(hoyFecha);
  lunes.setHours(0, 0, 0, 0);
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  const semana = sesiones.filter((fila) => fila.fecha >= lunes);
  const hoy = (hoyFecha.getDay() + 6) % 7;
  const marcas = Array.from({ length: 7 }, (_, indice) => { const dia = new Date(lunes); dia.setDate(lunes.getDate() + indice); return dias.has(diaLocal(dia)); });
  return { dias: marcas, hoy, racha, sesionesHoy: sesiones.filter((fila) => diaLocal(fila.fecha) === diaLocal(hoyFecha)).length, sesionesSemana: semana.length, xpSemana: semana.reduce((total, fila) => total + fila.xp, 0) };
};

export const terminarPractica = async (cursoId: string, respuestas: { preguntaId: string; primerIntento: boolean }[]): Promise<{ resultado: ResultadoSesion | null; error: string | null }> => {
  const { data, error } = await supabase!.rpc('terminar_practica', { p_edicion: cursoId, p_respuestas: respuestas.map((respuesta) => ({ pregunta_id: respuesta.preguntaId, primer_intento: respuesta.primerIntento })) });
  if (error) return { resultado: null, error: FALLO };
  const crudo = data as { xp: number; aciertos: number; total: number };
  registrarEvento('practica_terminada', { edicionId: cursoId, entidad: 'practica', datos: { aciertos: crudo.aciertos, total: crudo.total } });
  return { resultado: { xp: crudo.xp, aciertos: crudo.aciertos, total: crudo.total }, error: null };
};
