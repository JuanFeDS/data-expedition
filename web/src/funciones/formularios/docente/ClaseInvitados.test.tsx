import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('qrcode', () => ({ default: { toDataURL: vi.fn(async () => 'data:image/png;base64,AAAA') } }));
vi.mock('../../../servicios/invitados', async (original) => ({
  ...(await original<typeof import('../../../servicios/invitados')>()),
  estadoClase: vi.fn(), abrirClase: vi.fn(), cerrarClase: vi.fn(), marcadorDeClase: vi.fn(),
}));

import { abrirClase, cerrarClase, estadoClase, marcadorDeClase, type EstadoClase, type FilaMarcador } from '../../../servicios/invitados';
import { PanelInvitados, VistaInvitados } from './ClaseInvitados';

const cerrada: EstadoClase = { abierta: false, codigo: null, hasta: null, abiertaEn: null, invitados: 0 };
const abierta: EstadoClase = { abierta: true, codigo: 'ABC23', hasta: '2026-11-10T20:00:00Z', abiertaEn: '2026-11-10T16:00:00Z', invitados: 3 };
const fila = (indice: number, puntos: number): FilaMarcador => ({ perfilId: `p${indice}`, apodo: `Jugador ${indice}`, esInvitado: true, aciertos: indice, respondidas: 5, puntos });

describe('vista de invitados y marcador', () => {
  it('con la clase cerrada invita a abrirla', async () => {
    const alAbrir = vi.fn();
    render(<VistaInvitados estado={cerrada} marcador={[]} aviso={null} alAbrir={alAbrir} alCerrar={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir la clase' }));
    expect(alAbrir).toHaveBeenCalled();
    expect(screen.getByText(/el marcador se arma solo/)).toBeInTheDocument();
  });

  it('con la clase abierta muestra el código, el QR y cuántos entraron', async () => {
    const alCerrar = vi.fn();
    render(<VistaInvitados estado={abierta} marcador={[]} aviso={null} alAbrir={vi.fn()} alCerrar={alCerrar} />);
    expect(screen.getByText('ABC23')).toBeInTheDocument();
    expect(screen.getByText('3 invitados dentro')).toBeInTheDocument();
    expect(await screen.findByAltText('Código QR para entrar a la clase como invitado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar clase' }));
    expect(alCerrar).toHaveBeenCalled();
  });

  it('usa el singular con un solo invitado', () => {
    render(<VistaInvitados estado={{ ...abierta, invitados: 1 }} marcador={[]} aviso={null} alAbrir={vi.fn()} alCerrar={vi.fn()} />);
    expect(screen.getByText('1 invitado dentro')).toBeInTheDocument();
  });

  it('lista el marcador en orden y muestra solo los diez primeros', () => {
    const filas = Array.from({ length: 12 }, (_, indice) => fila(indice + 1, 1000 - indice * 10));
    render(<VistaInvitados estado={abierta} marcador={filas} aviso={null} alAbrir={vi.fn()} alCerrar={vi.fn()} />);
    const posiciones = screen.getAllByRole('listitem');
    expect(posiciones).toHaveLength(10);
    expect(posiciones[0]).toHaveTextContent('Jugador 1');
    expect(posiciones[0]).toHaveTextContent('1000');
    expect(posiciones[0]).toHaveClass('marcador__primero');
    expect(screen.queryByText('Jugador 11')).toBeNull();
  });

  it('muestra el aviso de error', () => {
    render(<VistaInvitados estado={cerrada} marcador={[]} aviso="No pudimos actualizar la clase de invitados." alAbrir={vi.fn()} alCerrar={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos actualizar');
  });
});

describe('panel de invitados', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(estadoClase).mockReset().mockResolvedValue(cerrada);
    vi.mocked(marcadorDeClase).mockReset().mockResolvedValue([]);
    vi.mocked(abrirClase).mockReset().mockResolvedValue('ABC23');
    vi.mocked(cerrarClase).mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => { vi.useRealTimers(); });

  it('abre la clase y pasa a mostrar el código', async () => {
    render(<PanelInvitados cursoId="c1" />);
    const boton = await screen.findByRole('button', { name: 'Abrir la clase' });
    vi.mocked(estadoClase).mockResolvedValue(abierta);
    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(boton);
    expect(abrirClase).toHaveBeenCalledWith('c1');
    expect(await screen.findByText('ABC23')).toBeInTheDocument();
  });

  it('con la clase abierta actualiza el marcador cada pocos segundos', async () => {
    vi.mocked(estadoClase).mockResolvedValue(abierta);
    vi.mocked(marcadorDeClase).mockResolvedValue([fila(1, 150)]);
    render(<PanelInvitados cursoId="c1" />);
    expect(await screen.findByText('Jugador 1')).toBeInTheDocument();
    expect(marcadorDeClase).toHaveBeenCalledWith('c1', '2026-11-10T16:00:00Z');
    vi.mocked(marcadorDeClase).mockResolvedValue([fila(2, 300), fila(1, 150)]);
    await act(async () => { await vi.advanceTimersByTimeAsync(3200); });
    expect(await screen.findByText('Jugador 2')).toBeInTheDocument();
  });

  it('cierra la clase y deja de mostrar el código', async () => {
    vi.mocked(estadoClase).mockResolvedValue(abierta);
    render(<PanelInvitados cursoId="c1" />);
    const boton = await screen.findByRole('button', { name: 'Cerrar clase' });
    vi.mocked(estadoClase).mockResolvedValue(cerrada);
    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(boton);
    expect(cerrarClase).toHaveBeenCalledWith('c1');
    expect(await screen.findByRole('button', { name: 'Abrir la clase' })).toBeInTheDocument();
  });

  it('avisa si no puede consultar la clase', async () => {
    vi.mocked(estadoClase).mockRejectedValue(new Error('x'));
    render(<PanelInvitados cursoId="c1" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos actualizar');
  });
});
