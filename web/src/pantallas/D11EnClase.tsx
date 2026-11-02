import { useEffect, useMemo, useRef, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { BarraDato, Cuenta, Dato, Estado, Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import { estudiantes } from '../datosPlan';

type Fase = 'lista' | 'abierta' | 'cerrada';

function CodigoQR() {
  const celdas = useMemo(() => {
    const lado = 21;
    const buscador = (x: number, y: number) => [[0, 0], [lado - 7, 0], [0, lado - 7]].some(([bx, by]) => x >= bx && x < bx + 7 && y >= by && y < by + 7);
    let semilla = 17;
    const siguiente = () => { semilla = (semilla * 1103515245 + 12345) & 0x7fffffff; return semilla; };
    return Array.from({ length: lado * lado }, (_, indice) => {
      const x = indice % lado;
      const y = Math.floor(indice / lado);
      if (buscador(x, y)) {
        const bx = x >= lado - 7 ? x - (lado - 7) : x;
        const by = y >= lado - 7 ? y - (lado - 7) : y;
        return bx === 0 || bx === 6 || by === 0 || by === 6 || (bx >= 2 && bx <= 4 && by >= 2 && by <= 4);
      }
      return siguiente() % 3 === 0;
    });
  }, []);
  return (
    <svg className="qr" viewBox="0 0 21 21" shapeRendering="crispEdges" role="img" aria-label="Código QR de ejemplo">
      <rect width="21" height="21" fill="#fff" />
      {celdas.map((activa, indice) => (activa ? <rect key={indice} x={indice % 21} y={Math.floor(indice / 21)} width="1" height="1" fill="#073b3a" /> : null))}
    </svg>
  );
}

export function D11EnClase() {
  const [fase, setFase] = useState<Fase>('lista');
  const [respuestas, setRespuestas] = useState(0);
  const reloj = useRef<number>(0);

  useEffect(() => {
    if (fase !== 'abierta') return undefined;
    reloj.current = window.setInterval(() => setRespuestas((actual) => Math.min(estudiantes.length, actual + 1)), 1700);
    return () => window.clearInterval(reloj.current);
  }, [fase]);

  const abrir = () => { setRespuestas(0); setFase('abierta'); };
  const quienResponde = estudiantes.map((estudiante, indice) => ({ ...estudiante, respondio: indice < respuestas }));

  return (
    <Pantalla rol="docente" clase="p-d11">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="S8 · en vivo" titulo="En clase" subtitulo="Abre una relámpago y muestra el QR en pantalla." objeto="linterna" />
        <div className="contenido cuerpo-mundo panel">
          <div className="d11__columnas">
            {fase === 'lista' ? (
              <Tarjeta kicker="Listas para abrir" titulo="¿Qué abres ahora?">
                <button className="d11__opcion" onClick={abrir}><strong>Relámpago: ¿qué es una acción en Spark?</strong><small>60 segundos · un intento · +20 XP · identificada</small></button>
                <button className="d11__opcion" onClick={abrir}><strong>Pulso semanal · semana 4</strong><small>3 preguntas · anónima</small></button>
                <p className="meta">Al abrir, se genera el enlace corto y el QR.</p>
              </Tarjeta>
            ) : (
              <Tarjeta tono="oscura" kicker={fase === 'abierta' ? 'Abierta ahora' : 'Cerrada'} titulo="Escanea para responder" accion={fase === 'abierta' ? <Estado tipo="ok">En vivo</Estado> : <Estado tipo="pendiente">Cerrada</Estado>}>
                <div className="d11__qr">
                  <CodigoQR />
                  <div className="d11__lado-qr">
                    <strong className="d11__enlace">datax.app/r/8K2</strong>
                    {fase === 'abierta' && <Cuenta segundos={60} />}
                  </div>
                </div>
                {fase === 'abierta' && <button className="boton boton--accent" onClick={() => setFase('cerrada')}>Cerrar ahora</button>}
                {fase === 'cerrada' && <button className="boton boton--suave" onClick={() => setFase('lista')}>Volver a la lista</button>}
              </Tarjeta>
            )}
            <div className="d11__lado">
              <Tarjeta>
                <Dato valor={`${respuestas}/${estudiantes.length}`} etiqueta="Respuestas dentro de la ventana" nota={fase === 'lista' ? 'Aún no abres ninguna' : 'La presencia queda registrada'} />
                {fase !== 'lista' && <BarraDato etiqueta="Participación" valor={Math.round((respuestas / estudiantes.length) * 100)} />}
              </Tarjeta>
              {fase !== 'lista' && (
                <Tarjeta kicker="Quién falta" titulo="Presencia">
                  <ul className="d11__presencia">
                    {quienResponde.map((estudiante) => <li key={estudiante.id} className={estudiante.respondio ? 'si' : ''}><span className="avatar avatar--verde">{estudiante.iniciales}</span><small>{estudiante.nombre.split(' ')[0]}</small></li>)}
                  </ul>
                </Tarjeta>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: fase === 'lista' ? 'Ninguna abierta' : fase === 'abierta' ? 'En vivo' : 'Cerrada', texto: fase === 'lista' ? 'Abrir relámpago' : fase === 'abierta' ? 'Cerrar ahora' : 'Volver a la lista', alPulsar: () => (fase === 'lista' ? abrir() : fase === 'abierta' ? setFase('cerrada') : setFase('lista')) }} />
    </Pantalla>
  );
}
