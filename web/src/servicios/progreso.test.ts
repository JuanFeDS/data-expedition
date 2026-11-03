import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { operacionesDe, simular, supabaseSimulado } from '../pruebas/supabaseSimulado';
import { ligaSemanal, resumenAgregado } from './agregados';
import { calificar, entregaParaCalificar, miEntregaCalificada } from './calificaciones';
import { registrarEvento } from './eventos';
import { miHistorico, miPerfil, miResumenSemanal } from './estudiante';
import { cargarFicha } from './ficha';
import { META_XP_SEMANA, XP_POR_SESION, miPractica, terminarPractica } from './practica';
import { confirmarRuta, diagnosticosDelCurso, guardarAutoinforme, miDiagnostico, miRadar, registrarDiagnostico, rutaGuardada } from './radar';

vi.mock('./supabase', async () => ({ supabase: (await import('../pruebas/supabaseSimulado')).supabaseSimulado, modoDemo: false, hayConexion: true }));
vi.mock('./eventos', () => ({ registrarEvento: vi.fn() }));

beforeEach(() => { vi.mocked(registrarEvento).mockClear(); });
afterEach(() => { vi.useRealTimers(); });

const dias = (cantidad: number) => new Date(Date.now() - cantidad * 86400000).toISOString();
const dimensiones = [{ id: 'd1', nombre: 'Datos' }, { id: 'd2', nombre: 'Análisis' }];

describe('calificaciones', () => {
  const entregaFila = { id: 'e1', trabajo_id: 't1', modo_ia: 'sin_ia', bitacora: null, estado: 'entregada', nota: null, enlace_pr: 'https://x', retroalimentacion: null, perfiles: { nombre: 'Ana', usuario: 'ana', correo: 'a@x' }, trabajos: { nombre: 'T1' } };
  const criterioFila = { id: 'c1', nombre: 'Limpieza', peso: '2', descriptor_nivel_1: '1', descriptor_nivel_2: '2', descriptor_nivel_3: '3', descriptor_nivel_4: '4', descriptor_nivel_5: '5', dimensiones: { nombre: 'Datos' } };

  it('arma la entrega con sus criterios y los niveles ya puestos', async () => {
    simular({ tablas: { entregas: { data: entregaFila }, criterios: { data: [criterioFila] }, calificaciones: { data: [{ criterio_id: 'c1', nivel: '4.5' }] } } });
    const entrega = await entregaParaCalificar('e1');
    expect(entrega).toMatchObject({ entregaId: 'e1', estudiante: 'Ana', trabajo: 'T1', retroalimentacion: '', niveles: { c1: 4.5 } });
    expect(entrega?.criterios[0]).toMatchObject({ peso: 2, dimension: 'Datos' });
    expect(entrega?.criterios[0].descriptores).toHaveLength(5);
  });

  it('usa el correo cuando no hay nombre y devuelve null si no existe', async () => {
    simular({ tablas: { entregas: { data: { ...entregaFila, perfiles: { nombre: null, usuario: null, correo: 'a@x' } } }, criterios: { data: [] }, calificaciones: { data: [] } } });
    expect((await entregaParaCalificar('e1'))?.estudiante).toBe('a@x');
    simular({ tablas: { entregas: { data: null } } });
    expect(await entregaParaCalificar('nada')).toBeNull();
  });

  it('califica con la función del servidor y registra el evento con la nota', async () => {
    simular({ tablas: { entregas: { data: entregaFila }, criterios: { data: [criterioFila] }, calificaciones: { data: [] } }, rpc: { calificar_entrega: { data: '3.5' } } });
    const entrega = (await entregaParaCalificar('e1'))!;
    const resultado = await calificar(entrega, { c1: 4 }, 'bien');
    expect(resultado).toEqual({ nota: 3.5, error: null });
    expect(supabaseSimulado.rpc).toHaveBeenCalledWith('calificar_entrega', { p_entrega: 'e1', p_niveles: [{ criterio_id: 'c1', nivel: 4 }], p_retroalimentacion: 'bien' });
    expect(registrarEvento).toHaveBeenCalledWith('entrega_calificada', expect.objectContaining({ datos: { nota: 3.5, criterios: 1 } }));
  });

  it('si la base rechaza la calificación devuelve un error y no registra el evento', async () => {
    simular({ tablas: { entregas: { data: entregaFila }, criterios: { data: [] }, calificaciones: { data: [] } }, rpc: { calificar_entrega: { error: { message: 'no' } } } });
    const resultado = await calificar((await entregaParaCalificar('e1'))!, {}, '');
    expect(resultado.nota).toBeNull();
    expect(resultado.error).toContain('No pudimos');
    expect(registrarEvento).not.toHaveBeenCalled();
  });

  it('busca mi propia entrega por trabajo y sin sesión no devuelve nada', async () => {
    simular({ tablas: { entregas: { data: entregaFila }, criterios: { data: [] }, calificaciones: { data: [] } } });
    expect((await miEntregaCalificada('t1'))?.entregaId).toBe('e1');
    simular({ usuario: null });
    expect(await miEntregaCalificada('t1')).toBeNull();
  });
});

