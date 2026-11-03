import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contexto, reiniciarContexto } from '../pruebas/contexto';

vi.mock('../compartido/estado/sesion', async () => (await import('../pruebas/contexto')).sesionSimulada);
vi.mock('../compartido/estado/curso', async () => (await import('../pruebas/contexto')).cursoSimulado);
vi.mock('../compartido/estado/confirmar', async () => (await import('../pruebas/contexto')).confirmarSimulado);
vi.mock('../servicios/eventos', () => ({ registrarEvento: vi.fn() }));
vi.mock('../servicios/calificaciones', async (original) => ({ ...(await original<typeof import('../servicios/calificaciones')>()), entregaParaCalificar: vi.fn(), calificar: vi.fn() }));
vi.mock('../servicios/practica', async (original) => ({ ...(await original<typeof import('../servicios/practica')>()), listarBanco: vi.fn(), importarBanco: vi.fn(), alternarPregunta: vi.fn(), eliminarPregunta: vi.fn() }));
vi.mock('../servicios/radar', async (original) => ({ ...(await original<typeof import('../servicios/radar')>()), dimensionesDelCurso: vi.fn() }));
vi.mock('../servicios/formularios');
vi.mock('../servicios/asistencia');
vi.mock('../servicios/calendario', async (original) => ({ ...(await original<typeof import('../servicios/calendario')>()), listarSesiones: vi.fn() }));
vi.mock('../servicios/personas', async (original) => ({ ...(await original<typeof import('../servicios/personas')>()), servicioSupabase: { cargar: vi.fn() } }));
vi.mock('../servicios/detalleTrabajo');
vi.mock('../servicios/equipos');
vi.mock('../servicios/rubricas', () => ({ useServicioRubricas: () => ({ criterios: vi.fn(async () => []) }) }));
vi.mock('qrcode', () => ({ default: { toDataURL: vi.fn(async () => 'data:image/png;base64,AAAA') } }));

import { D4Calificar } from './entregas/docente/Calificar';
import { D15Banco } from './practica/docente/Banco';
import { D16Asistencia } from './asistencia/docente/Asistencia';
import { D5FormulariosReal } from './formularios/docente/FormulariosReal';
import { DetalleTrabajoPantalla } from './trabajos/comun/DetalleTrabajo';
import { abrirAsistencia, asistenciaAbierta, cerrarAsistencia, codigoVigente, marcarAsistencia, registrosDeSesion } from '../servicios/asistencia';
import { calificar, entregaParaCalificar, type EntregaCalificable } from '../servicios/calificaciones';
import { listarSesiones } from '../servicios/calendario';
import { cargarDetalle, guardarDetalle } from '../servicios/detalleTrabajo';
import { misEquipos } from '../servicios/equipos';
import { crearFormulario, listarFormularios, abrirFormulario } from '../servicios/formularios';
import { servicioSupabase as personas } from '../servicios/personas';
import { importarBanco, listarBanco } from '../servicios/practica';
import { dimensionesDelCurso } from '../servicios/radar';

beforeEach(() => {
  reiniciarContexto();
  contexto.sesion.persona = { id: 'doc', rol: 'docente', nombre: 'Profe', usuario: 'profe', correo: 'p@x.com' };
  vi.clearAllMocks();
});

