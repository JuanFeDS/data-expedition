import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contexto, reiniciarContexto } from '../pruebas/contexto';

vi.mock('../compartido/estado/sesion', async () => (await import('../pruebas/contexto')).sesionSimulada);
vi.mock('../compartido/estado/curso', async () => (await import('../pruebas/contexto')).cursoSimulado);
vi.mock('../servicios/eventos', () => ({ registrarEvento: vi.fn() }));
vi.mock('../servicios/formularios');
vi.mock('../servicios/asistencia');
vi.mock('../servicios/calendario');
vi.mock('../servicios/practica');
vi.mock('../servicios/radar');

import { Asistir } from './asistencia/estudiante/Asistir';
import { E20Responder } from './formularios/estudiante/Responder';
import { E7PracticaReal } from './practica/estudiante/LeccionReal';
import { formulariosAbiertos, resultadosFormulario, responderFormulario, type Formulario } from '../servicios/formularios';
import { misAsistencias, registrarAsistencia } from '../servicios/asistencia';
import { listarSesiones } from '../servicios/calendario';
import { armarSesion, cargarBancoActivo, miPractica, terminarPractica, type PreguntaBanco } from '../servicios/practica';
import { dimensionesDelCurso, miRadar } from '../servicios/radar';

const formulario = (extra: Partial<Formulario> = {}): Formulario => ({
  id: 'f1', tipo: 'relampago', titulo: 'En Spark, ¿qué es una acción?', anonimo: false, mostrarResultado: true, duracionSegundos: null, estado: 'abierto', cierraEn: null, participantes: 0,
  preguntas: [{ id: 'p1', orden: 1, tipo: 'opcion', enunciado: '¿Cuál es una acción?', opciones: ['filter()', 'count()'] }],
  ...extra,
});

beforeEach(() => {
  reiniciarContexto();
  vi.clearAllMocks();
  vi.mocked(resultadosFormulario).mockResolvedValue({ total: 0, preguntas: [] });
  window.location.hash = '#/c/c1/e20';
});

describe('En clase (responder un formulario abierto)', () => {
  it('sin formularios abiertos lo dice', async () => {
    vi.mocked(formulariosAbiertos).mockResolvedValue({ abiertos: [], respondidos: new Set() });
    render(<E20Responder />);
    expect(await screen.findByText('Nada abierto por ahora')).toBeInTheDocument();
  });

  it('con uno solo abierto lo muestra directo y solo deja responder cuando se eligió algo', async () => {
    vi.mocked(formulariosAbiertos).mockResolvedValue({ abiertos: [formulario()], respondidos: new Set() });
    render(<E20Responder />);
    expect(await screen.findByText('¿Cuál es una acción?')).toBeInTheDocument();
    const responder = screen.getByRole('button', { name: /Responder/ });
    expect(responder).toBeDisabled();
    await userEvent.click(screen.getByText(/count\(\)/));
    expect(responder).toBeEnabled();
  });

  it('envía la respuesta elegida y agradece', async () => {
    vi.mocked(formulariosAbiertos).mockResolvedValue({ abiertos: [formulario()], respondidos: new Set() });
    vi.mocked(responderFormulario).mockResolvedValue({ error: null, correctas: 1, conClave: 1 });
    render(<E20Responder />);
    await userEvent.click(await screen.findByText(/count\(\)/));
    vi.mocked(formulariosAbiertos).mockResolvedValue({ abiertos: [formulario()], respondidos: new Set(['f1']) });
    await userEvent.click(screen.getByRole('button', { name: /Responder/ }));
    expect(responderFormulario).toHaveBeenCalledWith('c1', expect.objectContaining({ id: 'f1' }), [{ preguntaId: 'p1', opcion: 1 }]);
    expect(await screen.findByText('¡Gracias!')).toBeInTheDocument();
    expect(screen.getByText(/¡Correcta!/)).toBeInTheDocument();
  });

  it('muestra el error si ya respondió o se cerró', async () => {
    vi.mocked(formulariosAbiertos).mockResolvedValue({ abiertos: [formulario()], respondidos: new Set() });
    vi.mocked(responderFormulario).mockResolvedValue({ error: 'Ya respondiste este formulario.', correctas: 0, conClave: 0 });
    render(<E20Responder />);
    await userEvent.click(await screen.findByText(/count\(\)/));
    await userEvent.click(screen.getByRole('button', { name: /Responder/ }));
    expect(await screen.findByText('Ya respondiste este formulario.')).toBeInTheDocument();
  });

  it('una encuesta con escala y texto libre acepta dejar el texto vacío', async () => {
    const encuesta = formulario({ id: 'f2', tipo: 'encuesta', anonimo: true, preguntas: [{ id: 'q1', orden: 1, tipo: 'escala', enunciado: 'Claridad', opciones: [] }, { id: 'q2', orden: 2, tipo: 'texto', enunciado: 'Comentario', opciones: [] }] });
    vi.mocked(formulariosAbiertos).mockResolvedValue({ abiertos: [encuesta], respondidos: new Set() });
    vi.mocked(responderFormulario).mockResolvedValue({ error: null, correctas: 0, conClave: 0 });
    render(<E20Responder />);
    await userEvent.click(await screen.findByRole('radio', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: /Responder/ }));
    expect(responderFormulario).toHaveBeenCalledWith('c1', expect.anything(), [{ preguntaId: 'q1', escala: 4 }]);
  });

  it('con una votación ya respondida muestra cómo vota el grupo', async () => {
    const votacion = formulario({ id: 'f3', tipo: 'votacion', titulo: 'Librería' });
    vi.mocked(formulariosAbiertos).mockResolvedValue({ abiertos: [votacion], respondidos: new Set(['f3']) });
    vi.mocked(resultadosFormulario).mockResolvedValue({ total: 2, preguntas: [{ preguntaId: 'p1', orden: 1, tipo: 'opcion', enunciado: '¿Cuál es una acción?', opciones: ['filter()', 'count()'], correcta: null, conteos: { 1: 2 }, textos: [] }] });
    render(<E20Responder />);
    expect(await screen.findByText('2 respuestas')).toBeInTheDocument();
  });
});

