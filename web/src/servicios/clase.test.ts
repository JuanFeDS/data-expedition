import { beforeEach, describe, expect, it, vi } from 'vitest';
import { llamo, operacionesDe, simular, supabaseSimulado } from '../pruebas/supabaseSimulado';
import { abrirAsistencia, asistenciaAbierta, cerrarAsistencia, codigoVigente, marcarAsistencia, misAsistencias, registrarAsistencia, registrosDeSesion } from './asistencia';
import { eliminarRecurso, eliminarSesion, guardarRecurso, guardarSesion, listarRecursos, listarSesiones, sesionPorId, verificarRecurso } from './calendario';
import { cargarDetalle, guardarDetalle } from './detalleTrabajo';
import { registrarEvento } from './eventos';
import { equiposDeTrabajo, fijarTamanoEquipo, misEquipos, moverMiembro, sortearEquipos, trabajosConEquipo } from './equipos';

vi.mock('./supabase', async () => ({ supabase: (await import('../pruebas/supabaseSimulado')).supabaseSimulado, modoDemo: false, hayConexion: true }));
vi.mock('./eventos', () => ({ registrarEvento: vi.fn() }));

beforeEach(() => { vi.mocked(registrarEvento).mockClear(); });

describe('asistencia', () => {
  it('abre y cierra la asistencia y deja constancia', async () => {
    simular({ rpc: { abrir_asistencia: {}, cerrar_asistencia: {} } });
    expect(await abrirAsistencia('c1', 's1')).toBeNull();
    expect(await cerrarAsistencia('c1', 's1')).toBeNull();
    expect(registrarEvento).toHaveBeenCalledWith('asistencia_abierta', expect.anything());
    expect(registrarEvento).toHaveBeenCalledWith('asistencia_cerrada', expect.anything());
    simular({ rpc: { abrir_asistencia: { error: { message: 'x' } } } });
    expect(await abrirAsistencia('c1', 's1')).toContain('No pudimos');
  });

  it('lee el código vigente y devuelve null si la asistencia está cerrada', async () => {
    simular({ rpc: { codigo_asistencia: { data: [{ codigo: 'AB12CD', segundos: 11 }] } } });
    expect(await codigoVigente('s1')).toEqual({ codigo: 'AB12CD', segundos: 11 });
    simular({ rpc: { codigo_asistencia: { error: { message: 'cerrada' } } } });
    expect(await codigoVigente('s1')).toBeNull();
  });

  it('registra la asistencia y traduce el código vencido', async () => {
    simular({ rpc: { registrar_asistencia: { data: 's1' } } });
    expect(await registrarAsistencia('c1', 'AB12CD', 's1')).toEqual({ error: null, sesionId: 's1' });
    expect(supabaseSimulado.rpc).toHaveBeenCalledWith('registrar_asistencia', { p_edicion: 'c1', p_codigo: 'AB12CD', p_sesion: 's1' });
    simular({ rpc: { registrar_asistencia: { error: { message: 'Código inválido o vencido' } } } });
    const fallido = await registrarAsistencia('c1', 'ZZZZZZ');
    expect(fallido.sesionId).toBeNull();
    expect(fallido.error).toContain('venció');
  });

  it('marca a mano con upsert y quita la marca con delete', async () => {
    simular({ tablas: { asistencias: {} } });
    await marcarAsistencia('c1', 's1', 'p1', 'ausente');
    expect(llamo('asistencias', 'upsert')).toBe(true);
    simular({ tablas: { asistencias: {} } });
    await marcarAsistencia('c1', 's1', 'p1', null);
    expect(llamo('asistencias', 'delete')).toBe(true);
    expect(llamo('asistencias', 'upsert')).toBe(false);
  });

  it('indexa los registros por estudiante y lista los míos', async () => {
    simular({ tablas: { asistencias: { data: [{ perfil_id: 'p1', estado: 'presente', origen: 'codigo', registrada_en: 'x', sesion_id: 's1' }] }, sesiones_asistencia: { data: { abierta: true } } } });
    expect((await registrosDeSesion('s1')).get('p1')).toMatchObject({ estado: 'presente', origen: 'codigo' });
    expect(await asistenciaAbierta('s1')).toBe(true);
    expect(await misAsistencias()).toEqual([{ sesionId: 's1', estado: 'presente' }]);
  });

  it('sin sesión no hay asistencias propias', async () => {
    simular({ usuario: null });
    expect(await misAsistencias()).toEqual([]);
  });
});

