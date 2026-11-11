import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../servicios/invitados', async (original) => ({ ...(await original<typeof import('../../../servicios/invitados')>()), entrarComoInvitado: vi.fn(), recargarApp: vi.fn() }));

import { entrarComoInvitado, recargarApp } from '../../../servicios/invitados';
import { EntrarComoInvitadoPantalla } from './EntrarComoInvitado';

beforeEach(() => {
  window.location.hash = '#/entrar';
  vi.mocked(entrarComoInvitado).mockReset();
  vi.mocked(recargarApp).mockReset();
});

const campos = () => ({ codigo: screen.getByLabelText('Código de la clase') as HTMLInputElement, apodo: screen.getByLabelText('Tu apodo') as HTMLInputElement, boton: screen.getByRole('button', { name: /Entrar a la clase/ }) });

describe('entrada como invitado', () => {
  it('pide un código y un apodo, sin correo', () => {
    render(<EntrarComoInvitadoPantalla />);
    const { codigo, apodo, boton } = campos();
    expect(codigo).toHaveValue('');
    expect(apodo).toHaveValue('');
    expect(boton).toBeDisabled();
    expect(screen.queryByLabelText(/correo/i)).toBeNull();
  });

  it('trae el código del QR en el enlace', () => {
    window.location.hash = '#/entrar?codigo=ab-c23';
    render(<EntrarComoInvitadoPantalla />);
    expect(campos().codigo).toHaveValue('ABC23');
  });

  it('normaliza lo que se escribe y habilita el botón solo con código y apodo válidos', async () => {
    render(<EntrarComoInvitadoPantalla />);
    const { codigo, apodo, boton } = campos();
    await userEvent.type(codigo, 'abc2');
    expect(codigo).toHaveValue('ABC2');
    expect(boton).toBeDisabled();
    await userEvent.type(codigo, '3');
    await userEvent.type(apodo, 'A');
    expect(boton).toBeDisabled();
    await userEvent.type(apodo, 'na');
    expect(boton).toBeEnabled();
  });

  it('entra a la clase, va a las respuestas del curso y recarga la app', async () => {
    vi.mocked(entrarComoInvitado).mockResolvedValue({ ok: true, cursoId: 'curso-1' });
    render(<EntrarComoInvitadoPantalla />);
    await userEvent.type(campos().codigo, 'ABC23');
    await userEvent.type(campos().apodo, 'Ana');
    await userEvent.click(campos().boton);
    expect(entrarComoInvitado).toHaveBeenCalledWith('ABC23', 'Ana');
    expect(window.location.hash).toBe('#/c/curso-1/e20');
    expect(recargarApp).toHaveBeenCalledTimes(1);
  });

  it('también entra al pulsar Enter en el apodo', async () => {
    vi.mocked(entrarComoInvitado).mockResolvedValue({ ok: true, cursoId: 'curso-1' });
    window.location.hash = '#/entrar?codigo=ABC23';
    render(<EntrarComoInvitadoPantalla />);
    await userEvent.type(campos().apodo, 'Ana{Enter}');
    expect(entrarComoInvitado).toHaveBeenCalledWith('ABC23', 'Ana');
  });

  it('muestra el error y deja volver a intentar', async () => {
    vi.mocked(entrarComoInvitado).mockResolvedValue({ ok: false, mensaje: 'Ese código no es válido o la clase ya cerró.' });
    render(<EntrarComoInvitadoPantalla />);
    await userEvent.type(campos().codigo, 'ABC23');
    await userEvent.type(campos().apodo, 'Ana');
    await userEvent.click(campos().boton);
    expect(await screen.findByRole('alert')).toHaveTextContent('no es válido');
    expect(campos().boton).toBeEnabled();
    expect(recargarApp).not.toHaveBeenCalled();
  });

  it('ofrece volver al acceso con cuenta', () => {
    render(<EntrarComoInvitadoPantalla />);
    expect(screen.getByRole('link', { name: 'Tengo una cuenta' })).toHaveAttribute('href', '#/e0');
  });
});
