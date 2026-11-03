import { beforeEach, describe, expect, it, vi } from 'vitest';
import { llamo, operacionesDe, simular, supabaseSimulado } from '../pruebas/supabaseSimulado';
import { registrarEvento } from './eventos';
import { abrirFormulario, cerrarFormulario, crearFormulario, eliminarFormulario, formulariosAbiertos, listarFormularios, participantesFormulario, resultadosFormulario, responderFormulario, type Formulario } from './formularios';

vi.mock('./supabase', async () => ({ supabase: (await import('../pruebas/supabaseSimulado')).supabaseSimulado, modoDemo: false, hayConexion: true }));
vi.mock('./eventos', () => ({ registrarEvento: vi.fn() }));

const filaFormulario = (extra: Record<string, unknown> = {}) => ({
  id: 'f1', tipo: 'relampago', titulo: 'Spark', anonimo: false, mostrar_resultado: true, duracion_segundos: 60, estado: 'abierto', cierra_en: null,
  participaciones_formulario: [{ count: 3 }],
  preguntas_formulario: [
    { id: 'p2', orden: 2, tipo: 'texto', enunciado: 'Comentario', opciones: [] },
    { id: 'p1', orden: 1, tipo: 'opcion', enunciado: 'Acción', opciones: ['a', 'b'] },
  ],
  ...extra,
});

beforeEach(() => { vi.mocked(registrarEvento).mockClear(); });

describe('listarFormularios', () => {
  it('mapea las columnas, cuenta participantes y ordena las preguntas', async () => {
    simular({ tablas: { formularios: { data: [filaFormulario()] } } });
    const [formulario] = await listarFormularios('c1');
    expect(formulario).toMatchObject({ id: 'f1', tipo: 'relampago', mostrarResultado: true, duracionSegundos: 60, participantes: 3 });
    expect(formulario.preguntas.map((pregunta) => pregunta.id)).toEqual(['p1', 'p2']);
  });

  it('propaga el error de la base', async () => {
    simular({ tablas: { formularios: { error: { message: 'boom' } } } });
    await expect(listarFormularios('c1')).rejects.toMatchObject({ message: 'boom' });
  });
});

describe('crearFormulario', () => {
  const datos = { tipo: 'relampago' as const, titulo: 'x', anonimo: false, mostrarResultado: true, duracionSegundos: 60, preguntas: [{ tipo: 'opcion' as const, enunciado: 'q', opciones: ['a', 'b'], correcta: 1 }] };

  it('crea el formulario, sus preguntas y la clave, y registra el evento', async () => {
    simular({ tablas: { formularios: { data: { id: 'f9' } }, preguntas_formulario: { data: [{ id: 'q9', orden: 1 }] }, claves_formulario: {} } });
    expect(await crearFormulario('c1', datos)).toBeNull();
    expect(llamo('claves_formulario', 'insert')).toBe(true);
    expect(registrarEvento).toHaveBeenCalledWith('formulario_creado', expect.objectContaining({ entidadId: 'f9' }));
  });

  it('borra el formulario si no se pudieron guardar las preguntas', async () => {
    simular({ tablas: { formularios: { data: { id: 'f9' } }, preguntas_formulario: { error: { message: 'no' } } } });
    expect(await crearFormulario('c1', datos)).toContain('No pudimos');
    expect(operacionesDe('formularios').some((operacion) => operacion.metodo === 'delete')).toBe(true);
  });

  it('no inserta claves cuando ninguna pregunta tiene respuesta correcta', async () => {
    simular({ tablas: { formularios: { data: { id: 'f9' } }, preguntas_formulario: { data: [{ id: 'q9', orden: 1 }] } } });
    await crearFormulario('c1', { ...datos, tipo: 'encuesta', preguntas: [{ tipo: 'escala', enunciado: 'q', opciones: [], correcta: null }] });
    expect(llamo('claves_formulario', 'insert')).toBe(false);
  });
});

