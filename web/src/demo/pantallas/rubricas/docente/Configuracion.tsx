import { useState } from 'react';
import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { Estado, Tarjeta } from '../../../../compartido/ui/panel';
import { Pantalla } from '../../../../compartido/ui/ui';
import { trabajos } from '../../../datos';

const DIMENSIONES = [
  { nombre: 'Datos', transversal: false }, { nombre: 'Análisis', transversal: false }, { nombre: 'Modelado', transversal: false },
  { nombre: 'Validación', transversal: false }, { nombre: 'Comunicación', transversal: false },
  { nombre: 'Producción', transversal: true }, { nombre: 'Dirección de IA', transversal: true },
];

export function D10ConfiguracionEjemplo() {
  const [nivelacion, setNivelacion] = useState(50);
  const [profundizacion, setProfundizacion] = useState(80);
  const [minimos, setMinimos] = useState(trabajos.map((trabajo) => trabajo.minPylint));
  const [guardado, setGuardado] = useState(false);
  const tocar = () => setGuardado(false);
  return (
    <Pantalla rol="docente" clase="p-d10">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Edición actual" titulo="Configuración" subtitulo="Todo esto son datos de la edición, no código." objeto="brujula" />
        <div className="contenido cuerpo-mundo panel">
          <div className="d10__columnas">
            <Tarjeta kicker="Radar" titulo="Dimensiones">
              <ul className="d10__dimensiones">
                {DIMENSIONES.map((dimension) => <li key={dimension.nombre}><strong>{dimension.nombre}</strong><Estado tipo={dimension.transversal ? 'info' : 'ok'}>{dimension.transversal ? 'Transversal' : 'Con módulo'}</Estado></li>)}
              </ul>
              <p className="meta">Las transversales se evalúan en todos los trabajos con criterios que no se copian uno por uno.</p>
            </Tarjeta>
            <Tarjeta kicker="Rutas del curso" titulo="Umbrales" accion={<Estado tipo="info">Provisionales</Estado>}>
              <label className="d10__rango"><span>Nivelación: menos de <b>{nivelacion} %</b></span><input type="range" min={30} max={70} value={nivelacion} onChange={(evento) => { setNivelacion(Number(evento.target.value)); tocar(); }} /></label>
              <label className="d10__rango"><span>Profundización: más de <b>{profundizacion} %</b></span><input type="range" min={60} max={95} value={profundizacion} onChange={(evento) => { setProfundizacion(Number(evento.target.value)); tocar(); }} /></label>
              <p className="meta">Se aplican sobre el radar de Datos (de 0 a 100) de cada estudiante.</p>
            </Tarjeta>
            <Tarjeta kicker="Producción" titulo="Mínimo de Pylint por trabajo">
              <ul className="d10__pylint">
                {trabajos.map((trabajo, indice) => (
                  <li key={trabajo.codigo}>
                    <span>{trabajo.codigo}</span>
                    <input type="range" min={5} max={10} step={0.5} value={minimos[indice]} aria-label={`Mínimo de ${trabajo.titulo}`} onChange={(evento) => { setMinimos((actual) => actual.map((valor, posicion) => (posicion === indice ? Number(evento.target.value) : valor))); tocar(); }} />
                    <b>{minimos[indice].toFixed(1)}</b>
                  </li>
                ))}
              </ul>
            </Tarjeta>
            <Tarjeta kicker="Privacidad" titulo="Observador">
              <label className="d10__rango"><span>Mínimo de personas por dato agregado: <b>5</b></span><input type="range" min={3} max={10} defaultValue={5} onChange={tocar} /></label>
              <p className="meta">Por debajo de ese número, el observador no ve el dato.</p>
              <button className="boton boton--accent" onClick={() => setGuardado(true)}>{guardado ? 'Guardado' : 'Guardar cambios'}</button>
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: guardado ? 'Cambios guardados' : 'Hay cambios sin guardar', texto: guardado ? 'Listo' : 'Guardar cambios', alPulsar: () => setGuardado(true), deshabilitada: guardado }} />
    </Pantalla>
  );
}