describe('Asistencia (estudiante)', () => {
  const sesion = { id: 's1', codigo: 'S1', semana: 1, modalidad: 'virtual' as const, iniciaEn: new Date(Date.now() - 86400000).toISOString(), tema: 'Presentación', dinamica: [] };

  beforeEach(() => {
    vi.mocked(listarSesiones).mockResolvedValue([sesion]);
    vi.mocked(misAsistencias).mockResolvedValue([]);
  });

  it('con el enlace del QR registra la asistencia sola', async () => {
    window.location.hash = '#/c/c1/asistir?sesion=s1&codigo=AB12CD';
    vi.mocked(registrarAsistencia).mockResolvedValue({ error: null, sesionId: 's1' });
    render(<Asistir />);
    expect(await screen.findByText('¡Asistencia registrada!')).toBeInTheDocument();
    expect(registrarAsistencia).toHaveBeenCalledWith('c1', 'AB12CD', 's1');
  });

  it('sin enlace pide el código y solo deja registrar con 6 caracteres', async () => {
    render(<Asistir />);
    const entrada = await screen.findByLabelText('Código de asistencia');
    const boton = screen.getByRole('button', { name: 'Registrar' });
    expect(boton).toBeDisabled();
    await userEvent.type(entrada, 'ab12');
    expect(boton).toBeDisabled();
    await userEvent.type(entrada, 'cd');
    expect(entrada).toHaveValue('AB12CD');
    expect(boton).toBeEnabled();
  });

  it('muestra el error cuando el código no sirve y no marca la asistencia', async () => {
    vi.mocked(registrarAsistencia).mockResolvedValue({ error: 'Ese código no es válido o ya venció.', sesionId: null });
    render(<Asistir />);
    await userEvent.type(await screen.findByLabelText('Código de asistencia'), 'ZZZZZZ');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('no es válido');
    expect(screen.queryByText('¡Asistencia registrada!')).toBeNull();
  });

  it('calcula el porcentaje de asistencia con presentes y justificados', async () => {
    const segunda = { ...sesion, id: 's2', codigo: 'S2', iniciaEn: new Date(Date.now() - 2 * 86400000).toISOString() };
    vi.mocked(listarSesiones).mockResolvedValue([sesion, segunda]);
    vi.mocked(misAsistencias).mockResolvedValue([{ sesionId: 's1', estado: 'presente' }, { sesionId: 's2', estado: 'ausente' }]);
    render(<Asistir />);
    expect(await screen.findByText(/50 %/)).toBeInTheDocument();
    expect(screen.getByText('Presente')).toBeInTheDocument();
    expect(screen.getByText('Ausente')).toBeInTheDocument();
  });
});