describe('radar del estudiante', () => {
  it('calcula mi radar con el punto de partida y el avance', async () => {
    simular({ tablas: { dimensiones: { data: dimensiones }, evidencias_radar: { data: [{ dimension_id: 'd1', fuente: 'diagnostico_inicial', valor: '40', peso: '1' }, { dimension_id: 'd1', fuente: 'trabajo', valor: '80', peso: '2' }] } } });
    const [datos, analisis] = await miRadar('c1');
    expect(datos).toMatchObject({ inicio: 40, ahora: 67, tieneInicio: true });
    expect(analisis.tieneEvidencia).toBe(false);
  });

  it('sin dimensiones o sin sesión devuelve un radar vacío sin consultar evidencias', async () => {
    simular({ tablas: { dimensiones: { data: [] } } });
    expect(await miRadar('c1')).toEqual([]);
    simular({ tablas: { dimensiones: { data: dimensiones } }, usuario: null });
    expect((await miRadar('c1')).every((punto) => !punto.tieneEvidencia)).toBe(true);
    expect(operacionesDe('evidencias_radar')).toHaveLength(0);
  });

  it('lee mi diagnóstico y guarda el autoinforme con el formato de la base', async () => {
    simular({ tablas: { dimensiones: { data: dimensiones }, diagnosticos: { data: [{ dimension_id: 'd1', autoinforme: 4, con_ia: null, sin_ia: '55' }] } } });
    const { filas } = await miDiagnostico('c1');
    expect(filas[0]).toEqual({ dimensionId: 'd1', autoinforme: 4, conIa: null, sinIa: 55 });
    simular({ rpc: { guardar_autoinforme: {} } });
    expect(await guardarAutoinforme('c1', { d1: 4, d2: 2 })).toBeNull();
    expect(supabaseSimulado.rpc).toHaveBeenCalledWith('guardar_autoinforme', { p_valores: [{ dimension_id: 'd1', autoinforme: 4 }, { dimension_id: 'd2', autoinforme: 2 }] });
    expect(registrarEvento).toHaveBeenCalledWith('autoinforme_guardado', expect.anything());
  });

  it('agrupa los diagnósticos del curso por estudiante y registra el del docente', async () => {
    simular({ tablas: { dimensiones: { data: dimensiones }, diagnosticos: { data: [{ perfil_id: 'a', dimension_id: 'd1', autoinforme: null, con_ia: '80', sin_ia: '50' }, { perfil_id: 'a', dimension_id: 'd2', autoinforme: null, con_ia: null, sin_ia: '30' }, { perfil_id: 'b', dimension_id: 'd1', autoinforme: 3, con_ia: null, sin_ia: null }] } } });
    const mapa = await diagnosticosDelCurso('c1');
    expect(mapa.get('a')).toHaveLength(2);
    expect(mapa.get('b')).toHaveLength(1);
    simular({ rpc: { registrar_diagnostico: {} } });
    expect(await registrarDiagnostico('c1', 'a', [{ dimensionId: 'd1', conIa: 80, sinIa: 50 }])).toBeNull();
    expect(supabaseSimulado.rpc).toHaveBeenCalledWith('registrar_diagnostico', { p_perfil: 'a', p_valores: [{ dimension_id: 'd1', con_ia: 80, sin_ia: 50 }] });
  });

  it('lee y confirma la ruta del curso', async () => {
    simular({ tablas: { ediciones: { data: { ruta_curso: 'estandar' } } } });
    expect(await rutaGuardada('c1')).toBe('estandar');
    simular({ tablas: { ediciones: { data: null } } });
    expect(await rutaGuardada('c1')).toBeNull();
    simular({ tablas: { ediciones: {} } });
    expect(await confirmarRuta('c1', 'nivelacion')).toBeNull();
    expect(operacionesDe('ediciones').find((operacion) => operacion.metodo === 'update')?.args[0]).toEqual({ ruta_curso: 'nivelacion' });
  });
});

