import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Cuenta, Estado, Tarjeta, Vacio } from '../componentes/panel';
import { Kicker, Pantalla, Segmentado } from '../componentes/ui';

const OPCIONES = ['filter()', 'select()', 'count()', 'withColumn()'];
const RITMO = ['Muy lento', 'Lento', 'Justo', 'Rápido', 'Muy rápido'];

export function E20Relampago() {
  const [tipo, setTipo] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [ritmo, setRitmo] = useState<number | null>(null);
  const [claridad, setClaridad] = useState(0);
  const [enviado, setEnviado] = useState(false);

  const irAResultado = () => { window.location.hash = '#/e21'; };
  const accion = tipo === 0
    ? { etiqueta: 'Un solo intento', texto: 'Responder', alPulsar: irAResultado, deshabilitada: elegida === null }
    : { etiqueta: 'Tu respuesta es anónima', texto: enviado ? 'Enviado' : 'Enviar pulso', alPulsar: () => setEnviado(true), deshabilitada: ritmo === null || claridad === 0 || enviado };

  return (
    <Pantalla clase="p-e20">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker={tipo === 0 ? 'Pregunta relámpago · S8' : 'Pulso semanal · semana 4'} titulo={tipo === 0 ? 'Responde antes de que se cierre' : 'Cuéntanos cómo va'} subtitulo={tipo === 0 ? 'Llegaste con el código QR. Cuenta solo si respondes a tiempo.' : 'Tres preguntas, menos de un minuto.'} objeto="linterna" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Relámpago', 'Pulso semanal']} activa={tipo} alCambiar={(valor) => { setTipo(valor); setEnviado(false); }} />
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
          ) : enviado ? (
            <Vacio titulo="¡Gracias!" texto="Tu respuesta es anónima. El docente solo ve el resumen de todo el grupo." pose="celebra" />
          ) : (
            <Tarjeta kicker="Anónima" titulo="Pulso de la semana" accion={<Estado tipo="info">3 preguntas</Estado>}>
              <div className="rel__pregunta">
                <Kicker>1 · El ritmo de la clase</Kicker>
                <div className="rel__escala">
                  {RITMO.map((texto, indice) => <button key={texto} className="diag__chip" aria-pressed={ritmo === indice} onClick={() => setRitmo(indice)}>{texto}</button>)}
                </div>
              </div>
              <div className="rel__pregunta">
                <Kicker>2 · Qué tan clara fue la sesión</Kicker>
                <div className="rel__estrellas" role="radiogroup" aria-label="Claridad de 1 a 5">
                  {[1, 2, 3, 4, 5].map((valor) => <button key={valor} role="radio" aria-checked={claridad === valor} className={valor <= claridad ? 'on' : ''} onClick={() => setClaridad(valor)}>{valor}</button>)}
                </div>
              </div>
              <div className="campo"><label htmlFor="mejora">3 · Qué mantendrías o cambiarías</label><textarea id="mejora" rows={3} placeholder="Escribe lo que quieras…" /></div>
            </Tarjeta>
          )}
        </div>
      </div>
      <Dock accion={accion} />
    </Pantalla>
  );
}