describe('Calificar (docente)', () => {
  const entrega: EntregaCalificable = {
    entregaId: 'e1', trabajoId: 't1', trabajo: 'Trabajo 1', estudiante: 'Ana Pérez', usuario: 'ana', modoIa: 'sin_ia', estado: 'entregada', enlacePr: 'https://github.com/a/b/pull/1', bitacora: null, nota: null, retroalimentacion: '',
    criterios: [
      { id: 'c1', nombre: 'Limpieza', dimension: 'Datos', peso: 2, descriptores: ['uno', 'dos', 'tres', 'cuatro', 'cinco'] },
      { id: 'c2', nombre: 'Código', dimension: 'Producción', peso: 1, descriptores: ['a', 'b', 'c', 'd', 'e'] },
    ],
    niveles: {},
  };

  beforeEach(() => {
    window.location.hash = '#/c/c1/d4?entrega=e1';
    vi.mocked(entregaParaCalificar).mockResolvedValue(entrega);
  });

  it('empieza todos los criterios en 3 y calcula la nota ponderada', async () => {
    render(<D4Calificar />);
    expect(await screen.findByText('Limpieza')).toBeInTheDocument();
    expect(screen.getByText('3.0', { selector: '.num' })).toBeInTheDocument();
  });

  it('subir y bajar medio punto recalcula la nota y muestra el descriptor del nivel', async () => {
    render(<D4Calificar />);
    await screen.findByText('Limpieza');
    await userEvent.click(screen.getByRole('button', { name: 'Subir Limpieza' }));
    await userEvent.click(screen.getByRole('button', { name: 'Subir Limpieza' }));
    await userEvent.click(screen.getByRole('button', { name: 'Subir Limpieza' }));
    await userEvent.click(screen.getByRole('button', { name: 'Subir Limpieza' }));
    expect(screen.getByText('5.0', { selector: 'b' })).toBeInTheDocument();
    expect(screen.getByText('4.3', { selector: '.num' })).toBeInTheDocument();
    for (let veces = 0; veces < 9; veces += 1) await userEvent.click(screen.getByRole('button', { name: 'Bajar Código' }));
    expect(screen.getAllByText('1.0', { selector: 'b' }).length).toBeGreaterThan(0);
  });

  it('guarda la calificación con los niveles y el comentario', async () => {
    vi.mocked(calificar).mockResolvedValue({ nota: 3.7, error: null });
    render(<D4Calificar />);
    await screen.findByText('Limpieza');
    await userEvent.click(screen.getByRole('button', { name: 'Subir Limpieza' }));
    await userEvent.type(screen.getByLabelText('Comentario general'), 'Buen trabajo');
    await userEvent.click(screen.getAllByRole('button', { name: /Guardar calificación/ })[0]);
    expect(calificar).toHaveBeenCalledWith(entrega, { c1: 3.5, c2: 3 }, 'Buen trabajo');
  });

  it('si el trabajo no tiene criterios lo avisa y no deja guardar', async () => {
    vi.mocked(entregaParaCalificar).mockResolvedValue({ ...entrega, criterios: [] });
    render(<D4Calificar />);
    expect(await screen.findByText(/no tiene criterios/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar calificación' })).toBeDisabled();
  });

  it('muestra el error si la base rechaza la calificación', async () => {
    vi.mocked(calificar).mockResolvedValue({ nota: null, error: 'No pudimos guardar la calificación.' });
    render(<D4Calificar />);
    await screen.findByText('Limpieza');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar calificación' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar');
  });

  it('sin entrega en la ruta pide elegir una', async () => {
    window.location.hash = '#/c/c1/d4';
    render(<D4Calificar />);
    expect(await screen.findByText('Elige una entrega')).toBeInTheDocument();
  });
});

describe('Banco de preguntas (docente)', () => {
  const dimensiones = [{ id: 'd1', nombre: 'Validación' }];
  const json = JSON.stringify([{ dimension: 'Validación', tipo: 'opciones', enunciado: '¿Qué?', opciones: ['a', 'b'], correcta: 1 }]);

  beforeEach(() => {
    vi.mocked(dimensionesDelCurso).mockResolvedValue(dimensiones);
    vi.mocked(listarBanco).mockResolvedValue([]);
  });

  const pegar = async (texto: string) => {
    render(<D15Banco />);
    const campo = await screen.findByLabelText('Preguntas en JSON o CSV');
    await userEvent.click(campo);
    await userEvent.paste(texto);
    await userEvent.click(screen.getByRole('button', { name: 'Revisar' }));
  };

  it('revisa el JSON pegado y cuenta las preguntas listas', async () => {
    await pegar(json);
    expect(await screen.findByText('1 pregunta lista para importar')).toBeInTheDocument();
  });

  it('importa solo cuando la revisión está lista', async () => {
    vi.mocked(importarBanco).mockResolvedValue(null);
    await pegar(json);
    await userEvent.click(await screen.findByRole('button', { name: 'Importar 1' }));
    expect(importarBanco).toHaveBeenCalledWith('c1', [expect.objectContaining({ dimensionId: 'd1', formato: 'opciones' })]);
  });

  it('muestra los motivos cuando hay preguntas con errores y no ofrece importarlas', async () => {
    await pegar(JSON.stringify([{ dimension: 'Nada', tipo: 'opciones' }]));
    expect(await screen.findByText(/la dimensión «Nada» no existe/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Importar/ })).toBeNull();
  });

  it('sin dimensiones pide definirlas primero', async () => {
    vi.mocked(dimensionesDelCurso).mockResolvedValue([]);
    render(<D15Banco />);
    expect(await screen.findByText('Define las dimensiones')).toBeInTheDocument();
  });

  it('lista las preguntas del banco con su dimensión y dificultad', async () => {
    vi.mocked(listarBanco).mockResolvedValue([{ id: 'q1', dimensionId: 'd1', dificultad: 'reto', formato: 'vf', enunciado: 'Una pregunta', activa: true }]);
    render(<D15Banco />);
    expect(await screen.findByText('Una pregunta')).toBeInTheDocument();
    expect(screen.getByText(/Validación · Reto · vf/)).toBeInTheDocument();
  });
});

