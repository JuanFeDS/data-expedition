import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearServicioDemo } from '../demo/personasDemo';
import { crearServicioTrabajosDemo } from '../demo/trabajosDemo';
import { llamo, operacionesDe, simular, supabaseSimulado } from '../pruebas/supabaseSimulado';
import { almacenamientoDeSesion } from './almacenamiento';
import { crearServicioCursosDemo, servicioCursosSupabase } from './cursos';
import { CORREO_VALIDO, correosDeTexto, servicioSupabase } from './personas';
import { guardarProgreso, leerProgreso } from './progreso';

vi.mock('./supabase', async () => ({ supabase: (await import('../pruebas/supabaseSimulado')).supabaseSimulado, modoDemo: false, hayConexion: true }));

describe('correos', () => {
  it('separa por espacios, comas, punto y coma o saltos, en minúsculas y sin repetidos', () => {
    expect(correosDeTexto('Ana@x.com, luis@x.com;\nana@X.com  maria@x.com')).toEqual(['ana@x.com', 'luis@x.com', 'maria@x.com']);
    expect(correosDeTexto('   ')).toEqual([]);
  });

  it('valida el formato del correo', () => {
    ['a@b.co', 'ana.perez@gmail.com'].forEach((correo) => expect(CORREO_VALIDO.test(correo)).toBe(true));
    ['sin-arroba', 'a@b', 'a b@c.com', '@x.com'].forEach((correo) => expect(CORREO_VALIDO.test(correo)).toBe(false));
  });
});

describe('personas (Supabase)', () => {
  it('une docentes y matriculados y oculta las invitaciones de quienes ya se registraron', async () => {
    simular({ tablas: {
      grupos: { data: [{ id: 'g1', nombre: 'A' }] },
      matriculas: { data: [{ grupo_id: 'g1', perfiles: { id: 'p1', correo: 'ana@x.com', nombre: 'Ana', usuario: 'ana', rol: 'estudiante' } }] },
      perfiles: { data: [{ id: 'd1', correo: 'doc@x.com', nombre: 'Doc', usuario: 'doc', rol: 'docente' }] },
      invitaciones: { data: [{ correo: 'ana@x.com', rol: 'estudiante', grupo_id: null }, { correo: 'nuevo@x.com', rol: 'estudiante', grupo_id: null }] },
    } });
    const datos = await servicioSupabase.cargar('c1');
    expect(datos.personas.map((persona) => persona.id).sort()).toEqual(['d1', 'p1']);
    expect(datos.personas.find((persona) => persona.id === 'p1')?.grupoId).toBe('g1');
    expect(datos.invitaciones.map((invitacion) => invitacion.correo)).toEqual(['nuevo@x.com']);
  });

  it('falla si alguna consulta falla', async () => {
    simular({ tablas: { grupos: { error: { message: 'x' } } } });
    await expect(servicioSupabase.cargar('c1')).rejects.toThrow();
  });

  it('invita: matricula a quien ya está registrado e invita al resto', async () => {
    simular({ tablas: { perfiles: { data: [{ id: 'p1', correo: 'ana@x.com' }] }, matriculas: {}, invitaciones: {} } });
    expect(await servicioSupabase.invitar('c1', ['ana@x.com', 'nuevo@x.com'], 'estudiante', 'g1')).toBeNull();
    expect(llamo('matriculas', 'upsert')).toBe(true);
    expect(llamo('invitaciones', 'upsert')).toBe(true);
  });

  it('invita a un docente sin grupo aunque se le haya elegido uno', async () => {
    simular({ tablas: { perfiles: { data: [] }, invitaciones: {} } });
    await servicioSupabase.invitar('c1', ['doc@x.com'], 'docente', 'g1');
    const filas = operacionesDe('invitaciones').find((operacion) => operacion.metodo === 'upsert')?.args[0] as { grupo_id: string | null }[];
    expect(filas[0].grupo_id).toBeNull();
  });

  it('traduce errores: grupo repetido y fallos genéricos', async () => {
    simular({ tablas: { grupos: { error: { message: 'dup', code: '23505' } } } });
    expect(await servicioSupabase.crearGrupo('c1', 'A')).toBe('Ya existe un grupo con ese nombre.');
    simular({ tablas: { grupos: { error: { message: 'otro' } } } });
    expect(await servicioSupabase.crearGrupo('c1', 'A')).toContain('No pudimos');
    simular({ rpc: { asignar_rol: { error: { message: 'x' } } } });
    expect(await servicioSupabase.cambiarRol({ id: 'p1', correo: '', nombre: null, usuario: null, rol: 'estudiante', grupoId: null }, 'docente')).toContain('No pudimos');
  });
});

