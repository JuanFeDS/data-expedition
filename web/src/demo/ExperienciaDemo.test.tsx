import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { rolDeRuta } from '../compartido/navegacion/navegacion';
import { PANTALLAS } from '../app/registro';
import { reiniciarEstadoDemo } from './estado';
import { BarraDemo, PortadaDemo, RecorridoDemo } from './ExperienciaDemo';
import { RECORRIDO, ROLES_DEMO } from './recorrido';

beforeEach(() => {
  window.sessionStorage.clear();
  act(() => reiniciarEstadoDemo());
});

describe('recorrido de la demo', () => {
  it('cada paso apunta a una pantalla que existe y es del rol correcto', () => {
    const codigos = new Set(PANTALLAS.map((pantalla) => pantalla.codigo));
    Object.entries(RECORRIDO).forEach(([rol, pasos]) => {
      expect(pasos.length).toBeGreaterThanOrEqual(3);
      pasos.forEach((paso) => {
        expect(codigos.has(paso.ruta), `${paso.ruta} no está registrada`).toBe(true);
        expect(rolDeRuta(paso.ruta)).toBe(rol);
        expect(paso.titulo.length).toBeGreaterThan(0);
        expect(paso.texto.length).toBeGreaterThan(0);
      });
    });
  });

  it('la portada ofrece los tres roles', () => {
    expect(ROLES_DEMO.map((entrada) => entrada.rol)).toEqual(['estudiante', 'docente', 'observador']);
  });
});

describe('portada de la demo', () => {
  it('muestra la promesa y los tres roles', () => {
    render(<PortadaDemo />);
    expect(screen.getByRole('heading', { name: /resiste a la IA/i })).toBeInTheDocument();
    ['Estudiante', 'Docente', 'Observador'].forEach((etiqueta) => expect(screen.getByRole('button', { name: new RegExp(etiqueta) })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /todas las pantallas/i })).toHaveAttribute('href', '#/todas');
  });

  it('elegir un rol abre su primera pantalla y arranca el recorrido', async () => {
    render(<><PortadaDemo /><RecorridoDemo /></>);
    await userEvent.click(screen.getByRole('button', { name: /Docente/ }));
    expect(window.location.hash).toBe('#/d1');
    expect(screen.getByText('Recorrido · 1 de 7')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tu panel' })).toBeInTheDocument();
  });
});

describe('recorrido guiado', () => {
  it('avanza, retrocede y navega a la pantalla de cada paso', async () => {
    render(<><PortadaDemo /><RecorridoDemo /></>);
    await userEvent.click(screen.getByRole('button', { name: /Estudiante/ }));
    expect(window.location.hash).toBe('#/home');
    expect(screen.queryByRole('button', { name: 'Anterior' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(window.location.hash).toBe('#/e1');
    expect(screen.getByText('Recorrido · 2 de 7')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(window.location.hash).toBe('#/home');
  });

  it('saltar cierra el recorrido sin cambiar de pantalla', async () => {
    render(<><PortadaDemo /><RecorridoDemo /></>);
    await userEvent.click(screen.getByRole('button', { name: /Estudiante/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    expect(screen.queryByText(/Recorrido ·/)).toBeNull();
    expect(window.location.hash).toBe('#/home');
  });

  it('al llegar al último paso propone ver como otro rol', async () => {
    render(<><PortadaDemo /><RecorridoDemo /></>);
    await userEvent.click(screen.getByRole('button', { name: /Observador/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('Recorrido · 3 de 3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver como estudiante' }));
    expect(window.location.hash).toBe('#/home');
    expect(screen.getByText('Recorrido · 1 de 7')).toBeInTheDocument();
  });

  it('sin roles pendientes el último paso termina la visita', async () => {
    render(<><PortadaDemo /><RecorridoDemo /></>);
    for (const etiqueta of [/Estudiante/, /Docente/]) {
      await userEvent.click(screen.getByRole('button', { name: etiqueta }));
      await userEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    }
    await userEvent.click(screen.getByRole('button', { name: /Observador/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Terminar' }));
    expect(screen.queryByText(/Recorrido ·/)).toBeNull();
    expect(window.location.hash).toBe('#/o1');
  });
});

describe('barra de la demo', () => {
  it('marca el rol de la pantalla actual y cambia de rol', async () => {
    render(<BarraDemo codigo="e2" />);
    expect(screen.getByRole('button', { name: 'Estudiante' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Docente' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Docente' }));
    expect(window.location.hash).toBe('#/d1');
  });

  it('en la portada ningún rol está marcado', () => {
    render(<BarraDemo codigo="" />);
    screen.getAllByRole('button').forEach((boton) => expect(boton).toHaveAttribute('aria-pressed', 'false'));
  });

  it('el recorrido de un rol no se muestra en la portada ni en pantallas de otro rol', async () => {
    const vista = (codigo: string) => <><BarraDemo codigo="o1" /><RecorridoDemo codigo={codigo} /></>;
    const { rerender } = render(vista('o1'));
    await userEvent.click(screen.getByRole('button', { name: 'Recorrido' }));
    expect(screen.getByText('Recorrido · 1 de 3')).toBeInTheDocument();
    rerender(vista('d1'));
    expect(screen.queryByText(/Recorrido · 1/)).toBeNull();
    rerender(vista(''));
    expect(screen.queryByText(/Recorrido · 1/)).toBeNull();
    rerender(vista('o2'));
    expect(screen.getByText('Recorrido · 1 de 3')).toBeInTheDocument();
  });

  it('permite volver al inicio y reiniciar el recorrido del rol actual', async () => {
    render(<><BarraDemo codigo="d3" /><RecorridoDemo /></>);
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '#/');
    await userEvent.click(screen.getByRole('button', { name: 'Recorrido' }));
    expect(window.location.hash).toBe('#/d1');
    expect(screen.getByText('Recorrido · 1 de 7')).toBeInTheDocument();
  });
});
