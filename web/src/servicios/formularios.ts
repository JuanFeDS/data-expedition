import { registrarEvento } from './eventos';
import { supabase } from './supabase';

export type TipoFormulario = 'relampago' | 'votacion' | 'encuesta';
export type EstadoFormulario = 'borrador' | 'abierto' | 'cerrado';
export type TipoPregunta = 'opcion' | 'escala' | 'texto';

export interface Pregunta {
  id: string;
  orden: number;
  tipo: TipoPregunta;
  enunciado: string;
  opciones: string[];
}

export interface Formulario {
  id: string;
  tipo: TipoFormulario;
  titulo: string;
  anonimo: boolean;
  mostrarResultado: boolean;
  duracionSegundos: number | null;
  estado: EstadoFormulario;
  cierraEn: string | null;
  participantes: number;
  preguntas: Pregunta[];
}

export interface PreguntaNueva { tipo: TipoPregunta; enunciado: string; opciones: string[]; correcta: number | null }
export interface FormularioNuevo { tipo: TipoFormulario; titulo: string; anonimo: boolean; mostrarResultado: boolean; duracionSegundos: number | null; preguntas: PreguntaNueva[] }

export interface ResultadoPregunta {
  preguntaId: string;
  orden: number;
  tipo: TipoPregunta;
  enunciado: string;
  opciones: string[];
  correcta: number | null;
  conteos: Record<string, number>;
  textos: string[];
}

export interface Resultados { total: number; preguntas: ResultadoPregunta[] }
export type Respuesta = { preguntaId: string; opcion?: number; escala?: number; texto?: string };
export interface Participante { perfilId: string; respondidaEn: string }

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';

const COLUMNAS = 'id, tipo, titulo, anonimo, mostrar_resultado, duracion_segundos, estado, cierra_en, participaciones_formulario(count), preguntas_formulario(id, orden, tipo, enunciado, opciones)';

const aFormulario = (fila: Record<string, unknown>): Formulario => ({
  id: fila.id as string,
  tipo: fila.tipo as TipoFormulario,
  titulo: fila.titulo as string,
  anonimo: fila.anonimo as boolean,
  mostrarResultado: fila.mostrar_resultado as boolean,
  duracionSegundos: fila.duracion_segundos as number | null,
  estado: fila.estado as EstadoFormulario,
  cierraEn: fila.cierra_en as string | null,
  participantes: ((fila.participaciones_formulario as { count: number }[] | null)?.[0]?.count) ?? 0,
  preguntas: ((fila.preguntas_formulario as Record<string, unknown>[] | null) ?? [])
    .map((pregunta) => ({ id: pregunta.id as string, orden: pregunta.orden as number, tipo: pregunta.tipo as TipoPregunta, enunciado: pregunta.enunciado as string, opciones: (pregunta.opciones as string[]) ?? [] }))
    .sort((a, b) => a.orden - b.orden),
});

export const listarFormularios = async (cursoId: string): Promise<Formulario[]> => {
  const { data, error } = await supabase!.from('formularios').select(COLUMNAS).eq('edicion_id', cursoId).order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(aFormulario);
};

export const crearFormulario = async (cursoId: string, datos: FormularioNuevo): Promise<string | null> => {
  const { data: sesion } = await supabase!.auth.getSession();
  const { data: creado, error } = await supabase!.from('formularios').insert({
    edicion_id: cursoId, tipo: datos.tipo, titulo: datos.titulo, anonimo: datos.anonimo, mostrar_resultado: datos.mostrarResultado,
    duracion_segundos: datos.duracionSegundos, creado_por: sesion.session?.user.id,
  }).select('id').single();
  if (error || !creado) return FALLO;
  const { data: preguntas, error: falloPreguntas } = await supabase!.from('preguntas_formulario').insert(
    datos.preguntas.map((pregunta, indice) => ({ formulario_id: creado.id, orden: indice + 1, tipo: pregunta.tipo, enunciado: pregunta.enunciado, opciones: pregunta.tipo === 'opcion' ? pregunta.opciones : [] })),
  ).select('id, orden');
  if (falloPreguntas || !preguntas) {
    await supabase!.from('formularios').delete().eq('id', creado.id);
    return FALLO;
  }
  const claves = datos.preguntas
    .map((pregunta, indice) => ({ pregunta_id: preguntas.find((fila) => fila.orden === indice + 1)?.id as string, correcta: pregunta.correcta }))
    .filter((clave): clave is { pregunta_id: string; correcta: number } => clave.correcta !== null);
  if (claves.length > 0) {
    const { error: falloClaves } = await supabase!.from('claves_formulario').insert(claves);
    if (falloClaves) {
      await supabase!.from('formularios').delete().eq('id', creado.id);
      return FALLO;
    }
  }
  registrarEvento('formulario_creado', { edicionId: cursoId, entidad: 'formulario', entidadId: creado.id, datos: { tipo: datos.tipo, preguntas: datos.preguntas.length } });
  return null;
};