describe('Práctica (sesión de preguntas)', () => {
  const pregunta = (id: string, correcta: number): PreguntaBanco => ({ id, dimensionId: 'd1', dificultad: 'estandar', datos: { tipo: 'opciones', enunciado: `Pregunta ${id}`, opciones: ['uno', 'dos'], correcta, explicacion: `Explicación ${id}` } });

  beforeEach(() => {
    vi.mocked(dimensionesDelCurso).mockResolvedValue([{ id: 'd1', nombre: 'Datos' }]);
    vi.mocked(miRadar).mockResolvedValue([]);
    vi.mocked(miPractica).mockResolvedValue({ dias: [false, false, false, false, false, false, false], hoy: 0, racha: 1, sesionesHoy: 1, sesionesSemana: 1, xpSemana: 30 });
    window.location.hash = '#/c/c1/e7';
  });

  it('sin preguntas en el banco avisa que el docente aún no las carga', async () => {
    vi.mocked(cargarBancoActivo).mockResolvedValue([]);
    vi.mocked(armarSesion).mockReturnValue([]);
    render(<E7PracticaReal />);
    expect(await screen.findByText('Tu docente aún no carga preguntas de práctica.')).toBeInTheDocument();
  });

  it('acierta todo a la primera y termina con el resultado', async () => {
    const preguntas = [pregunta('a', 0), pregunta('b', 1)];
    vi.mocked(cargarBancoActivo).mockResolvedValue(preguntas);
    vi.mocked(armarSesion).mockReturnValue(preguntas);
    vi.mocked(terminarPractica).mockResolvedValue({ resultado: { xp: 30, aciertos: 2, total: 2 }, error: null });
    render(<E7PracticaReal />);
    await userEvent.click(await screen.findByText('uno'));
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getByText('¡Correcto!')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.click(await screen.findByText('dos'));
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(await screen.findByText('2 de 2 a la primera')).toBeInTheDocument();
    expect(terminarPractica).toHaveBeenCalledWith('c1', [{ preguntaId: 'a', primerIntento: true }, { preguntaId: 'b', primerIntento: true }]);
  });

  it('una pregunta fallada se repite al final y no cuenta como acierto a la primera', async () => {
    const preguntas = [pregunta('a', 0)];
    vi.mocked(cargarBancoActivo).mockResolvedValue(preguntas);
    vi.mocked(armarSesion).mockReturnValue(preguntas);
    vi.mocked(terminarPractica).mockResolvedValue({ resultado: { xp: 30, aciertos: 0, total: 1 }, error: null });
    render(<E7PracticaReal />);
    await userEvent.click(await screen.findByText('dos'));
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getByText('Casi. Lo repasamos al final.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(await screen.findByText('Repaso de lo que fallaste')).toBeInTheDocument();
    await userEvent.click(screen.getByText('uno'));
    await userEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await waitFor(() => expect(terminarPractica).toHaveBeenCalledWith('c1', [{ preguntaId: 'a', primerIntento: false }]));
    expect(await screen.findByText('0 de 1 a la primera')).toBeInTheDocument();
  });

  it('«Comprobar» está deshabilitado hasta elegir una respuesta', async () => {
    const preguntas = [pregunta('a', 0)];
    vi.mocked(cargarBancoActivo).mockResolvedValue(preguntas);
    vi.mocked(armarSesion).mockReturnValue(preguntas);
    render(<E7PracticaReal />);
    expect(await screen.findByRole('button', { name: 'Comprobar' })).toBeDisabled();
  });

  it('si no se pudo cargar el banco muestra el error', async () => {
    vi.mocked(cargarBancoActivo).mockRejectedValue(new Error('red'));
    render(<E7PracticaReal />);
    expect(await screen.findByText(/No pudimos cargar la práctica/)).toBeInTheDocument();
  });

  it('con sesión de otro rol el contexto sigue siendo el de la persona', () => {
    contexto.sesion.persona = { id: 'x', rol: 'estudiante', nombre: null, usuario: 'x', correo: 'x@x.com' };
    expect(contexto.sesion.persona.rol).toBe('estudiante');
  });
});
