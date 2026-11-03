import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { Cuenta, Estado, Tarjeta } from '../componentes/panel';
import { sonar } from '../componentes/sonidos';
import { Kicker, Pantalla, Segmentado } from '../componentes/ui';
import { conModoDemo } from '../componentes/conModoDemo';
import { E20Responder } from './E20Responder';

const OPCIONES = ['filter()', 'select()', 'count()', 'withColumn()'];
const RITMO = ['Muy lento', 'Lento', 'Justo', 'Rápido', 'Muy rápido'];
const CLARIDAD = ['Confusa', 'Regular', 'Aceptable', 'Clara', 'Muy clara'];
const CONFETI = Array.from({ length: 14 }, (_, i) => {
  const angulo = (i / 14) * Math.PI * 2;
  const distancia = 80 + (i % 3) * 24;
  return { dx: Math.round(Math.cos(angulo) * distancia), dy: Math.round(Math.sin(angulo) * distancia) - 16, giro: (i % 2 ? 1 : -1) * (100 + i * 22) };
});

function Estrella({ llena }: { llena: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
      <path d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8 6.6 19.7l1-6.1L3.2 9.3l6.1-.9L12 2.8Z" fill={llena ? 'var(--accent)' : 'none'} stroke={llena ? 'var(--accent)' : 'var(--line)'} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function Pulso() {
  const [paso, setPaso] = useState(0);
  const [ritmo, setRitmo] = useState<number | null>(null);
  const [claridad, setClaridad] = useState(0);
  const [enviado, setEnviado] = useState(false);

  if (enviado) {
    return (
      <div className="pulso__fin">
        <div className="entrega__sello">
          <svg width="96" height="96" viewBox="0 0 84 84" fill="none" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="var(--mint)" /><path className="entrega__trazo" d="M25 43 37 55 60 30" stroke="var(--deep)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {CONFETI.map((pieza, indice) => <i key={indice} className="confeti" style={{ '--dx': `${pieza.dx}px`, '--dy': `${pieza.dy}px`, '--giro': `${pieza.giro}deg`, '--i': indice } as React.CSSProperties} />)}
        </div>
        <h2 className="titulo">¡Gracias!</h2>
        <p className="meta">Tu respuesta es anónima. El docente solo ve el resumen de todo el grupo.</p>
        <Jaguar pose="celebra" ancho={120} />
        <a className="boton boton--suave" href="#/e30">Ver mis resultados</a>
      </div>
    );
  }

  const puedeSeguir = paso === 0 ? ritmo !== null : paso === 1 ? claridad > 0 : true;
  return (
    <Tarjeta kicker="Anónima" titulo="Pulso de la semana" accion={<Estado tipo="info">{paso + 1} de 3</Estado>} clase="pulso">
      <div className="pulso__prog" aria-hidden="true">{[0, 1, 2].map((i) => <i key={i} className={i <= paso ? 'on' : ''} />)}</div>
      <div className="pulso__paso" key={paso}>
        {paso === 0 && (
          <>
            <Kicker>1 · El ritmo de la clase</Kicker>
            <div className="pulso__ritmo" role="radiogroup" aria-label="Ritmo de la clase">
              <span className="pulso__riel" aria-hidden="true"><i style={{ width: ritmo === null ? '0%' : `${(ritmo / 4) * 100}%` }} /></span>
              {RITMO.map((texto, indice) => (
                <button key={texto} role="radio" aria-checked={ritmo === indice} className={indice <= (ritmo ?? -1) ? 'on' : ''} onClick={() => setRitmo(indice)}><b>{indice + 1}</b></button>
              ))}
            </div>
            <p className="pulso__etiqueta">{ritmo === null ? 'Toca un punto de la escala' : RITMO[ritmo]}</p>
          </>
        )}
        {paso === 1 && (
          <>
            <Kicker>2 · Qué tan clara fue la sesión</Kicker>
            <div className="pulso__estrellas" role="radiogroup" aria-label="Claridad de 1 a 5">
              {[1, 2, 3, 4, 5].map((valor) => (
                <button key={valor} role="radio" aria-checked={claridad === valor} onClick={() => setClaridad(valor)} style={{ '--i': valor } as React.CSSProperties}><Estrella llena={valor <= claridad} /></button>
              ))}
            </div>
            <p className="pulso__etiqueta">{claridad === 0 ? 'Toca una estrella' : CLARIDAD[claridad - 1]}</p>
          </>
        )}
        {paso === 2 && (
          <div className="campo"><label htmlFor="mejora">3 · Qué mantendrías o cambiarías</label><textarea id="mejora" rows={4} placeholder="Escribe lo que quieras… o déjalo vacío." /></div>
        )}
      </div>
      <div className="acciones">
        {paso > 0 && <button className="boton boton--suave" onClick={() => setPaso(paso - 1)}>Atrás</button>}
        <button className="boton boton--accent" disabled={!puedeSeguir} onClick={() => (paso === 2 ? setEnviado(true) : setPaso(paso + 1))}>{paso === 2 ? 'Enviar pulso' : 'Siguiente'}</button>
      </div>
    </Tarjeta>
  );
}

export function E20RelampagoEjemplo() {
  const [tipo, setTipo] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  useEffect(() => { if (tipo === 0) sonar('relampago'); }, [tipo]);
  const irAResultado = () => { window.location.hash = '#/e21'; };
  const accion = tipo === 0
    ? { etiqueta: 'Un solo intento', texto: 'Responder', alPulsar: irAResultado, deshabilitada: elegida === null }
    : { etiqueta: 'Tu respuesta es anónima', texto: 'Ver mis resultados', ruta: '#/e30' };

  return (
    <Pantalla clase="p-e20">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker={tipo === 0 ? 'Pregunta relámpago · S8' : 'Pulso semanal · semana 4'} titulo={tipo === 0 ? 'Responde antes de que se cierre' : 'Cuéntanos cómo va'} subtitulo={tipo === 0 ? 'Llegaste con el código QR. Cuenta solo si respondes a tiempo.' : 'Tres preguntas, menos de un minuto.'} objeto="linterna" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Relámpago', 'Pulso semanal']} activa={tipo} alCambiar={setTipo} />
          {tipo === 0 ? (
            <div className="rel__cuerpo">
              <Tarjeta tono="oscura" clase="rel__tiempo">
                <Cuenta segundos={60} />
                <div>
                  <Kicker>Ventana de tiempo</Kicker>
                  <strong>60 segundos</strong>
                  <small>XP de bonificación solo dentro de la ventana</small>
                </div>
              </Tarjeta>
              <Tarjeta kicker="Pregunta 1 de 1" titulo="En Spark, ¿cuál de estas operaciones es una acción?" accion={<Estado tipo="info">Un intento</Estado>}>
                <div className="rel__opciones">
                  {OPCIONES.map((opcion, indice) => (
                    <button key={opcion} className="opcion" aria-pressed={elegida === indice} onClick={() => setElegida(indice)}>
                      <span className="opcion__punto" />
                      <span><strong>{opcion}</strong></span>
                    </button>
                  ))}
                </div>
              </Tarjeta>
            </div>
          ) : <Pulso />}
        </div>
      </div>
      <Dock accion={accion} />
    </Pantalla>
  );
}

export const E20Relampago = conModoDemo(E20RelampagoEjemplo, E20Responder);