describe('práctica', () => {
  it('calcula la racha, los días de la semana y el XP de la semana', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 4, 12, 0)); // miércoles
    const hoy = new Date(2026, 10, 4, 9, 0).toISOString();
    const ayer = new Date(2026, 10, 3, 9, 0).toISOString();
    const antes = new Date(2026, 10, 2, 9, 0).toISOString(); // lunes
    const viejo = new Date(2026, 9, 20, 9, 0).toISOString();
    simular({ tablas: { practica_sesiones: { data: [{ xp: 30, terminada_en: hoy }, { xp: 30, terminada_en: hoy }, { xp: 30, terminada_en: ayer }, { xp: 30, terminada_en: antes }, { xp: 30, terminada_en: viejo }] } } });
    const resumen = await miPractica('c1');
    expect(resumen.racha).toBe(3);
    expect(resumen.hoy).toBe(2);
    expect(resumen.dias).toEqual([true, true, true, false, false, false, false]);
    expect(resumen.sesionesHoy).toBe(2);
    expect(resumen.sesionesSemana).toBe(4);
    expect(resumen.xpSemana).toBe(120);
  });

  it('la racha sigue viva si hoy aún no practicaste pero ayer sí, y se corta con un día vacío', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 4, 12, 0));
    simular({ tablas: { practica_sesiones: { data: [{ xp: 30, terminada_en: new Date(2026, 10, 3, 9, 0).toISOString() }, { xp: 30, terminada_en: new Date(2026, 10, 2, 9, 0).toISOString() }] } } });
    expect((await miPractica('c1')).racha).toBe(2);
    simular({ tablas: { practica_sesiones: { data: [{ xp: 30, terminada_en: new Date(2026, 10, 2, 9, 0).toISOString() }] } } });
    expect((await miPractica('c1')).racha).toBe(0);
  });

  it('termina la práctica enviando el primer intento de cada pregunta', async () => {
    simular({ rpc: { terminar_practica: { data: { xp: XP_POR_SESION, aciertos: 1, total: 2 } } } });
    const { resultado, error } = await terminarPractica('c1', [{ preguntaId: 'a', primerIntento: true }, { preguntaId: 'b', primerIntento: false }]);
    expect(error).toBeNull();
    expect(resultado).toEqual({ xp: 30, aciertos: 1, total: 2 });
    expect(supabaseSimulado.rpc).toHaveBeenCalledWith('terminar_practica', { p_edicion: 'c1', p_respuestas: [{ pregunta_id: 'a', primer_intento: true }, { pregunta_id: 'b', primer_intento: false }] });
    expect(META_XP_SEMANA).toBeGreaterThan(XP_POR_SESION);
  });

  it('si no se pudo guardar no devuelve resultado', async () => {
    simular({ rpc: { terminar_practica: { error: { message: 'x' } } } });
    expect((await terminarPractica('c1', [])).resultado).toBeNull();
  });
});

describe('perfil, resumen e historial del estudiante', () => {
  it('el resumen semanal separa lo que subió esta semana y señala la dimensión más baja', async () => {
    simular({ tablas: { dimensiones: { data: dimensiones }, evidencias_radar: { data: [
      { dimension_id: 'd1', valor: '40', peso: '1', creada_en: dias(20) },
      { dimension_id: 'd1', valor: '80', peso: '1', creada_en: dias(1) },
      { dimension_id: 'd2', valor: '30', peso: '1', creada_en: dias(10) },
    ] } } });
    const resumen = await miResumenSemanal('c1');
    expect(resumen.subidas).toEqual([{ nombre: 'Datos', cambio: 20 }]);
    expect(resumen.vigilar).toEqual({ nombre: 'Análisis', valor: 30 });
    expect(resumen.hayEvidencias).toBe(true);
  });

  it('el perfil suma el XP y elige la dimensión más fuerte', async () => {
    simular({ tablas: { dimensiones: { data: dimensiones }, evidencias_radar: { data: [{ dimension_id: 'd1', valor: '90', peso: '1', creada_en: dias(1) }, { dimension_id: 'd2', valor: '50', peso: '1', creada_en: dias(1) }] }, practica_sesiones: { data: [{ xp: 30 }, { xp: 30 }] } } });
    expect(await miPerfil('c1')).toEqual({ xp: 60, sesiones: 2, fuerte: { nombre: 'Datos', valor: 90 }, evidencias: 2 });
  });

  it('el historial reparte las participaciones por tipo y marca los aciertos', async () => {
    simular({ tablas: {
      participaciones_formulario: { data: [
        { formulario_id: 'f1', respondida_en: '2026-11-01', formularios: { titulo: 'Relámpago', tipo: 'relampago' } },
        { formulario_id: 'f2', respondida_en: '2026-11-02', formularios: { titulo: 'Pulso', tipo: 'encuesta' } },
        { formulario_id: 'f3', respondida_en: '2026-11-03', formularios: { titulo: 'Voto', tipo: 'votacion' } },
      ] },
      respuestas_formulario: { data: [{ formulario_id: 'f1', es_correcta: true }] },
    } });
    const historico = await miHistorico('c1');
    expect(historico.relampagos).toEqual([{ formularioId: 'f1', titulo: 'Relámpago', fecha: '2026-11-01', acerto: true }]);
    expect(historico.encuestas[0].estado).toBe('Enviada');
    expect(historico.votaciones[0].estado).toBe('Votaste');
  });

  it('sin sesión el historial está vacío', async () => {
    simular({ usuario: null });
    expect(await miHistorico('c1')).toEqual({ relampagos: [], encuestas: [], votaciones: [] });
  });
});

