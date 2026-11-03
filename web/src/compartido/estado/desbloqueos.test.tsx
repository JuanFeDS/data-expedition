import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { conModoDemo } from '../ui/conModoDemo';
import { RutaProgreso } from '../navegacion/RutaProgreso';
import { DesbloqueosProvider, useDesbloqueos } from './desbloqueos';

const estado = vi.hoisted(() => ({ sesion: { modoDemo: false, persona: { id: 'p1', rol: 'docente' } as { id: string; rol: string } | null }, curso: { dentro: true, curso: { id: 'c1', nombre: 'Prueba' } } }));

vi.mock('./sesion', () => ({ useSesion: () => estado.sesion }));
vi.mock('./curso', () => ({ useCurso: () => estado.curso }));
vi.mock('../../servicios/progreso', () => ({ leerProgreso: vi.fn(async () => null), guardarProgreso: vi.fn(async () => undefined) }));
vi.mock('../../servicios/eventos', () => ({ registrarEvento: vi.fn() }));

import { guardarProgreso, leerProgreso } from '../../servicios/progreso';
import { registrarEvento } from '../../servicios/eventos';

function Sonda() {
  const { desbloqueadas, todo, ruta } = useDesbloqueos();
  return <div><span data-testid="abiertas">{[...desbloqueadas].sort().join(',')}</span><span data-testid="todo">{String(todo)}</span><span data-testid="ruta">{ruta ? `${ruta.abiertas}/${ruta.total}` : 'sin ruta'}</span></div>;
}

const irA = (codigo: string) => act(() => { window.location.hash = `#/c/c1/${codigo}`; window.dispatchEvent(new HashChangeEvent('hashchange')); });
const montar = () => render(<DesbloqueosProvider><Sonda /><RutaProgreso /></DesbloqueosProvider>);

beforeEach(() => {
  estado.sesion = { modoDemo: false, persona: { id: 'p1', rol: 'docente' } };
  estado.curso = { dentro: true, curso: { id: 'c1', nombre: 'Prueba' } };
  vi.mocked(leerProgreso).mockReset().mockResolvedValue(null);
  vi.mocked(guardarProgreso).mockClear();
  vi.mocked(registrarEvento).mockClear();
  window.location.hash = '#/c/c1/d1';
});

