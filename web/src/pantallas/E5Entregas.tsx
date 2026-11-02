import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { Isla } from '../componentes/Region';
import { Kicker, Pantalla, Pill, Segmentado } from '../componentes/ui';
import { semanaActual, trabajoActual, trabajoSiguiente } from '../datos';

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
    <Pantalla clase="p-e5">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker={`Semana ${semanaActual} · Cueva de la Escala`} titulo="Entregas" subtitulo="Lo que debes entregar y lo que ya enviaste." objeto="cuaderno" />
        <div className="contenido cuerpo-mundo centrar" style={{ gap: 8 }}>
          <Segmentado opciones={['Pendientes', 'Entregadas']} activa={vista} alCambiar={setVista} />
          {vista === 0 ? (
            <>
              <section className="bloque-actual">
                <Kicker>Entrega en curso · semana {semanaActual}</Kicker>
                <h2 className="titulo">{trabajoActual.titulo}</h2>
                <p>{trabajoActual.tema}. Tienes un borrador guardado hace 2 h.</p>
                <span className="hoja__fecha bloque-actual__fecha"><small>{trabajoActual.vence.dia}</small><b>{trabajoActual.vence.numero}</b></span>
                <a className="bloque-actual__accion" href="#/e6"><Pill variante="deep" boton>Continuar entrega</Pill></a>
              </section>
              <div className="entrega-bloqueada">
                <span className="entrega-bloqueada__icono"><Candado /></span>
                <div>
                  <strong>{trabajoSiguiente.titulo}</strong>
                  <small>Semana {trabajoSiguiente.semana} · se abre al entregar el {trabajoActual.titulo}</small>
                </div>
              </div>
              <div className="azar">
                <Jaguar pose="pensando" ancho={92} clase="azar__guia" />
                <div>
                  <Kicker>Revisión al azar · semana {semanaActual + 1}</Kicker>
                  <p>Cada semana se sortean 2 o 3 equipos para explicar una decisión en 3 minutos. Ten lista tu bitácora.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="entrega-hecha">
                <span className="isla-mini"><Isla bioma="desierto" /></span>
                <div className="fila__texto">
                  <Kicker>Entregado el 20 nov · semana 3</Kicker>
                  <strong className="fila__titulo">Trabajo 2</strong>
                  <div className="chips"><Pill variante="azul" pequena>Sin IA</Pill><Pill variante="accent" pequena>3.8</Pill><Pill variante="suave" pequena>Fusionado por el docente</Pill></div>
                </div>
                <a href="#/e4"><Pill variante="suave" boton>Ver nota</Pill></a>
              </div>
              <div className="entrega-hecha">
                <span className="isla-mini"><Isla bioma="selva" /></span>
                <div className="fila__texto">
                  <Kicker>Entregado el 6 nov · semana 1</Kicker>
                  <strong className="fila__titulo">Diagnóstico</strong>
                  <span className="meta" style={{ fontSize: 12 }}>No cuenta para aprobar</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Dock accion={{ etiqueta: `Vence ${trabajoActual.vence.dia.toLowerCase()} ${trabajoActual.vence.numero}`, texto: `Continuar ${trabajoActual.titulo}`, ruta: '#/e6' }} />
    </Pantalla>
  );
}
