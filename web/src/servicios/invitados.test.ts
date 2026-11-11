import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./supabase', async () => ({ supabase: (await import('../pruebas/supabaseSimulado')).supabaseSimulado, modoDemo: false, hayConexion: true }));

import { supabaseSimulado, simular } from '../pruebas/supabaseSimulado';
import { abrirClase, cerrarClase, enlaceDeEntrada, entrarComoInvitado, estadoClase, limpiarCodigo, marcadorDeClase } from './invitados';

beforeEach(() => { window.location.hash = ''; });

describe('código de la clase', () => {
  it('lo normaliza: mayúsculas, sin 0 ni 1 y de 5 caracteres como máximo', () => {
    expect(limpiarCodigo(' ab-c2d3x ')).toBe('ABC2D');
    expect(limpiarCodigo('a0b1c')).toBe('ABC');
    expect(limpiarCodigo('')).toBe('');
  });

  it('arma el enlace de entrada con el código', () => {
    expect(enlaceDeEntrada('ABC23')).toContain('#/entrar?codigo=ABC23');
  });
});

describe('entrar como invitado', () => {
  it('abre una sesión anónima y entra al curso con el código y el apodo', async () => {
    simular({ usuario: null, rpc: { unirse_como_invitado: { data: 'curso-1' } } });
    const resultado = await entrarComoInvitado('abc23', 'Ana');
    expect(resultado).toEqual({ ok: true, cursoId: 'curso-1' });
    expect(supabaseSimulado.auth.signInAnonymously).toHaveBeenCalledTimes(1);
    expect(supabaseSimulado.rpc).toHaveBeenCalledWith('unirse_como_invitado', { p_codigo: 'ABC23', p_apodo: 'Ana' });
  });

  it('reutiliza la sesión de invitado que ya tenía el navegador', async () => {
    simular({ usuario: 'inv-1', rpc: { unirse_como_invitado: { data: 'curso-1' } } });
    await entrarComoInvitado('ABC23', 'Ana');
    expect(supabaseSimulado.auth.signInAnonymously).not.toHaveBeenCalled();
  });

  it.each([
    ['codigo_invalido', /no es válido o la clase ya cerró/],
    ['El apodo debe tener entre 2 y 20 caracteres', /apodo debe tener/],
    ['Esta entrada es solo para invitados', /Ya iniciaste sesión/],
  ])('traduce el error «%s»', async (mensaje, esperado) => {
    simular({ usuario: 'yo', rpc: { unirse_como_invitado: { error: { message: mensaje } } } });
    const resultado = await entrarComoInvitado('ABC23', 'Ana');
    expect(resultado.ok).toBe(false);
    expect(resultado.ok === false && resultado.mensaje).toMatch(esperado);
  });

  it('avisa si el ingreso anónimo no está activo en Supabase', async () => {
    simular({ usuario: null });
    supabaseSimulado.auth.signInAnonymously.mockResolvedValue({ data: {}, error: { message: 'Anonymous sign-ins are disabled', status: 422 } });
    const resultado = await entrarComoInvitado('ABC23', 'Ana');
    expect(resultado.ok === false && resultado.mensaje).toMatch(/todavía no está activa/);
    expect(supabaseSimulado.rpc).not.toHaveBeenCalled();
  });

  it('avisa cuando hay demasiados intentos', async () => {
    simular({ usuario: null });
    supabaseSimulado.auth.signInAnonymously.mockResolvedValue({ data: {}, error: { message: 'x', status: 429 } });
    const resultado = await entrarComoInvitado('ABC23', 'Ana');
    expect(resultado.ok === false && resultado.mensaje).toMatch(/Demasiados intentos/);
  });
});

describe('clase abierta a invitados', () => {
  it('lee el estado de la clase', async () => {
    simular({ rpc: { estado_clase_invitados: { data: { abierta: true, codigo: 'ABC23', hasta: '2026-11-10T20:00:00Z', abierta_en: '2026-11-10T16:00:00Z', invitados: 7 } } } });
    expect(await estadoClase('c1')).toEqual({ abierta: true, codigo: 'ABC23', hasta: '2026-11-10T20:00:00Z', abiertaEn: '2026-11-10T16:00:00Z', invitados: 7 });
  });

  it('abre y cierra la clase', async () => {
    simular({ rpc: { abrir_clase_invitados: { data: 'XYZ98' }, cerrar_clase_invitados: {} } });
    expect(await abrirClase('c1')).toBe('XYZ98');
    await cerrarClase('c1');
    expect(supabaseSimulado.rpc).toHaveBeenCalledWith('cerrar_clase_invitados', { p_edicion: 'c1' });
  });

  it('trae el marcador con los nombres que usa la app', async () => {
    simular({ rpc: { marcador_clase: { data: [{ perfil_id: 'p1', apodo: 'Ana', es_invitado: true, aciertos: 3, respondidas: 4, puntos: 420 }] } } });
    expect(await marcadorDeClase('c1', '2026-11-10T16:00:00Z')).toEqual([{ perfilId: 'p1', apodo: 'Ana', esInvitado: true, aciertos: 3, respondidas: 4, puntos: 420 }]);
    expect(supabaseSimulado.rpc).toHaveBeenCalledWith('marcador_clase', { p_edicion: 'c1', p_desde: '2026-11-10T16:00:00Z' });
  });

  it('lanza el error de la base para que la pantalla lo muestre', async () => {
    simular({ rpc: { abrir_clase_invitados: { error: { message: 'Solo el docente abre la clase' } } } });
    await expect(abrirClase('c1')).rejects.toThrow('Solo el docente');
  });
});