describe('calendario', () => {
  const fila = { id: 's1', codigo: 'S1', semana: 2, modalidad: 'virtual', inicia_en: '2026-11-04T23:00:00Z', tema: 'EDA', dinamica: [{ min: '0–10', dinamica: 'x', detalle: '' }] };

  it('mapea sesiones y recursos', async () => {
    simular({ tablas: { sesiones: { data: [fila] }, recursos: { data: [{ id: 'r1', sesion_id: 's1', titulo: 'Guía', enlace: null, tipo: null, idioma: 'EN', gratis: true, verificado_en: null, resumen: null, glosario: ['a'] }] } } });
    expect((await listarSesiones('c1'))[0]).toMatchObject({ id: 's1', iniciaEn: '2026-11-04T23:00:00Z', dinamica: [{ min: '0–10' }] });
    expect((await listarRecursos('c1'))[0]).toMatchObject({ enlace: '', tipo: '', resumen: '', idioma: 'EN', verificadoEn: null });
  });

  it('lee una sesión por id', async () => {
    simular({ tablas: { sesiones: { data: fila } } });
    expect((await sesionPorId('s1'))?.codigo).toBe('S1');
    simular({ tablas: { sesiones: { data: null } } });
    expect(await sesionPorId('x')).toBeNull();
  });

  it('guarda sesiones nuevas con insert y las existentes con update, y avisa de códigos repetidos', async () => {
    const datos = { codigo: 'S1', semana: 1, modalidad: 'virtual' as const, iniciaEn: null, tema: 'x', dinamica: [] };
    simular({ tablas: { sesiones: {} } });
    await guardarSesion('c1', datos);
    expect(llamo('sesiones', 'insert')).toBe(true);
    simular({ tablas: { sesiones: {} } });
    await guardarSesion('c1', { ...datos, id: 's1' });
    expect(llamo('sesiones', 'update')).toBe(true);
    simular({ tablas: { sesiones: { error: { message: 'dup', code: '23505' } } } });
    expect(await guardarSesion('c1', datos)).toBe('Ya existe una sesión con ese código.');
  });

  it('guarda recursos, marca la verificación con fecha y borra', async () => {
    const recurso = { sesionId: null, titulo: 'x', enlace: '', tipo: '', idioma: 'ES' as const, gratis: true, resumen: '', glosario: [] };
    simular({ tablas: { recursos: {} } });
    await guardarRecurso('c1', recurso);
    const insertado = operacionesDe('recursos').find((operacion) => operacion.metodo === 'insert')?.args[0] as Record<string, unknown>;
    expect(insertado).toMatchObject({ enlace: null, tipo: null, resumen: null });
    simular({ tablas: { recursos: {} } });
    await verificarRecurso('r1', true);
    const actualizacion = operacionesDe('recursos').find((operacion) => operacion.metodo === 'update')?.args[0] as { verificado_en: string | null } | undefined;
    expect(actualizacion?.verificado_en).toMatch(/^\d{4}-/);
    simular({ tablas: { recursos: {}, sesiones: {} } });
    expect(await eliminarRecurso('r1')).toBeNull();
    expect(await eliminarSesion('s1')).toBeNull();
  });
});

describe('detalle del trabajo', () => {
  it('lee el detalle y normaliza los textos vacíos', async () => {
    simular({ tablas: { trabajos: { data: { id: 't1', edicion_id: 'c1', nombre: 'T1', tema: null, semana: 2, vence_en: null, min_pylint: 8, tamano_equipo: null, descripcion: null, entregables: null, enlace_base: null } } } });
    expect(await cargarDetalle('t1')).toMatchObject({ tema: '', descripcion: '', entregables: '', enlaceBase: '', tamanoEquipo: null });
    simular({ tablas: { trabajos: { data: null } } });
    expect(await cargarDetalle('nada')).toBeNull();
  });

  it('guarda sin textos vacíos', async () => {
    simular({ tablas: { trabajos: {} } });
    await guardarDetalle('t1', { nombre: 'x', tema: '', semana: null, venceEn: null, minPylint: 8, descripcion: '  ', entregables: 'a', enlaceBase: '' });
    expect(operacionesDe('trabajos').find((operacion) => operacion.metodo === 'update')?.args[0]).toMatchObject({ tema: null, descripcion: null, entregables: 'a', enlace_base: null });
  });
});