describe('abrir, cerrar y eliminar', () => {
  it('abre un formulario y avisa si no tiene preguntas', async () => {
    simular({ rpc: { abrir_formulario: {} } });
    expect(await abrirFormulario('c1', 'f1')).toBeNull();
    expect(registrarEvento).toHaveBeenCalledWith('formulario_abierto', expect.anything());
    simular({ rpc: { abrir_formulario: { error: { message: 'El formulario no tiene preguntas' } } } });
    expect(await abrirFormulario('c1', 'f1')).toBe('El formulario no tiene preguntas.');
  });

  it('cierra y elimina informando los errores', async () => {
    simular({ rpc: { cerrar_formulario: { error: { message: 'x' } } }, tablas: { formularios: { error: { message: 'x' } } } });
    expect(await cerrarFormulario('c1', 'f1')).toContain('No pudimos');
    expect(await eliminarFormulario('f1')).toContain('No pudimos');
  });
});

describe('resultados y participantes', () => {
  it('traduce el resultado agregado de la base', async () => {
    simular({ rpc: { resultados_formulario: { data: { total: 4, preguntas: [{ pregunta_id: 'p1', orden: 1, tipo: 'opcion', enunciado: 'q', opciones: ['a', 'b'], correcta: 1, conteos: { 0: 1, 1: 3 }, textos: [] }] } } } });
    const resultados = await resultadosFormulario('f1');
    expect(resultados.total).toBe(4);
    expect(resultados.preguntas[0]).toMatchObject({ preguntaId: 'p1', correcta: 1, conteos: { 0: 1, 1: 3 } });
  });

  it('lista quiénes participaron', async () => {
    simular({ rpc: { participantes_formulario: { data: [{ perfil_id: 'a', respondida_en: '2026-11-03' }] } } });
    expect(await participantesFormulario('f1')).toEqual([{ perfilId: 'a', respondidaEn: '2026-11-03' }]);
  });
});

describe('formulariosAbiertos', () => {
  it('descarta los que ya vencieron y marca los que ya respondí', async () => {
    simular({ tablas: {
      formularios: { data: [filaFormulario({ id: 'vigente', cierra_en: new Date(Date.now() + 60000).toISOString() }), filaFormulario({ id: 'vencido', cierra_en: new Date(Date.now() - 60000).toISOString() }), filaFormulario({ id: 'sin-limite', cierra_en: null })] },
      participaciones_formulario: { data: [{ formulario_id: 'vigente' }] },
    } });
    const { abiertos, respondidos } = await formulariosAbiertos('c1');
    expect(abiertos.map((formulario) => formulario.id)).toEqual(['vigente', 'sin-limite']);
    expect(respondidos.has('vigente')).toBe(true);
  });
});

describe('responderFormulario', () => {
  const formulario = { id: 'f1', tipo: 'relampago' } as Formulario;

  it('envía las respuestas con el formato de la base y devuelve cuántas acertó', async () => {
    simular({ rpc: { responder_formulario: { data: { correctas: 1, con_clave: 1 } } } });
    const resultado = await responderFormulario('c1', formulario, [{ preguntaId: 'p1', opcion: 2 }, { preguntaId: 'p2', texto: 'hola' }]);
    expect(resultado).toEqual({ error: null, correctas: 1, conClave: 1 });
    expect(supabaseSimulado.rpc).toHaveBeenCalledWith('responder_formulario', { p_formulario: 'f1', p_respuestas: [{ pregunta_id: 'p1', opcion: 2, escala: null, texto: null }, { pregunta_id: 'p2', opcion: null, escala: null, texto: 'hola' }] });
  });

  it('traduce los errores conocidos a mensajes para el estudiante', async () => {
    simular({ rpc: { responder_formulario: { error: { message: 'Ya respondiste este formulario' } } } });
    expect((await responderFormulario('c1', formulario, [])).error).toBe('Ya respondiste este formulario.');
    simular({ rpc: { responder_formulario: { error: { message: 'El formulario ya está cerrado' } } } });
    expect((await responderFormulario('c1', formulario, [])).error).toContain('cerró');
    simular({ rpc: { responder_formulario: { error: { message: 'otra cosa' } } } });
    expect((await responderFormulario('c1', formulario, [])).error).toContain('No pudimos');
    expect(registrarEvento).not.toHaveBeenCalled();
  });
});