describe('Asistencia (docente)', () => {
  const sesion = { id: 's1', codigo: 'S1', semana: 1, modalidad: 'virtual' as const, iniciaEn: new Date().toISOString(), tema: 'EDA', dinamica: [] };

  beforeEach(() => {
    vi.mocked(listarSesiones).mockResolvedValue([sesion]);
    vi.mocked(personas.cargar).mockResolvedValue({ grupos: [], invitaciones: [], personas: [{ id: 'a', correo: 'a@x.com', nombre: 'Ana', usuario: 'ana', rol: 'estudiante', grupoId: null }, { id: 'b', correo: 'b@x.com', nombre: 'Beto', usuario: 'beto', rol: 'estudiante', grupoId: null }] });
    vi.mocked(registrosDeSesion).mockResolvedValue(new Map());
    vi.mocked(asistenciaAbierta).mockResolvedValue(false);
    vi.mocked(abrirAsistencia).mockResolvedValue(null);
    vi.mocked(cerrarAsistencia).mockResolvedValue(null);
    vi.mocked(marcarAsistencia).mockResolvedValue(null);
  });

  it('sin sesiones manda a crearlas en el calendario', async () => {
    vi.mocked(listarSesiones).mockResolvedValue([]);
    render(<D16Asistencia />);
    expect(await screen.findByText('Agrega una sesión')).toBeInTheDocument();
  });

  it('cerrada ofrece abrir la asistencia y cuenta a los estudiantes', async () => {
    render(<D16Asistencia />);
    expect(await screen.findByText('0 de 2 presentes')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir asistencia' }));
    expect(abrirAsistencia).toHaveBeenCalledWith('c1', 's1');
  });

  it('abierta muestra el código vigente, el QR y la cuenta atrás', async () => {
    vi.mocked(asistenciaAbierta).mockResolvedValue(true);
    vi.mocked(codigoVigente).mockResolvedValue({ codigo: 'AB12CD', segundos: 12 });
    render(<D16Asistencia />);
    expect(await screen.findByText('AB12CD')).toBeInTheDocument();
    expect(screen.getByText('Cambia en 12 s')).toBeInTheDocument();
    expect(await screen.findByAltText('Código QR para registrar asistencia')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar asistencia' }));
    expect(cerrarAsistencia).toHaveBeenCalledWith('c1', 's1');
  });

  it('cuenta los presentes y permite marcar a mano', async () => {
    vi.mocked(registrosDeSesion).mockResolvedValue(new Map([['a', { estado: 'presente' as const, origen: 'codigo' as const, registradaEn: new Date().toISOString() }]]));
    render(<D16Asistencia />);
    expect(await screen.findByText('1 de 2 presentes')).toBeInTheDocument();
    expect(screen.getByText(/Con el código/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Asistencia de Beto' }));
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('Justificado'));
    expect(marcarAsistencia).toHaveBeenCalledWith('c1', 's1', 'b', 'justificado');
  });
});

describe('Formularios (docente)', () => {
  beforeEach(() => {
    vi.mocked(listarFormularios).mockResolvedValue([]);
    vi.mocked(crearFormulario).mockResolvedValue(null);
  });

  it('sin formularios invita a crear el primero', async () => {
    render(<D5FormulariosReal />);
    expect(await screen.findByText(/Aún no hay formularios/)).toBeInTheDocument();
  });

  it('crea un relámpago con su respuesta correcta', async () => {
    render(<D5FormulariosReal />);
    await userEvent.click(await screen.findByRole('button', { name: 'Crear' }));
    await userEvent.type(screen.getByLabelText('Título'), 'Spark');
    await userEvent.type(screen.getByLabelText('Pregunta'), '¿Cuál es una acción?');
    await userEvent.click(screen.getByLabelText(/Opciones, una por línea/));
    await userEvent.paste('filter()\ncount()');
    const crear = screen.getByRole('button', { name: 'Crear formulario' });
    expect(crear).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Respuesta correcta' }));
    await userEvent.click(within(await screen.findByRole('listbox')).getByText(/count\(\)/));
    expect(crear).toBeEnabled();
    await userEvent.click(crear);
    expect(crearFormulario).toHaveBeenCalledWith('c1', expect.objectContaining({
      tipo: 'relampago', titulo: 'Spark', anonimo: false, duracionSegundos: 60,
      preguntas: [{ tipo: 'opcion', enunciado: '¿Cuál es una acción?', opciones: ['filter()', 'count()'], correcta: 1 }],
    }));
  });

  it('una encuesta puede ser anónima, sin respuesta correcta y con varias preguntas', async () => {
    render(<D5FormulariosReal />);
    await userEvent.click(await screen.findByRole('button', { name: 'Crear' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Encuesta' }));
    expect(screen.getByLabelText(/Anónima/)).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Respuesta correcta' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Agregar pregunta' }));
    expect(screen.getAllByLabelText(/^Pregunta/)).toHaveLength(2);
  });

  it('el relámpago no puede ser anónimo', async () => {
    render(<D5FormulariosReal />);
    await userEvent.click(await screen.findByRole('button', { name: 'Crear' }));
    expect(screen.getByLabelText(/Anónima/)).toBeDisabled();
  });

  it('abre un formulario en borrador y muestra el aviso si falla', async () => {
    const borrador = { id: 'f1', tipo: 'encuesta' as const, titulo: 'Pulso', anonimo: true, mostrarResultado: true, duracionSegundos: null, estado: 'borrador' as const, cierraEn: null, participantes: 0, preguntas: [] };
    vi.mocked(listarFormularios).mockResolvedValue([borrador]);
    vi.mocked(abrirFormulario).mockResolvedValue('El formulario no tiene preguntas.');
    render(<D5FormulariosReal />);
    await userEvent.click(await screen.findByRole('button', { name: 'Abrir' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('no tiene preguntas');
  });
});

describe('Detalle del trabajo', () => {
  const detalle = { id: 't1', edicionId: 'c1', nombre: 'Trabajo 1', tema: 'EDA', semana: 2, venceEn: '2026-11-27T23:59:00', minPylint: 8, tamanoEquipo: null as number | null, descripcion: 'Analiza las ventas.', entregables: 'Cuaderno\nREADME', enlaceBase: 'https://github.com/x/y' };

  beforeEach(() => {
    window.location.hash = '#/c/c1/trabajo?trabajo=t1';
    vi.mocked(cargarDetalle).mockResolvedValue(detalle);
    vi.mocked(guardarDetalle).mockResolvedValue(null);
    vi.mocked(listarSesiones).mockResolvedValue([]);
    vi.mocked(misEquipos).mockResolvedValue([]);
  });

  it('el docente edita y guarda la descripción', async () => {
    render(<DetalleTrabajoPantalla />);
    const campo = await screen.findByLabelText(/Descripción/);
    expect(campo).toHaveValue('Analiza las ventas.');
    await userEvent.clear(campo);
    await userEvent.type(campo, 'Nueva');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar detalle' }));
    expect(guardarDetalle).toHaveBeenCalledWith('t1', expect.objectContaining({ nombre: 'Trabajo 1', descripcion: 'Nueva', entregables: 'Cuaderno\nREADME', enlaceBase: 'https://github.com/x/y' }));
    expect(await screen.findByText('Guardado')).toBeInTheDocument();
  });

  it('no deja guardar un enlace que no sea http(s)', async () => {
    render(<DetalleTrabajoPantalla />);
    const enlace = await screen.findByLabelText(/Material de partida/);
    await userEvent.clear(enlace);
    await userEvent.type(enlace, 'ftp://x');
    expect(screen.getByRole('button', { name: 'Guardar detalle' })).toBeDisabled();
  });

  it('el estudiante lo ve de solo lectura, con los entregables como lista', async () => {
    contexto.sesion.persona = { id: 'yo', rol: 'estudiante', nombre: 'Ana', usuario: 'ana', correo: 'a@x.com' };
    render(<DetalleTrabajoPantalla />);
    expect(await screen.findByText('Analiza las ventas.')).toBeInTheDocument();
    expect(screen.getByText('README')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar detalle' })).toBeNull();
    expect(screen.getByText('Individual')).toBeInTheDocument();
  });

  it('sin trabajo en la ruta lo pide', async () => {
    window.location.hash = '#/c/c1/trabajo';
    render(<DetalleTrabajoPantalla />);
    await waitFor(() => expect(screen.getByText(/Elige un trabajo/)).toBeInTheDocument());
  });
});