describe('equipos', () => {
  it('lista los trabajos con su tamaño de equipo', async () => {
    simular({ tablas: { trabajos: { data: [{ id: 't1', nombre: 'T1', tamano_equipo: 2 }, { id: 't2', nombre: 'T2', tamano_equipo: null }] } } });
    expect(await trabajosConEquipo('c1')).toEqual([{ id: 't1', nombre: 'T1', tamanoEquipo: 2 }, { id: 't2', nombre: 'T2', tamanoEquipo: null }]);
  });

  it('fija el tamaño: con valor es por equipos, sin valor es individual', async () => {
    simular({ tablas: { trabajos: {} } });
    await fijarTamanoEquipo('t1', 3);
    expect(operacionesDe('trabajos').find((operacion) => operacion.metodo === 'update')?.args[0]).toEqual({ por_equipo: true, tamano_equipo: 3 });
    simular({ tablas: { trabajos: {} } });
    await fijarTamanoEquipo('t1', null);
    expect(operacionesDe('trabajos').find((operacion) => operacion.metodo === 'update')?.args[0]).toEqual({ por_equipo: false, tamano_equipo: null });
  });

  it('ordena los equipos por número y lee sus miembros', async () => {
    simular({ tablas: { equipos_trabajo: { data: [{ id: 'e10', nombre: 'Equipo 10', miembros_equipo: [] }, { id: 'e2', nombre: 'Equipo 2', miembros_equipo: [{ perfil_id: 'a' }] }] } } });
    const equipos = await equiposDeTrabajo('t1');
    expect(equipos.map((equipo) => equipo.nombre)).toEqual(['Equipo 2', 'Equipo 10']);
    expect(equipos[0].miembros).toEqual(['a']);
  });

  it('sortea con la función del servidor y traduce el error de curso vacío', async () => {
    simular({ rpc: { sortear_equipos: { data: 3 } } });
    expect(await sortearEquipos('c1', 't1')).toBeNull();
    simular({ rpc: { sortear_equipos: { error: { message: 'No hay estudiantes en el curso' } } } });
    expect(await sortearEquipos('c1', 't1')).toContain('No hay estudiantes');
  });

  it('mueve a una persona quitándola del equipo actual y metiéndola en el nuevo', async () => {
    simular({ tablas: { miembros_equipo: {} } });
    await moverMiembro('t1', 'p1', 'e2');
    expect(operacionesDe('miembros_equipo').map((operacion) => operacion.metodo)).toContain('delete');
    expect(operacionesDe('miembros_equipo').map((operacion) => operacion.metodo)).toContain('insert');
    simular({ tablas: { miembros_equipo: {} } });
    await moverMiembro('t1', 'p1', null);
    expect(llamo('miembros_equipo', 'insert')).toBe(false);
  });

  it('muestra solo los equipos de trabajos en equipo en los que estoy', async () => {
    simular({
      tablas: { trabajos: { data: [{ id: 't1', nombre: 'T1', tamano_equipo: 2 }, { id: 't2', nombre: 'T2', tamano_equipo: null }] } },
      rpc: { mi_equipo: { data: [{ equipo: 'Equipo 1', nombre: 'Ana', usuario: 'ana', soy_yo: true }, { equipo: 'Equipo 1', nombre: 'Luis', usuario: null, soy_yo: false }] } },
    });
    const equipos = await misEquipos('c1');
    expect(equipos).toHaveLength(1);
    expect(equipos[0]).toMatchObject({ trabajoId: 't1', equipo: 'Equipo 1' });
    expect(equipos[0].integrantes.map((integrante) => integrante.soyYo)).toEqual([true, false]);
  });
});