describe('ficha del docente y agregados', () => {
  it('reúne radar, notas, asistencia, práctica y diagnóstico de un estudiante', async () => {
    simular({ tablas: {
      dimensiones: { data: dimensiones },
      evidencias_radar: { data: [{ dimension_id: 'd1', fuente: 'trabajo', valor: '70', peso: '1' }] },
      entregas: { data: [{ trabajo_id: 't1', estado: 'calificada', modo_ia: 'sin_ia', nota: '4.2', trabajos: { nombre: 'T1', semana: 2 } }] },
      asistencias: { data: [{ sesion_id: 's1', estado: 'presente' }, { sesion_id: 's2', estado: 'ausente' }, { sesion_id: 's3', estado: 'justificado' }] },
      sesiones: { data: [{ id: 's1', inicia_en: dias(5) }, { id: 's2', inicia_en: dias(3) }, { id: 's3', inicia_en: dias(1) }, { id: 's4', inicia_en: new Date(Date.now() + 86400000).toISOString() }] },
      practica_sesiones: { data: [{ xp: 30, terminada_en: dias(1) }, { xp: 30, terminada_en: dias(20) }] },
      diagnosticos: { count: 2 },
    } });
    const ficha = await cargarFicha('c1', 'p1');
    expect(ficha.entregas).toEqual([{ trabajoId: 't1', trabajo: 'T1', semana: 2, estado: 'calificada', modoIa: 'sin_ia', nota: 4.2 }]);
    expect(ficha.asistencia).toEqual({ dadas: 3, cuentan: 2, ausentes: 1 });
    expect(ficha.practica).toEqual({ sesiones: 2, xp: 60, sesionesSemana: 1 });
    expect(ficha.diagnosticoRegistrado).toBe(true);
    expect(ficha.radar[0].ahora).toBe(70);
  });

  it('traduce el resumen agregado y respeta cuando no es visible', async () => {
    simular({ rpc: { resumen_agregado: { data: { visible: false, estudiantes: 3, minimo: 5 } } } });
    expect(await resumenAgregado('c1')).toMatchObject({ visible: false, estudiantes: 3, minimo: 5, trabajos: [], radar: [], asistencia: null });
    simular({ rpc: { resumen_agregado: { data: { visible: true, estudiantes: 8, minimo: 5, trabajos: [{ nombre: 'T1', semana: 2, entregadas: '7', a_tiempo: '6', notas: { bajas: 0, medias: 2, altas: 4, excelentes: 1 } }], radar: [{ nombre: 'Datos', ahora: 60, entrada: null }], asistencia: { porcentaje: 88 } } } } });
    const resumen = await resumenAgregado('c1');
    expect(resumen.trabajos[0]).toMatchObject({ entregadas: 7, aTiempo: 6 });
    expect(resumen.asistencia).toBe(88);
  });

  it('la liga devuelve usuario, XP y quién soy', async () => {
    simular({ rpc: { liga_semanal: { data: [{ usuario: 'ana', xp: 60, soy_yo: true }, { usuario: 'luis', xp: 30, soy_yo: false }] } } });
    expect(await ligaSemanal('c1')).toEqual([{ usuario: 'ana', xp: 60, soyYo: true }, { usuario: 'luis', xp: 30, soyYo: false }]);
  });
});
