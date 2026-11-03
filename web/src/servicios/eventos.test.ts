import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// El módulo guarda una cola y un contador de fallos a nivel de módulo: en cada prueba se importa de nuevo
// junto con el simulador (que debe ser la misma instancia que usa el módulo).
const cargar = async () => {
  vi.resetModules();
  const simulador = await import('../pruebas/supabaseSimulado');
  vi.doMock('./supabase', () => ({ supabase: simulador.supabaseSimulado, modoDemo: false, hayConexion: true }));
  const { registrarEvento } = await import('./eventos');
  const insertados = () => simulador.operacionesDe('eventos').filter((operacion) => operacion.metodo === 'insert');
  return { registrarEvento, simular: simulador.simular, insertados };
};

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('registro de eventos de uso', () => {
  it('junta los eventos en un solo envío tras la espera', async () => {
    const { registrarEvento, simular, insertados } = await cargar();
    simular({ tablas: { eventos: {} } });
    registrarEvento('pantalla_vista', { edicionId: 'c1', entidad: 'pantalla', entidadId: 'e5' });
    registrarEvento('tutorial_paso', { datos: { paso: 2 } });
    expect(insertados()).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(2600);
    expect(insertados()).toHaveLength(1);
    const lote = insertados()[0].args[0] as Record<string, unknown>[];
    expect(lote).toHaveLength(2);
    expect(lote[0]).toMatchObject({ tipo: 'pantalla_vista', edicion_id: 'c1', entidad: 'pantalla', entidad_id: 'e5', perfil_id: 'yo' });
    expect(lote[1]).toMatchObject({ tipo: 'tutorial_paso', edicion_id: null, datos: { paso: 2 } });
  });

  it('no envía nada sin sesión', async () => {
    const { registrarEvento, simular, insertados } = await cargar();
    simular({ usuario: null, tablas: { eventos: {} } });
    registrarEvento('x');
    await vi.advanceTimersByTimeAsync(2600);
    expect(insertados()).toHaveLength(0);
  });

  it('se apaga tras tres envíos fallidos para no insistir', async () => {
    const { registrarEvento, simular, insertados } = await cargar();
    simular({ tablas: { eventos: { error: { message: 'no' } } } });
    for (let intento = 0; intento < 5; intento += 1) {
      registrarEvento(`e${intento}`);
      await vi.advanceTimersByTimeAsync(2600);
    }
    expect(insertados()).toHaveLength(3);
  });

  it('un envío exitoso reinicia la cuenta de fallos', async () => {
    const { registrarEvento, simular, insertados } = await cargar();
    let falla = true;
    simular({ tablas: { eventos: () => (falla ? { error: { message: 'no' } } : {}) } });
    for (let intento = 0; intento < 2; intento += 1) { registrarEvento('a'); await vi.advanceTimersByTimeAsync(2600); }
    falla = false;
    registrarEvento('b');
    await vi.advanceTimersByTimeAsync(2600);
    falla = true;
    for (let intento = 0; intento < 2; intento += 1) { registrarEvento('c'); await vi.advanceTimersByTimeAsync(2600); }
    expect(insertados()).toHaveLength(5);
  });
});