describe('desbloqueo de secciones', () => {
  it('al entrar a un curso solo se abre su centro y el jaguar lo explica', async () => {
    montar();
    await waitFor(() => expect(screen.getByTestId('abiertas')).toHaveTextContent('d1'));
    expect(screen.getByTestId('abiertas').textContent).toBe('d1');
    expect(screen.getByText('Panel del curso')).toBeInTheDocument();
    expect(screen.getByText('Nueva sección')).toBeInTheDocument();
  });

  it('al pulsar «Entendido» la explicación no vuelve a salir y queda guardada', async () => {
    montar();
    await userEvent.click(await screen.findByRole('button', { name: 'Entendido' }));
    expect(screen.queryByText('Nueva sección')).toBeNull();
    expect(JSON.parse(window.localStorage.getItem('presentadas-p1') ?? '[]')).toEqual(['d1']);
    expect(registrarEvento).toHaveBeenCalledWith('seccion_presentada', expect.objectContaining({ entidadId: 'd1' }));
  });

  it('cada sección se desbloquea al entrar y se explica la primera vez', async () => {
    montar();
    await userEvent.click(await screen.findByRole('button', { name: 'Entendido' }));
    irA('d13');
    await waitFor(() => expect(screen.getByTestId('abiertas').textContent).toBe('d1,d13'));
    expect(screen.getByText('Personas')).toBeInTheDocument();
    expect(registrarEvento).toHaveBeenCalledWith('seccion_desbloqueada', expect.objectContaining({ entidadId: 'd13' }));
    expect(JSON.parse(window.localStorage.getItem('recorridas-p1') ?? '[]')).toEqual(expect.arrayContaining(['d1', 'd13']));
    expect(guardarProgreso).toHaveBeenCalledWith('recorridas', expect.anything());
  });

  it('lo desbloqueado no vuelve a bloquearse al salir de la sección', async () => {
    montar();
    irA('d13');
    await waitFor(() => expect(screen.getByTestId('abiertas').textContent).toBe('d1,d13'));
    irA('d1');
    expect(screen.getByTestId('abiertas').textContent).toBe('d1,d13');
  });

  it('una pantalla que no es de la ruta no desbloquea nada', async () => {
    montar();
    await waitFor(() => expect(screen.getByTestId('abiertas').textContent).toBe('d1'));
    irA('trabajo');
    expect(screen.getByTestId('abiertas').textContent).toBe('d1');
  });

  it('mezcla lo que ya había avanzado en otro dispositivo', async () => {
    vi.mocked(leerProgreso).mockImplementation(async (clave: string) => (clave === 'recorridas' ? ({ claves: ['d14'] } as never) : null));
    montar();
    await waitFor(() => expect(screen.getByTestId('abiertas').textContent).toBe('d1,d14'));
  });

  it('cuenta las secciones exploradas en «Tu ruta»', async () => {
    montar();
    await waitFor(() => expect(screen.getByTestId('ruta')).toHaveTextContent('1/15'));
    expect(screen.getByText('1 de 15 exploradas')).toBeInTheDocument();
  });

  it('«Mostrar todo» abre todo, se recuerda y se puede quitar', async () => {
    montar();
    expect(screen.getByTestId('todo')).toHaveTextContent('false');
    await userEvent.click(await screen.findByLabelText('Mostrar todo'));
    expect(screen.getByTestId('todo')).toHaveTextContent('true');
    expect(window.localStorage.getItem('mostrar-todo-p1')).toBe('1');
    expect(guardarProgreso).toHaveBeenCalledWith('mostrar_todo', { valor: true });
    await userEvent.click(screen.getByLabelText('Mostrar todo'));
    expect(window.localStorage.getItem('mostrar-todo-p1')).toBe('0');
  });

  it('el estudiante tiene su propia ruta, que empieza en el campamento', async () => {
    estado.sesion = { modoDemo: false, persona: { id: 'p2', rol: 'estudiante' } };
    window.location.hash = '#/c/c1/home';
    montar();
    await waitFor(() => expect(screen.getByTestId('abiertas').textContent).toBe('home'));
    expect(screen.getByText('Campamento')).toBeInTheDocument();
  });

  it('el observador no tiene ruta: ve todo y no hay explicaciones', async () => {
    estado.sesion = { modoDemo: false, persona: { id: 'p3', rol: 'observador' } };
    montar();
    expect(screen.getByTestId('todo')).toHaveTextContent('true');
    expect(screen.getByTestId('ruta')).toHaveTextContent('sin ruta');
    expect(screen.queryByText('Nueva sección')).toBeNull();
  });

  it('en modo demo todo está abierto y no hay guía', () => {
    estado.sesion = { modoDemo: true, persona: null };
    montar();
    expect(screen.getByTestId('todo')).toHaveTextContent('true');
    expect(screen.queryByText('Nueva sección')).toBeNull();
  });

  it('fuera de un curso no se desbloquea ni se explica nada', () => {
    estado.curso = { dentro: false, curso: null as never };
    montar();
    expect(screen.getByTestId('abiertas').textContent).toBe('');
    expect(screen.queryByText('Nueva sección')).toBeNull();
  });
});

describe('conModoDemo', () => {
  const Real = () => <p>versión real</p>;
  const cargarEjemplo = async () => ({ Ejemplo: () => <p>versión de ejemplo</p> });

  it('en modo real muestra la versión real sin descargar la de ejemplo', () => {
    estado.sesion = { modoDemo: false, persona: null };
    const cargar = vi.fn(cargarEjemplo);
    const Pantalla = conModoDemo(cargar, 'Ejemplo', Real);
    render(<Pantalla />);
    expect(screen.getByText('versión real')).toBeInTheDocument();
    expect(cargar).not.toHaveBeenCalled();
  });

  it('en modo demo descarga y muestra la de ejemplo', async () => {
    estado.sesion = { modoDemo: true, persona: null };
    const Pantalla = conModoDemo(cargarEjemplo, 'Ejemplo', Real);
    render(<Pantalla />);
    expect(await screen.findByText('versión de ejemplo')).toBeInTheDocument();
    expect(screen.queryByText('versión real')).toBeNull();
  });
});
