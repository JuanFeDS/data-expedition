import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reiniciarContexto } from '../../../../pruebas/contexto';

vi.mock('../../../../compartido/estado/sesion', async () => (await import('../../../../pruebas/contexto')).sesionSimulada);
vi.mock('../../../../compartido/estado/curso', async () => (await import('../../../../pruebas/contexto')).cursoSimulado);
vi.mock('qrcode', () => ({ default: { toDataURL: vi.fn(async () => 'data:image/png;base64,AAAA') } }));

import { D16Ejemplo } from './Asistencia';

beforeEach(() => { reiniciarContexto(); vi.useFakeTimers({ shouldAdvanceTime: true }); });
afterEach(() => { vi.useRealTimers(); });

describe('asistencia con QR en la demo', () => {
  it('abre con un QR y un código de 6 caracteres que cuenta hacia atrás', async () => {
    render(<D16Ejemplo />);
    expect(await screen.findByAltText('Código QR para registrar asistencia')).toBeInTheDocument();
    const codigo = document.querySelector('.asist__codigo strong')?.textContent ?? '';
    expect(codigo).toMatch(/^[A-Z2-9]{6}$/);
    expect(screen.getByText('Cambia en 20 s')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    expect(screen.getByText('Cambia en 17 s')).toBeInTheDocument();
  });

  it('el código cambia al llegar a cero', async () => {
    render(<D16Ejemplo />);
    const antes = document.querySelector('.asist__codigo strong')?.textContent;
    await act(async () => { await vi.advanceTimersByTimeAsync(21_000); });
    expect(document.querySelector('.asist__codigo strong')?.textContent).not.toBe(antes);
    expect(screen.getByText(/Cambia en \d+ s/)).toBeInTheDocument();
  });

  it('los estudiantes van llegando con el código', async () => {
    render(<D16Ejemplo />);
    expect(screen.getByText('1 de 8 presentes')).toBeInTheDocument();
    for (let llegada = 0; llegada < 2; llegada += 1) await act(async () => { await vi.advanceTimersByTimeAsync(2700); });
    expect(screen.getByText('3 de 8 presentes')).toBeInTheDocument();
    expect(screen.getAllByText(/Con el código/).length).toBeGreaterThanOrEqual(3);
  });

  it('se puede cerrar y reabrir, y marcar a mano', async () => {
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<D16Ejemplo />);
    await usuario.click(screen.getByRole('button', { name: 'Cerrar asistencia' }));
    expect(screen.getByText('Abre la asistencia al empezar la clase')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(screen.getByText('1 de 8 presentes')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Reabrir asistencia' }));
    expect(screen.getByRole('button', { name: 'Cerrar asistencia' })).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: /Asistencia de Paula Vargas/ }));
    await usuario.click(within(screen.getByRole('listbox')).getByRole('button', { name: 'Ausente' }));
    expect(screen.getByText(/A mano/)).toBeInTheDocument();
  });
});
