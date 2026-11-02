import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Estado, Tarjeta, Vacio } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';

export function E26Estados() {
  return (
    <Pantalla clase="p-e26">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Tutorial', ruta: '#/tutorial' }} kicker="Guía de diseño" titulo="Estados del sistema" subtitulo="Cómo se ve la app cuando no hay datos, carga, falla o no hay red." objeto="linterna" />
        <div className="contenido cuerpo-mundo panel">
          <div className="est__rejilla">
            <Vacio titulo="Aún no tienes notas" texto="Cuando tu docente califique tu primer trabajo, lo verás aquí con su rúbrica." pose="pensando" accion={<a className="boton boton--suave" href="#/e5">Ir a mis entregas</a>} />
            <Tarjeta kicker="Cargando" titulo="Trayendo tu radar">
              <div className="est__esqueleto" aria-busy="true" aria-label="Cargando">
                <i style={{ width: '70%' }} /><i style={{ width: '100%' }} /><i style={{ width: '85%' }} /><i style={{ width: '45%' }} />
              </div>
            </Tarjeta>
            <Vacio titulo="No pudimos cargar tus entregas" texto="Revisa tu conexión e intenta de nuevo. Lo que ya habías escrito sigue guardado." pose="saluda" accion={<button className="boton boton--accent">Reintentar</button>} />
            <Tarjeta tono="aviso" kicker="Sin conexión" titulo="Estás sin internet" accion={<Estado tipo="tarde">Sin red</Estado>}>
              <p className="meta">Puedes seguir leyendo lo que ya abriste. Tus respuestas se enviarán cuando vuelva la conexión, salvo la relámpago, que exige estar en línea.</p>
            </Tarjeta>
            <Vacio titulo="Esta relámpago ya se cerró" texto="La ventana terminó y no sumó bonificación. La explicación quedó disponible para repasar." pose="guia" accion={<a className="boton boton--suave" href="#/e15">Practicar el tema</a>} />
            <Vacio titulo="Este contenido es de otro rol" texto="Solo el docente puede abrir esta pantalla. Si crees que es un error, avísale." pose="pensando" accion={<a className="boton boton--suave" href="#/home">Volver al inicio</a>} />
          </div>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