describe('cursos (Supabase)', () => {
  it('no deja eliminar un curso con personas o trabajos', async () => {
    simular({ tablas: { matriculas: { count: 2 }, trabajos: { count: 0 } } });
    expect(await servicioCursosSupabase.eliminar('c1')).toContain('personas matriculadas');
    simular({ tablas: { matriculas: { count: 0 }, trabajos: { count: 1 } } });
    expect(await servicioCursosSupabase.eliminar('c1')).toContain('trabajos');
  });

  it('elimina un curso vacío', async () => {
    simular({ tablas: { matriculas: { count: 0 }, trabajos: { count: 0 }, ediciones: {} } });
    expect(await servicioCursosSupabase.eliminar('c1')).toBeNull();
    expect(llamo('ediciones', 'delete')).toBe(true);
  });

  it('cuenta estudiantes y grupos por curso', async () => {
    simular({ tablas: { matriculas: { data: [{ edicion_id: 'c1' }, { edicion_id: 'c1' }, { edicion_id: 'c2' }] }, grupos: { data: [{ edicion_id: 'c1' }] } } });
    expect(await servicioCursosSupabase.contar()).toEqual({ c1: { estudiantes: 2, grupos: 1 }, c2: { estudiantes: 1, grupos: 0 } });
  });

  it('crea y actualiza con periodo vacío como nulo y mi grupo sale del nombre', async () => {
    simular({ tablas: { ediciones: {} } });
    await servicioCursosSupabase.crear({ nombre: 'Datos', periodo: '' });
    expect(operacionesDe('ediciones').find((operacion) => operacion.metodo === 'insert')?.args[0]).toEqual({ nombre: 'Datos', periodo: null });
    simular({ tablas: { matriculas: { data: { grupos: { nombre: 'Grupo A' } } } } });
    expect(await servicioCursosSupabase.miGrupo('c1')).toBe('Grupo A');
    simular({ usuario: null });
    expect(await servicioCursosSupabase.miGrupo('c1')).toBeNull();
  });
});

describe('progreso del usuario', () => {
  beforeEach(() => { supabaseSimulado.auth.getSession.mockReset(); });

  it('lee el valor guardado, o null si no hay sesión o hay error', async () => {
    simular({ tablas: { progreso_usuario: { data: { valor: { claves: ['a'] } } } } });
    expect(await leerProgreso('desbloqueos')).toEqual({ claves: ['a'] });
    simular({ usuario: null });
    expect(await leerProgreso('desbloqueos')).toBeNull();
    simular({ tablas: { progreso_usuario: { error: { message: 'x' } } } });
    expect(await leerProgreso('desbloqueos')).toBeNull();
  });

  it('guarda con upsert y nunca lanza aunque la base falle', async () => {
    simular({ tablas: { progreso_usuario: {} } });
    await guardarProgreso('desbloqueos', { claves: ['a'] });
    expect(operacionesDe('progreso_usuario').find((operacion) => operacion.metodo === 'upsert')?.args[0]).toMatchObject({ perfil_id: 'yo', clave: 'desbloqueos' });
    supabaseSimulado.auth.getSession.mockRejectedValue(new Error('red'));
    await expect(guardarProgreso('x', 1)).resolves.toBeUndefined();
  });
});

