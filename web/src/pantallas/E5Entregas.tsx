import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { Isla } from '../componentes/Region';
import { Kicker, Pantalla, Pill, Segmentado } from '../componentes/ui';

function Candado() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" fill="currentColor" />
      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function E5Entregas() {
  const [vista, setVista] = useState(0);
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Semana 4 · Desierto del Modelado" titulo="Entregas" subtitulo="Lo que debes entregar y lo que ya enviaste." objeto="cuaderno" />
        <div className="contenido cuerpo-mundo" style={{ gap: 8 }}>
          <Segmentado opciones={['Pendientes', 'Entregadas']} activa={vista} alCambiar={setVista} />
          {vista === 0 ? (
            <>
              <section className="bloque-actual">
                <Kicker>Entrega en curso · semanas 4–5</Kicker>
                <h2 className="titulo">Trabajo 2</h2>
                <p>Modelo predictivo. Tienes un borrador guardado hace 2 h.</p>
                <span className="hoja__fecha bloque-actual__fecha"><small>VIE</small><b>7</b></span>
                <a className="bloque-actual__accion" href="#/e6"><Pill variante="deep" boton>Continuar entrega</Pill></a>
              </section>
              <div className="entrega-bloqueada">
                <span className="entrega-bloqueada__icono"><Candado /></span>
                <div>
                  <strong>Trabajo 3</strong>
                  <small>Semana 6 · se abre al entregar el Trabajo 2</small>
                </div>
              </div>
              <div className="azar">
                <Jaguar pose="pensando" ancho={92} clase="azar__guia" />
                <div>
                  <Kicker>Revisión al azar · semana 5</Kicker>
                  <p>Cada semana se sortean 2 o 3 equipos para explicar una decisión en 3 minutos. Ten lista tu bitácora.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="entrega-hecha">
                <span className="isla-mini"><Isla bioma="costa" /></span>
                <div className="fila__texto">
                  <Kicker>Entregado el 18 oct · semana 3</Kicker>
                  <strong className="fila__titulo">Trabajo 1</strong>
                  <div className="chips"><Pill variante="suave" pequena>Con IA</Pill><Pill variante="accent" pequena>4.2</Pill></div>
                </div>
                <a href="#/e4"><Pill variante="suave" boton>Ver nota</Pill></a>
              </div>
              <div className="entrega-hecha">
                <span className="isla-mini"><Isla bioma="selva" /></span>
                <div className="fila__texto">
                  <Kicker>Entregado el 2 oct · semana 1</Kicker>
                  <strong className="fila__titulo">Diagnóstico</strong>
                  <span className="meta" style={{ fontSize: 12 }}>No cuenta para aprobar</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Vence vie 7', texto: 'Continuar Trabajo 2', ruta: '#/e6' }} />
    </Pantalla>
  );
}
