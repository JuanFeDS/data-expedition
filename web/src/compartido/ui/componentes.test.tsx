import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ResultadoPractica } from '../../funciones/practica/comun/ResultadoPractica';
import { ResultadosFormulario } from '../../funciones/formularios/comun/ResultadosFormulario';
import type { Resultados } from '../../servicios/formularios';
import { LimiteDeErrores } from './LimiteDeErrores';
import { PreguntaCompletar, PreguntaOpciones, PreguntaVF } from './preguntas';
import { BarraDato, Dato, Estado, Tabla, Tarjeta } from './panel';
import { Selector } from './Selector';
import { Segmentado } from './ui';

vi.mock('../../servicios/eventos', () => ({ registrarEvento: vi.fn() }));

describe('Selector', () => {
  const opciones = [{ valor: 'a', etiqueta: 'Opción A' }, { valor: 'b', etiqueta: 'Opción B' }, { valor: 'c', etiqueta: 'Opción C' }];

  it('muestra la opción actual y abre la lista al pulsar', async () => {
    render(<Selector valor="b" opciones={opciones} alCambiar={() => undefined} etiqueta="Elige" />);
    const boton = screen.getByRole('button', { name: 'Elige' });
    expect(boton).toHaveTextContent('Opción B');
    expect(screen.queryByRole('listbox')).toBeNull();
    await userEvent.click(boton);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('elige una opción distinta, avisa el cambio y cierra', async () => {
    const alCambiar = vi.fn();
    render(<Selector valor="a" opciones={opciones} alCambiar={alCambiar} etiqueta="Elige" />);
    await userEvent.click(screen.getByRole('button', { name: 'Elige' }));
    await userEvent.click(within(screen.getByRole('listbox')).getByText('Opción C'));
    expect(alCambiar).toHaveBeenCalledWith('c');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('no avisa si se vuelve a elegir la misma opción', async () => {
    const alCambiar = vi.fn();
    render(<Selector valor="a" opciones={opciones} alCambiar={alCambiar} etiqueta="Elige" />);
    await userEvent.click(screen.getByRole('button', { name: 'Elige' }));
    await userEvent.click(within(screen.getByRole('listbox')).getByText('Opción A'));
    expect(alCambiar).not.toHaveBeenCalled();
  });

  it('se maneja con el teclado: flechas, Enter y Escape', async () => {
    const alCambiar = vi.fn();
    render(<Selector valor="a" opciones={opciones} alCambiar={alCambiar} etiqueta="Elige" />);
    screen.getByRole('button', { name: 'Elige' }).focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(alCambiar).toHaveBeenCalledWith('b');
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('cierra al pulsar fuera y no abre si está deshabilitado', async () => {
    render(<div><span>fuera</span><Selector valor="a" opciones={opciones} alCambiar={() => undefined} etiqueta="Elige" /></div>);
    await userEvent.click(screen.getByRole('button', { name: 'Elige' }));
    await userEvent.click(screen.getByText('fuera'));
    expect(screen.queryByRole('listbox')).toBeNull();
    render(<Selector valor="a" opciones={opciones} alCambiar={() => undefined} etiqueta="Bloqueado" deshabilitado />);
    expect(screen.getByRole('button', { name: 'Bloqueado' })).toBeDisabled();
  });
});

describe('Segmentado', () => {
  it('marca la opción activa y avisa el cambio', async () => {
    const alCambiar = vi.fn();
    render(<Segmentado opciones={['Uno', 'Dos']} activa={0} alCambiar={alCambiar} />);
    await userEvent.click(screen.getByText('Dos'));
    expect(alCambiar).toHaveBeenCalledWith(1);
  });
});

describe('paneles', () => {
  it('BarraDato limita el relleno al 100 % y escribe el valor con su sufijo', () => {
    const { container } = render(<BarraDato etiqueta="Datos" valor={150} />);
    expect(container.querySelector('i')).toHaveStyle({ width: '100%' });
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('BarraDato usa el máximo indicado', () => {
    const { container } = render(<BarraDato etiqueta="Claridad" valor={4} maximo={5} sufijo=" / 5" />);
    expect(container.querySelector('i')).toHaveStyle({ width: '80%' });
  });

  it('Tarjeta, Dato y Estado muestran su contenido', () => {
    render(<Tarjeta kicker="Kicker" titulo="Título" accion={<Estado tipo="ok">Listo</Estado>}><Dato valor={7} etiqueta="Cosas" nota="nota" /></Tarjeta>);
    expect(screen.getByRole('heading', { name: 'Título' })).toBeInTheDocument();
    expect(screen.getByText('Listo')).toHaveClass('estado--ok');
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('Tabla pinta una fila por cada elemento', () => {
    render(<Tabla etiqueta="Prueba" columnas={[{ clave: 'a', titulo: 'A' }, { clave: 'b', titulo: 'B' }]} filas={[{ a: 'a1', b: 'b1' }, { a: 'a2', b: 'b2' }]} />);
    expect(screen.getByText('a2')).toBeInTheDocument();
    expect(screen.getByText('b1')).toBeInTheDocument();
  });
});

describe('preguntas de práctica', () => {
  it('opción múltiple: avisa si lo elegido es correcto', async () => {
    const alCambiar = vi.fn();
    render(<PreguntaOpciones datos={{ tipo: 'opciones', enunciado: 'Pregunta', opciones: ['uno', 'dos'], correcta: 1, explicacion: '' }} alCambiar={alCambiar} bloqueada={false} />);
    await userEvent.click(screen.getByText('uno'));
    expect(alCambiar).toHaveBeenLastCalledWith({ correcta: false });
    await userEvent.click(screen.getByText('dos'));
    expect(alCambiar).toHaveBeenLastCalledWith({ correcta: true });
  });

  it('opción múltiple: bloqueada no acepta más respuestas', async () => {
    const alCambiar = vi.fn();
    render(<PreguntaOpciones datos={{ tipo: 'opciones', enunciado: 'P', opciones: ['uno', 'dos'], correcta: 1, explicacion: '' }} alCambiar={alCambiar} bloqueada />);
    await userEvent.click(screen.getByText('uno'));
    expect(alCambiar).not.toHaveBeenCalled();
  });

  it('verdadero o falso: solo es correcto con el valor y la justificación correctos', async () => {
    const alCambiar = vi.fn();
    render(<PreguntaVF datos={{ tipo: 'vf', enunciado: 'P', verdadera: false, justificaciones: ['mala', 'buena'], correctaJustificacion: 1, explicacion: '' }} alCambiar={alCambiar} bloqueada={false} />);
    await userEvent.click(screen.getByText('Falso'));
    expect(alCambiar).toHaveBeenLastCalledWith(null);
    await userEvent.click(screen.getByText('mala'));
    expect(alCambiar).toHaveBeenLastCalledWith({ correcta: false });
    await userEvent.click(screen.getByText('buena'));
    expect(alCambiar).toHaveBeenLastCalledWith({ correcta: true });
  });

  it('completar: elige la palabra que va en el hueco', async () => {
    const alCambiar = vi.fn();
    render(<PreguntaCompletar datos={{ tipo: 'completar', antes: 'Un', despues: 'es lo más simple.', opciones: ['baseline', 'pipeline'], correcta: 0, explicacion: '' }} alCambiar={alCambiar} bloqueada={false} />);
    await userEvent.click(screen.getByText('baseline'));
    expect(alCambiar).toHaveBeenLastCalledWith({ correcta: true });
    await userEvent.click(screen.getByText('pipeline'));
    expect(alCambiar).toHaveBeenLastCalledWith({ correcta: false });
  });
});

describe('ResultadosFormulario', () => {
  const resultados: Resultados = {
    total: 4,
    preguntas: [
      { preguntaId: 'p1', orden: 1, tipo: 'opcion' as const, enunciado: '¿Cuál?', opciones: ['a', 'b'], correcta: 1, conteos: { 0: 1, 1: 3 }, textos: [] },
      { preguntaId: 'p2', orden: 2, tipo: 'escala' as const, enunciado: 'Claridad', opciones: [], correcta: null, conteos: { 4: 2 }, textos: [] },
      { preguntaId: 'p3', orden: 3, tipo: 'texto' as const, enunciado: 'Comentarios', opciones: [], correcta: null, conteos: {}, textos: ['Muy bien'] },
    ],
  };

  it('pinta barras por opción con la correcta marcada, la escala del 1 al 5 y los textos', () => {
    render(<ResultadosFormulario resultados={resultados} fallo={false} />);
    expect(screen.getByText('4 respuestas')).toBeInTheDocument();
    expect(screen.getByText(/B · b ✓ \(3\)/)).toBeInTheDocument();
    expect(screen.getByText(/A · a \(1\)/)).toBeInTheDocument();
    expect(screen.getAllByText(/de 5 \(/)).toHaveLength(5);
    expect(screen.getByText('Muy bien')).toBeInTheDocument();
  });

  it('muestra los estados de carga y de error', () => {
    const { rerender } = render(<ResultadosFormulario resultados={null} fallo={false} />);
    expect(screen.getByText('Cargando resultados…')).toBeInTheDocument();
    rerender(<ResultadosFormulario resultados={null} fallo />);
    expect(screen.getByText('El resultado aún no está disponible.')).toBeInTheDocument();
  });

  it('usa el singular con una sola respuesta', () => {
    render(<ResultadosFormulario resultados={{ total: 1, preguntas: [] }} fallo={false} />);
    expect(screen.getByText('1 respuesta')).toBeInTheDocument();
  });
});

describe('ResultadoPractica', () => {
  const base = { xp: 30, primeraVez: [true, true, false, true, true], resumen: { dias: [true, false, false, false, false, false, false], hoy: 0, racha: 1, sesionesHoy: 1, sesionesSemana: 1, xpSemana: 30 }, guardado: true, alOtraSesion: () => undefined, rutaVolver: '#/e15' };

  it('felicita una sesión perfecta', () => {
    render(<ResultadoPractica {...base} aciertos={5} total={5} primeraVez={[true, true, true, true, true]} />);
    expect(screen.getByText('Sesión perfecta')).toBeInTheDocument();
    expect(screen.getByText('5 de 5 a la primera')).toBeInTheDocument();
  });

  it('cuenta los aciertos a la primera y muestra la racha y lo que falta de la meta semanal', () => {
    render(<ResultadoPractica {...base} aciertos={4} total={5} />);
    expect(screen.getByText('4 de 5 a la primera')).toBeInTheDocument();
    expect(screen.getByText('día seguido')).toBeInTheDocument();
    expect(screen.getByText(/te faltan 170/)).toBeInTheDocument();
  });

  it('con pocos aciertos anima en vez de felicitar', () => {
    render(<ResultadoPractica {...base} aciertos={1} total={5} primeraVez={[true, false, false, false, false]} />);
    expect(screen.getByText('Cada repaso cuenta. La próxima te sale mejor.')).toBeInTheDocument();
  });

  it('si no se pudo guardar avisa que no sumó XP', () => {
    render(<ResultadoPractica {...base} aciertos={3} total={5} guardado={false} resumen={null} />);
    expect(screen.getByRole('alert')).toHaveTextContent('no sumó XP');
  });

  it('«Otra sesión» llama a la función recibida', async () => {
    const alOtraSesion = vi.fn();
    render(<ResultadoPractica {...base} aciertos={4} total={5} alOtraSesion={alOtraSesion} />);
    await userEvent.click(screen.getByRole('button', { name: 'Otra sesión' }));
    expect(alOtraSesion).toHaveBeenCalledOnce();
  });
});

describe('LimiteDeErrores', () => {
  const Falla = ({ mensaje }: { mensaje: string }): never => { throw new Error(mensaje); };

  it('muestra un aviso en vez de una página en blanco cuando una pantalla falla', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<LimiteDeErrores><Falla mensaje="se rompió" /></LimiteDeErrores>);
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal');
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeInTheDocument();
  });

  it('distingue el caso de una versión nueva publicada', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<LimiteDeErrores><Falla mensaje="Failed to fetch dynamically imported module: /x.js" /></LimiteDeErrores>);
    expect(screen.getByRole('alert')).toHaveTextContent('Hay una versión nueva');
  });

  it('deja pasar a los hijos cuando todo va bien', () => {
    render(<LimiteDeErrores><Suspense fallback={null}><p>todo bien</p></Suspense></LimiteDeErrores>);
    expect(screen.getByText('todo bien')).toBeInTheDocument();
  });
});
