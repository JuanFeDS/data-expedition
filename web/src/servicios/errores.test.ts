import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// El módulo guarda un contador y los mensajes recientes a nivel de módulo: cada prueba lo importa de nuevo
// junto con el simulador (que debe ser la misma instancia que usa el módulo).
const cargar = async (modoDemo = false) => {
  vi.resetModules();
  const simulador = await import('../pruebas/supabaseSimulado');
  vi.doMock('./supabase', () => ({ supabase: simulador.supabaseSimulado, modoDemo, hayConexion: true }));
  const { reportarError, instalarReporteDeErrores } = await import('./errores');
  const insertados = () => simulador.operacionesDe('errores_cliente').filter((operacion) => operacion.metodo === 'insert');
  return { reportarError, instalarReporteDeErrores, simular: simulador.simular, insertados };
};

beforeEach(() => { vi.useFakeTimers(); window.location.hash = '#/c/c1/e2'; });
afterEach(() => { vi.useRealTimers(); });

describe('reporte de errores del cliente', () => {
  it('guarda el mensaje, la pila, la ruta y quién fue', async () => {
    const { reportarError, simular, insertados } = await cargar();
    simular({ tablas: { errores_cliente: {} } });
    const error = new Error('algo se rompió');
    await reportarError('interfaz', error, '\n  en Pantalla');
    expect(insertados()).toHaveLength(1);
    expect(insertados()[0].args[0]).toMatchObject({ perfil_id: 'yo', origen: 'interfaz', mensaje: 'algo se rompió', ruta: '#/c/c1/e2' });
    expect((insertados()[0].args[0] as { pila: string }).pila).toContain('en Pantalla');
  });

  it('recorta lo largo para respetar los límites de la tabla', async () => {
    const { reportarError, simular, insertados } = await cargar();
    simular({ tablas: { errores_cliente: {} } });
    await reportarError('ventana', new Error('x'.repeat(900)), 'y'.repeat(6000));
    const fila = insertados()[0].args[0] as { mensaje: string; pila: string };
    expect(fila.mensaje).toHaveLength(500);
    expect(fila.pila.length).toBeLessThanOrEqual(4000);
  });

  it('acepta valores que no son Error', async () => {
    const { reportarError, simular, insertados } = await cargar();
    simular({ tablas: { errores_cliente: {} } });
    await reportarError('promesa', 'fallo de texto');
    expect(insertados()[0].args[0]).toMatchObject({ mensaje: 'fallo de texto', pila: null });
  });

  it('ignora el ruido conocido del navegador', async () => {
    const { reportarError, simular, insertados } = await cargar();
    simular({ tablas: { errores_cliente: {} } });
    await reportarError('ventana', 'ResizeObserver loop completed with undelivered notifications.');
    await reportarError('ventana', 'Script error.');
    await reportarError('ventana', '');
    expect(insertados()).toHaveLength(0);
  });

  it('no repite el mismo mensaje en un minuto, pero sí después', async () => {
    const { reportarError, simular, insertados } = await cargar();
    simular({ tablas: { errores_cliente: {} } });
    await reportarError('ventana', new Error('igual'));
    await reportarError('ventana', new Error('igual'));
    expect(insertados()).toHaveLength(1);
    vi.advanceTimersByTime(61_000);
    await reportarError('ventana', new Error('igual'));
    expect(insertados()).toHaveLength(2);
  });

  it('manda como máximo diez errores por sesión', async () => {
    const { reportarError, simular, insertados } = await cargar();
    simular({ tablas: { errores_cliente: {} } });
    for (let numero = 0; numero < 15; numero += 1) await reportarError('ventana', new Error(`distinto ${numero}`));
    expect(insertados()).toHaveLength(10);
  });

  it('no guarda nada sin sesión', async () => {
    const { reportarError, simular, insertados } = await cargar();
    simular({ usuario: null, tablas: { errores_cliente: {} } });
    await reportarError('ventana', new Error('sin sesión'));
    expect(insertados()).toHaveLength(0);
  });

  it('no guarda nada en modo demo', async () => {
    const { reportarError, simular, insertados } = await cargar(true);
    simular({ tablas: { errores_cliente: {} } });
    await reportarError('ventana', new Error('demo'));
    expect(insertados()).toHaveLength(0);
  });

  it('escucha los errores de la ventana y las promesas rechazadas', async () => {
    const { instalarReporteDeErrores, simular, insertados } = await cargar();
    simular({ tablas: { errores_cliente: {} } });
    instalarReporteDeErrores();
    window.dispatchEvent(new ErrorEvent('error', { error: new Error('de ventana'), message: 'de ventana' }));
    const rechazo = new Event('unhandledrejection') as Event & { reason: unknown };
    rechazo.reason = new Error('de promesa');
    window.dispatchEvent(rechazo);
    await vi.advanceTimersByTimeAsync(10);
    expect(insertados().map((operacion) => (operacion.args[0] as { origen: string }).origen)).toEqual(['ventana', 'promesa']);
  });
});
