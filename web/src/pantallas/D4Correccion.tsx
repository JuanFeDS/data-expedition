import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Estado, Tarjeta } from '../componentes/panel';
import { Niveles, Pantalla } from '../componentes/ui';
import { trabajoActual } from '../datos';
import { conModoDemo } from '../componentes/conModoDemo';
import { D4Calificar } from './D4Calificar';

interface Criterio {
  nombre: string;
  dimension: string;
  peso: number;
  transversal?: boolean;
}

const CRITERIOS: Criterio[] = [
  { nombre: 'Transformaciones con PySpark', dimension: 'Datos', peso: 2 },
  { nombre: 'Comparación con pandas', dimension: 'Análisis', peso: 2 },
  { nombre: 'Particiones y rendimiento', dimension: 'Modelado', peso: 1 },
  { nombre: 'Declaración de IA y bitácora', dimension: 'Dirección de IA', peso: 1, transversal: true },
  { nombre: 'Calidad del código y tablero', dimension: 'Producción', peso: 1, transversal: true },
];

export function D4CorreccionEjemplo() {
  const [niveles, setNiveles] = useState([4, 3.5, 3, 4, 4.5]);
  const [guardada, setGuardada] = useState(false);
  const suma = CRITERIOS.reduce((total, criterio, indice) => total + niveles[indice] * criterio.peso, 0);
  const pesos = CRITERIOS.reduce((total, criterio) => total + criterio.peso, 0);
  const nota = Math.round((suma / pesos) * 10) / 10;

  const mover = (indice: number, delta: number) => {
    setNiveles((actuales) => actuales.map((valor, posicion) => (posicion === indice ? Math.min(5, Math.max(1, valor + delta)) : valor)));
    setGuardada(false);
  };

  return (
    <Pantalla rol="docente" clase="p-d4">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Entregas', ruta: '#/d3' }} kicker={`${trabajoActual.titulo} · Camilo Restrepo · Grupo 2`} titulo="Corrección" subtitulo="Rúbrica de 5 niveles, con medios puntos." objeto="trofeo">
          <div className="cifra-mundo"><span className="num">{nota.toFixed(1)}</span><small>nota calculada<br />de 1.0 a 5.0</small></div>
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo panel">
          <div className="d4__columnas">
            <Tarjeta kicker="Rúbrica" titulo="Criterios" accion={<Estado tipo={guardada ? 'ok' : 'pendiente'}>{guardada ? 'Guardada' : 'Sin guardar'}</Estado>}>
              <ul className="d4__criterios">
                {CRITERIOS.map((criterio, indice) => (
                  <li key={criterio.nombre}>
                    <div className="d4__nombre"><strong>{criterio.nombre}</strong><small>{criterio.dimension} · peso {criterio.peso}</small>{criterio.transversal && <Estado tipo="info">Transversal</Estado>}</div>
                    <Niveles nivel={niveles[indice]} />
                    <div className="d4__ajuste">
                      <button aria-label={`Bajar ${criterio.nombre}`} onClick={() => mover(indice, -0.5)}>−</button>
                      <b>{niveles[indice].toFixed(1)}</b>
                      <button aria-label={`Subir ${criterio.nombre}`} onClick={() => mover(indice, 0.5)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="meta">Regla visible para el estudiante: promedio de los niveles, ponderado por el peso de cada criterio.</p>
            </Tarjeta>
            <div className="d4__lado">
              <Tarjeta kicker="Pull request" titulo="camilo-r/trabajo-3 #1">
                <dl className="d4__datos">
                  <div><dt>Versión entregada</dt><dd><code>a41f9c2</code></dd></div>
                  <div><dt>Black y Pylint</dt><dd><Estado tipo="ok">Black ✓</Estado> <Estado tipo="ok">Pylint 8.4 / {trabajoActual.minPylint}</Estado></dd></div>
                  <div><dt>Pareja</dt><dd><Estado tipo="pendiente">Julián Arias no ha aprobado</Estado></dd></div>
                  <div><dt>Declaración</dt><dd>Con IA · bitácora completa</dd></div>
                  <div><dt>Permiso de escritura</dt><dd><Estado tipo="ok">Puedes fusionar</Estado></dd></div>
                </dl>
              </Tarjeta>
              <Tarjeta tono="menta" kicker="Retroalimentación" titulo="Para Camilo">
                <div className="campo"><label htmlFor="retro">Comentario general</label><textarea id="retro" rows={3} placeholder="Qué funcionó y qué mejorar…" /></div>
                <div className="acciones">
                  <button className="boton boton--suave" onClick={() => setGuardada(true)}>Guardar borrador</button>
                  <button className="boton boton--accent" onClick={() => { setGuardada(true); window.location.hash = '#/d3'; }}>Calificar y fusionar</button>
                </div>
              </Tarjeta>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: `Nota ${nota.toFixed(1)}`, texto: 'Calificar y fusionar', alPulsar: () => { window.location.hash = '#/d3'; } }} />
    </Pantalla>
  );
}

export const D4Correccion = conModoDemo(D4CorreccionEjemplo, D4Calificar);
