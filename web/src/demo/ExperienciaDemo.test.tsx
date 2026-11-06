import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { codigoDeRuta, rolDeRuta } from '../compartido/navegacion/navegacion';
import { PANTALLAS } from '../app/registro';
import { iniciarRecorrido, reiniciarEstadoDemo } from './estado';
import { BarraDemo, PortadaDemo, RecorridoDemo } from './ExperienciaDemo';
import { RECORRIDO, ROLES_DEMO } from './recorrido';

function Escena() {
  const [codigo, setCodigo] = useState(codigoDeRuta(window.location.hash));
  useEffect(() => {
    const alCambiar = () => setCodigo(codigoDeRuta(window.location.hash));
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  return <><BarraDemo codigo={codigo} /><RecorridoDemo codigo={codigo} /></>;
}

const enPortada = (rol: string) => within(screen.getByRole('main')).getByRole('button', { name: new RegExp(rol) });
const irAPantalla = (ruta: string) => act(() => { window.location.hash = `#/${ruta}`; });

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

  it('elegir un rol abre su primera pantalla y el jaguar la comenta', async () => {
    render(<><PortadaDemo /><Escena /></>);
    await userEvent.click(enPortada('Docente'));
    expect(window.location.hash).toBe('#/d1');
    expect(await screen.findByRole('heading', { name: 'Tu panel' })).toBeInTheDocument();
    expect(screen.getByText('Recorrido · 0 de 7')).toBeInTheDocument();
  });
});

describe('exploración con el jaguar', () => {
  it('«Entendido» cierra el comentario, cuenta la pantalla y sugiere la siguiente', async () => {
    render(<><PortadaDemo /><Escena /></>);
    await userEvent.click(enPortada('Docente'));
    await userEvent.click(await screen.findByRole('button', { name: 'Entendido' }));
    expect(screen.queryByRole('heading', { name: 'Tu panel' })).toBeNull();
    expect(screen.getByText('Recorrido · 1 de 7')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver: Diagnóstico y rutas' })).toBeInTheDocument();
  });

  it('la sugerencia lleva a esa pantalla y el jaguar la comenta, sin moverte antes', async () => {
    render(<><PortadaDemo /><Escena /></>);
    await userEvent.click(enPortada('Docente'));
    await userEvent.click(await screen.findByRole('button', { name: 'Entendido' }));
    expect(window.location.hash).toBe('#/d1');
    await userEvent.click(screen.getByRole('button', { name: 'Ver: Diagnóstico y rutas' }));
    expect(window.location.hash).toBe('#/d2');
    expect(await screen.findByRole('heading', { name: 'Diagnóstico y rutas' })).toBeInTheDocument();
  });

  it('navegar por tu cuenta sin cerrar el comentario también cuenta la pantalla', async () => {
    render(<><PortadaDemo /><Escena /></>);
    await userEvent.click(enPortada('Docente'));
    await screen.findByRole('heading', { name: 'Tu panel' });
    irAPantalla('d3');
    expect(await screen.findByRole('heading', { name: 'Entregas' })).toBeInTheDocument();
    expect(screen.getByText('Recorrido · 1 de 7')).toBeInTheDocument();
  });

  it('no repite el comentario de una pantalla ya vista', async () => {
    render(<><PortadaDemo /><Escena /></>);
    await userEvent.click(enPortada('Docente'));
    await userEvent.click(await screen.findByRole('button', { name: 'Entendido' }));
    irAPantalla('d3');
    await screen.findByRole('heading', { name: 'Entregas' });
    irAPantalla('d1');
    await screen.findByText('Recorrido · 1 de 7');
    expect(screen.queryByRole('heading', { name: 'Tu panel' })).toBeNull();
  });

  it('al ver todo ofrece otro rol, y sin roles pendientes termina la visita', async () => {
    render(<><PortadaDemo /><Escena /></>);
    for (const etiqueta of ['Estudiante', 'Docente']) {
      await userEvent.click(enPortada(etiqueta));
      await userEvent.click(await screen.findByRole('button', { name: 'Cerrar el recorrido' }));
    }
    await userEvent.click(enPortada('Observador'));
    await screen.findByRole('heading', { name: 'Resumen por grupo' });
    irAPantalla('o2');
    await screen.findByRole('heading', { name: 'Dimensiones y trabajos' });
    irAPantalla('o3');
    await userEvent.click(await screen.findByRole('button', { name: 'Entendido' }));
    expect(screen.getByText('Recorrido · 3 de 3')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Terminar' }));
    expect(screen.queryByText(/Recorrido ·/)).toBeNull();
    expect(window.location.hash).toBe('#/o1');
  });

  it('al completar un rol propone ver como el siguiente sin ver', async () => {
    render(<><PortadaDemo /><Escena /></>);
    await userEvent.click(enPortada('Observador'));
    await screen.findByRole('heading', { name: 'Resumen por grupo' });
    irAPantalla('o2');
    await screen.findByRole('heading', { name: 'Dimensiones y trabajos' });
    irAPantalla('o3');
    await userEvent.click(await screen.findByRole('button', { name: 'Entendido' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ver como estudiante' }));
    expect(window.location.hash).toBe('#/home');
    expect(await screen.findByRole('heading', { name: 'Tu campamento' })).toBeInTheDocument();
  });

  it('la × cierra el recorrido sin cambiar de pantalla', async () => {
    render(<><PortadaDemo /><Escena /></>);
    await userEvent.click(enPortada('Estudiante'));
    await userEvent.click(await screen.findByRole('button', { name: 'Cerrar el recorrido' }));
    expect(screen.queryByText(/Recorrido ·/)).toBeNull();
    expect(window.location.hash).toBe('#/home');
  });

  it('no se muestra en la portada ni en pantallas de otro rol', () => {
    act(() => iniciarRecorrido('observador'));
    const vista = (codigo: string) => <RecorridoDemo codigo={codigo} />;
    const { rerender } = render(vista('o1'));
    expect(screen.getByText('Recorrido · 0 de 3')).toBeInTheDocument();
    rerender(vista('d1'));
    expect(screen.queryByText(/Recorrido ·/)).toBeNull();
    rerender(vista(''));
    expect(screen.queryByText(/Recorrido ·/)).toBeNull();
    rerender(vista('o2'));
    expect(screen.getByText('Recorrido · 1 de 3')).toBeInTheDocument();
  });

  it('resalta en el menú la pantalla que sugiere', () => {
    act(() => iniciarRecorrido('estudiante'));
    render(<><a className="lateral__enlace" href="#/e1">Ruta</a><a className="lateral__enlace" href="#/e2">Radar</a><RecorridoDemo codigo="home" /></>);
    expect(screen.getByRole('link', { name: 'Ruta' })).toHaveClass('sugerido-demo');
    expect(screen.getByRole('link', { name: 'Radar' })).not.toHaveClass('sugerido-demo');
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

  it('permite volver al inicio y reiniciar el recorrido del rol actual', async () => {
    render(<><BarraDemo codigo="d3" /><RecorridoDemo codigo="d3" /></>);
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '#/');
    await userEvent.click(screen.getByRole('button', { name: 'Recorrido' }));
    expect(window.location.hash).toBe('#/d1');
  });
});