describe('almacenamiento de la sesión', () => {
  it('guarda en el navegador y devuelve lo guardado', () => {
    almacenamientoDeSesion.setItem('sb-abc-auth-token', 'valor');
    expect(almacenamientoDeSesion.getItem('sb-abc-auth-token')).toBe('valor');
    almacenamientoDeSesion.removeItem('sb-abc-auth-token');
    expect(almacenamientoDeSesion.getItem('sb-abc-auth-token')).toBeNull();
  });

  it('el verificador del login también se guarda en la sesión y en una cookie', () => {
    almacenamientoDeSesion.setItem('sb-abc-auth-token-code-verifier', 'v1');
    window.localStorage.clear();
    expect(almacenamientoDeSesion.getItem('sb-abc-auth-token-code-verifier')).toBe('v1');
    almacenamientoDeSesion.removeItem('sb-abc-auth-token-code-verifier');
    expect(almacenamientoDeSesion.getItem('sb-abc-auth-token-code-verifier')).toBeNull();
  });
});

describe('servicios de demostración', () => {
  it('personas: invitar reemplaza invitaciones, los docentes no llevan grupo y se puede sacar del curso', async () => {
    const servicio = crearServicioDemo();
    await servicio.invitar('c1', ['ana@x.com'], 'estudiante', 'g1');
    await servicio.invitar('c1', ['ana@x.com', 'doc@x.com'], 'docente', 'g1');
    const { invitaciones, personas } = await servicio.cargar('c1');
    expect(invitaciones.filter((invitacion) => invitacion.correo === 'ana@x.com')).toHaveLength(1);
    expect(invitaciones.find((invitacion) => invitacion.correo === 'doc@x.com')?.grupoId).toBeNull();
    const primera = personas[0];
    await servicio.sacarDelCurso('c1', primera);
    expect((await servicio.cargar('c1')).personas.some((persona) => persona.id === primera.id)).toBe(false);
  });

  it('personas: no permite grupos repetidos y cada curso tiene sus datos', async () => {
    const servicio = crearServicioDemo();
    await servicio.crearGrupo('c1', 'Nuevo');
    expect(await servicio.crearGrupo('c1', 'Nuevo')).toBe('Ya existe un grupo con ese nombre.');
    expect((await servicio.cargar('c2')).grupos.some((grupo) => grupo.nombre === 'Nuevo')).toBe(false);
  });

  it('cursos: crea, actualiza y elimina en memoria', async () => {
    const servicio = crearServicioCursosDemo();
    await servicio.crear({ nombre: 'Nuevo', periodo: '2027-1' });
    expect((await servicio.listar()).some((curso) => curso.nombre === 'Nuevo')).toBe(true);
    const creado = (await servicio.listar()).find((curso) => curso.nombre === 'Nuevo')!;
    await servicio.actualizar(creado.id, { nombre: 'Renombrado', periodo: '' });
    expect((await servicio.listar()).find((curso) => curso.id === creado.id)?.nombre).toBe('Renombrado');
    await servicio.eliminar(creado.id);
    expect((await servicio.listar()).some((curso) => curso.id === creado.id)).toBe(false);
  });

  it('trabajos: entregar crea o reemplaza la entrega y crear/eliminar trabajos', async () => {
    const servicio = crearServicioTrabajosDemo();
    const antes = (await servicio.misEntregas('c1')).length;
    await servicio.entregar({ trabajoId: 'T3', enlacePr: 'https://github.com/a/b/pull/1', modoIa: 'sin_ia', bitacora: null });
    await servicio.entregar({ trabajoId: 'T3', enlacePr: 'https://github.com/a/b/pull/2', modoIa: 'con_ia', bitacora: 'x' });
    const entregas = await servicio.misEntregas('c1');
    expect(entregas).toHaveLength(antes + 1);
    expect(entregas.find((entrega) => entrega.trabajoId === 'T3')).toMatchObject({ estado: 'entregada', modoIa: 'con_ia', enlacePr: 'https://github.com/a/b/pull/2' });
    await servicio.crearTrabajo('c1', { nombre: 'Nuevo', tema: '', semana: 9, venceEn: null, minPylint: 8 });
    const trabajos = await servicio.cargarTrabajos('c1');
    const nuevo = trabajos.find((trabajo) => trabajo.nombre === 'Nuevo')!;
    await servicio.eliminarTrabajo(nuevo.id);
    expect((await servicio.cargarTrabajos('c1')).some((trabajo) => trabajo.id === nuevo.id)).toBe(false);
  });
});
