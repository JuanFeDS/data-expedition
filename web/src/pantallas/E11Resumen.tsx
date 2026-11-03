import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Kicker, Pantalla } from '../componentes/ui';
import { conModoDemo } from '../componentes/conModoDemo';
import { E11ResumenReal } from './E11ResumenReal';
import { rangoSemanaActual, semanaActual, temaDeRepaso, trabajoActual } from '../datos';

const SUBIDAS = [
  { dimension: 'Modelado', cambio: 4 },
  { dimension: 'Datos', cambio: 3 },
  { dimension: 'Análisis', cambio: 2 },
];
const MAXIMO = 5;

const TAREAS = [
  { titulo: `Entrega el ${trabajoActual.titulo}`, detalle: `Vence el ${trabajoActual.vence.largo}. Declara si usaste IA.`, ruta: '#/e6' },
  { titulo: `Haz 3 lecciones de ${temaDeRepaso().gema.dimension}`, detalle: 'Cuentan como práctica verificada ligera, con tope.', ruta: '#/e15' },
];

export function E11ResumenEjemplo() {
  return (
    <Pantalla clase="p-e11">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker={`Semana ${semanaActual} · ${rangoSemanaActual}`} titulo="Tu semana en una página" objeto="carta" />
        <div className="contenido cuerpo-mundo centrar" style={{ gap: 4 }}>
          <Kicker>Lo que subió</Kicker>
          <div className="resumen__subidas">
            {SUBIDAS.map((fila) => (
              <div className="resumen__subida" key={fila.dimension}>
                <span>{fila.dimension}</span>
                <div className="resumen__barra"><i style={{ width: `${(fila.cambio / MAXIMO) * 100}%` }} /></div>
                <strong>+{fila.cambio}</strong>
              </div>
            ))}
            <p className="meta" style={{ fontSize: 'var(--fs-xs)' }}>Tu Trabajo 2 y 6 lecciones movieron estas dimensiones.</p>
          </div>

          <hr className="sep" />
          <Kicker estilo={{ color: 'var(--secondary)' }}>A vigilar</Kicker>
          <div className="resumen__vigilar">
            <span className="num">0</span>
            <div>
              <strong className="titulo">Validación sin cambio</strong>
              <p className="meta" style={{ fontSize: 'var(--fs-sm)' }}>Llevas 3 semanas en 30. Su isla llega en la semana 7; al cerrarla ganas su gema y se abre su álbum de repaso.</p>
            </div>
          </div>

          <hr className="sep" />
          <Kicker>Esta semana</Kicker>
          <ol className="resumen__tareas">
            {TAREAS.map((tarea, indice) => (
              <li key={tarea.titulo}>
                <a href={tarea.ruta}>
                  <b>{indice + 1}</b>
                  <span><strong>{tarea.titulo}</strong><small>{tarea.detalle}</small></span>
                  <i aria-hidden="true">›</i>
                </a>
              </li>
            ))}
          </ol>
          <p className="meta" style={{ fontSize: 'var(--fs-xs)', paddingTop: 4 }}>También lo recibes en tu correo institucional.</p>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Para esta semana', texto: 'Abrir el álbum', ruta: '#/e15' }} />
    </Pantalla>
  );
}

export const E11Resumen = conModoDemo(E11ResumenEjemplo, E11ResumenReal);