export const abrirFormulario = async (cursoId: string, id: string): Promise<string | null> => {
  const { error } = await supabase!.rpc('abrir_formulario', { p_formulario: id });
  if (error) return error.message.includes('preguntas') ? 'El formulario no tiene preguntas.' : FALLO;
  registrarEvento('formulario_abierto', { edicionId: cursoId, entidad: 'formulario', entidadId: id });
  return null;
};

export const cerrarFormulario = async (cursoId: string, id: string): Promise<string | null> => {
  const { error } = await supabase!.rpc('cerrar_formulario', { p_formulario: id });
  if (error) return FALLO;
  registrarEvento('formulario_cerrado', { edicionId: cursoId, entidad: 'formulario', entidadId: id });
  return null;
};

export const eliminarFormulario = async (id: string): Promise<string | null> => {
  const { error } = await supabase!.from('formularios').delete().eq('id', id);
  return error ? FALLO : null;
};

export const resultadosFormulario = async (id: string): Promise<Resultados> => {
  const { data, error } = await supabase!.rpc('resultados_formulario', { p_formulario: id });
  if (error) throw error;
  const crudo = data as { total: number; preguntas: Record<string, unknown>[] };
  return {
    total: crudo.total,
    preguntas: crudo.preguntas.map((pregunta) => ({
      preguntaId: pregunta.pregunta_id as string,
      orden: pregunta.orden as number,
      tipo: pregunta.tipo as TipoPregunta,
      enunciado: pregunta.enunciado as string,
      opciones: (pregunta.opciones as string[]) ?? [],
      correcta: (pregunta.correcta as number | null) ?? null,
      conteos: (pregunta.conteos as Record<string, number>) ?? {},
      textos: (pregunta.textos as string[]) ?? [],
    })),
  };
};

export const participantesFormulario = async (id: string): Promise<Participante[]> => {
  const { data, error } = await supabase!.rpc('participantes_formulario', { p_formulario: id });
  if (error) throw error;
  return ((data ?? []) as { perfil_id: string; respondida_en: string }[]).map((fila) => ({ perfilId: fila.perfil_id, respondidaEn: fila.respondida_en }));
};

export const formulariosAbiertos = async (cursoId: string): Promise<{ abiertos: Formulario[]; respondidos: Set<string> }> => {
  const { data: sesion } = await supabase!.auth.getSession();
  const yo = sesion.session?.user.id;
  const [formularios, mias] = await Promise.all([
    supabase!.from('formularios').select(COLUMNAS).eq('edicion_id', cursoId).eq('estado', 'abierto').order('creado_en', { ascending: false }),
    yo ? supabase!.from('participaciones_formulario').select('formulario_id').eq('perfil_id', yo) : Promise.resolve({ data: [], error: null }),
  ]);
  if (formularios.error || mias.error) throw new Error('Consulta fallida');
  const vigentes = (formularios.data ?? []).map(aFormulario).filter((formulario) => formulario.cierraEn === null || new Date(formulario.cierraEn).getTime() > Date.now());
  return { abiertos: vigentes, respondidos: new Set((mias.data ?? []).map((fila) => fila.formulario_id as string)) };
};

export const responderFormulario = async (cursoId: string, formulario: Formulario, respuestas: Respuesta[]): Promise<{ error: string | null; correctas: number; conClave: number }> => {
  const carga = respuestas.map((respuesta) => ({ pregunta_id: respuesta.preguntaId, opcion: respuesta.opcion ?? null, escala: respuesta.escala ?? null, texto: respuesta.texto ?? null }));
  const { data, error } = await supabase!.rpc('responder_formulario', { p_formulario: formulario.id, p_respuestas: carga });
  if (error) {
    const texto = error.message.includes('Ya respondiste') ? 'Ya respondiste este formulario.' : error.message.includes('cerrado') ? 'Se cerró antes de que enviaras tu respuesta.' : FALLO;
    return { error: texto, correctas: 0, conClave: 0 };
  }
  registrarEvento('formulario_respondido', { edicionId: cursoId, entidad: 'formulario', entidadId: formulario.id, datos: { tipo: formulario.tipo } });
  const resumen = data as { correctas: number; con_clave: number };
  return { error: null, correctas: resumen.correctas, conClave: resumen.con_clave };
};
