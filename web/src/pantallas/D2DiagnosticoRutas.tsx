import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { BarraDato, Estado, Tarjeta } from '../componentes/panel';
import { conModoDemo } from '../componentes/conModoDemo';
import { D2DiagnosticoReal } from './D2DiagnosticoReal';
import { Pantalla } from '../componentes/ui';
import { UMBRAL_NIVELACION, UMBRAL_PROFUNDIZACION, dimensionesDiagnostico, estudiantes, porcentajeDatos, rutaPropuesta } from '../datosPlan';

const RUTAS = ['Nivelación', 'Estándar', 'Profundización'] as const;

export function D2DiagnosticoRutasEjemplo() {
  const [ruta, setRuta] = useState<(typeof RUTAS)[number]>(rutaPropuesta);
  const [confirmada, setConfirmada] = useState(false);
  const cuenta = (nombre: (typeof RUTAS)[number]) => estudiantes.filter((estudiante) => estudiante.ruta === nombre).length;
  return (
    <Pantalla rol="docente" clase="p-d2">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Forma A · semana 1" titulo="Diagnóstico y rutas" subtitulo="La ruta del curso sale de cuántos llegan con pandas." objeto="brujula" />
        <div className="contenido cuerpo-mundo panel">
          <div className="d2__columnas">
            <Tarjeta kicker="Datos de entrada" titulo={`${porcentajeDatos} % llega a ${UMBRAL_NIVELACION} o más`} accion={<Estado tipo="info">Umbrales provisionales</Estado>}>
              <p className="meta">Entre {UMBRAL_NIVELACION} % y {UMBRAL_PROFUNDIZACION} % de estudiantes en {UMBRAL_NIVELACION} o más en Datos, el curso sigue el plan estándar.</p>
              <div className="d2__rutas" role="radiogroup" aria-label="Ruta del curso">
                {RUTAS.map((nombre) => (
                  <button key={nombre} role="radio" aria-checked={ruta === nombre} className="d2__ruta" onClick={() => { setRuta(nombre); setConfirmada(false); }}>
                    <strong>{nombre}</strong>
                    <small>{nombre === rutaPropuesta ? 'Propuesta' : 'Alternativa'}</small>
                  </button>
                ))}
              </div>
              <div className="acciones">
                <button className="boton boton--accent" onClick={() => setConfirmada(true)} disabled={confirmada}>{confirmada ? 'Ruta confirmada' : `Confirmar ruta ${ruta.toLowerCase()}`}</button>
                {confirmada && <Estado tipo="ok">Se aplica desde la semana 3</Estado>}
              </div>
            </Tarjeta>
            <Tarjeta kicker="Por estudiante" titulo="Ruta individual">
              <div className="rejilla rejilla--3">
                {RUTAS.map((nombre) => <div className="dato" key={nombre}><span className="num">{cuenta(nombre)}</span><strong>{nombre}</strong></div>)}
              </div>
              <p className="meta">Cada estudiante recibe los ejercicios en Base, Estándar o Reto según su radar de entrada, aunque la ruta del curso sea otra.</p>
            </Tarjeta>
            <Tarjeta kicker="Con IA frente a sin IA" titulo="Brecha por dimensión" clase="d2__brecha">
              {dimensionesDiagnostico.map((dimension) => (
                <div className="d2__fila" key={dimension.nombre}>
                  <BarraDato etiqueta={dimension.nombre} valor={dimension.conIA} sufijo="" tono="azul" />
                  <BarraDato etiqueta="sin IA" valor={dimension.sinIA} sufijo={` −${dimension.conIA - dimension.sinIA}`} tono={dimension.conIA - dimension.sinIA > 15 ? 'alerta' : undefined} />
                </div>
              ))}
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: `Ruta ${ruta.toLowerCase()}`, texto: confirmada ? 'Volver al panel' : 'Confirmar ruta', alPulsar: () => (confirmada ? (window.location.hash = '#/d1') : setConfirmada(true)) }} />
    </Pantalla>
  );
}

export const D2DiagnosticoRutas = conModoDemo(D2DiagnosticoRutasEjemplo, D2DiagnosticoReal);
