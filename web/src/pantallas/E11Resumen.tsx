import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Kicker, Pantalla } from '../componentes/ui';

const SUBIDAS = [
  { dimension: 'Modelado', cambio: 4 },
  { dimension: 'Datos', cambio: 3 },
  { dimension: 'Análisis', cambio: 2 },
];
const MAXIMO = 5;

const TAREAS = [
  { titulo: 'Entrega el Trabajo 2', detalle: 'Vence el viernes 7. Declara si usaste IA.', ruta: '#/e6' },
  { titulo: 'Haz 3 lecciones de Validación', detalle: 'Cuentan como práctica verificada ligera, con tope.', ruta: '#/e7' },
];

export function E11Resumen() {
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Semana 4 · 20 al 26 oct" titulo="Tu semana en una página" jaguar="saluda" />
        <div className="contenido cuerpo-mundo" style={{ gap: 4 }}>
          <Kicker>Lo que subió</Kicker>
          <div className="resumen__subidas">
            {SUBIDAS.map((fila) => (
              <div className="resumen__subida" key={fila.dimension}>
                <span>{fila.dimension}</span>
                <div className="resumen__barra"><i style={{ width: `${(fila.cambio / MAXIMO) * 100}%` }} /></div>
                <strong>+{fila.cambio}</strong>
              </div>
            ))}
            <p className="meta" style={{ fontSize: 12 }}>Tu Trabajo 1 y 6 lecciones movieron estas dimensiones.</p>
          </div>

          <hr className="sep" />
          <Kicker estilo={{ color: 'var(--secondary)' }}>A vigilar</Kicker>
          <div className="resumen__vigilar">
            <span className="num">0</span>
            <div>
              <strong className="titulo">Validación sin cambio</strong>
              <p className="meta" style={{ fontSize: 13 }}>Llevas 3 semanas en 30. Las lecciones de esta dimensión son tu mejor atajo.</p>
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
          <p className="meta" style={{ fontSize: 12, paddingTop: 4 }}>También lo recibes en tu correo institucional.</p>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Para esta semana', texto: 'Hacer una lección', ruta: '#/e7' }} />
    </Pantalla>
  );
}
