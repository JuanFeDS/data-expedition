import { useState } from 'react';
import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { Estado, Tarjeta } from '../../../../compartido/ui/panel';
import { Contador, Pantalla, Segmentado } from '../../../../compartido/ui/ui';
import { ligaActual } from '../../../datosPlan';

export function E31LigaEjemplo() {
  const [vista, setVista] = useState(0);
  const lista = ligaActual.participantes;
  const total = lista.length;
  const puesto = lista.findIndex((persona) => persona.yo) + 1;
  const maximo = lista[0].xp;
  return (
    <Pantalla clase="p-e31">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Votación', ruta: '#/e9' }} kicker={`Modo competitivo · cierra el ${ligaActual.cierra}`} titulo={ligaActual.nombre} subtitulo={`${ligaActual.nivel}. Sin tabla global.`} objeto="trofeo">
          <div className="cifra-mundo"><span className="num">{puesto}º</span><small>de {total} en tu liga</small></div>
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Mi liga', 'Cómo funciona']} activa={vista} alCambiar={setVista} />
          {vista === 0 ? (
            <div className="liga__columnas">
              <Tarjeta kicker="XP de esta semana" titulo="Clasificación" accion={<Estado tipo="info">Se reinicia el lunes</Estado>}>
                <ol className="liga__lista">
                  {lista.map((persona, indice) => {
                    const zona = indice < ligaActual.ascienden ? 'sube' : indice >= total - ligaActual.descienden ? 'baja' : '';
                    return (
                      <li key={persona.nombre} className={`liga__fila ${zona ? `liga__fila--${zona}` : ''} ${persona.yo ? 'liga__fila--yo' : ''}`} style={{ '--i': indice } as React.CSSProperties}>
                        <b className="liga__puesto">{indice + 1}</b>
                        <span className={`avatar avatar--${persona.yo ? 'verde' : 'azul'}`}>{persona.iniciales}</span>
                        <div className="liga__datos">
                          <strong>{persona.yo ? 'Tú' : persona.nombre}</strong>
                          <span className="liga__barra"><i style={{ width: `${(persona.xp / maximo) * 100}%` }} /></span>
                        </div>
                        <span className="liga__xp"><Contador valor={persona.xp} /> XP</span>
                        <span className={`liga__cambio liga__cambio--${persona.cambio > 0 ? 'sube' : persona.cambio < 0 ? 'baja' : 'igual'}`} aria-label={persona.cambio > 0 ? `Subió ${persona.cambio}` : persona.cambio < 0 ? `Bajó ${-persona.cambio}` : 'Sin cambio'}>{persona.cambio > 0 ? `▲ ${persona.cambio}` : persona.cambio < 0 ? `▼ ${-persona.cambio}` : '–'}</span>
                      </li>
                    );
                  })}
                </ol>
                <div className="liga__leyenda"><span><i className="sube" />Ascienden a la liga siguiente</span><span><i className="baja" />Bajan a la anterior</span></div>
              </Tarjeta>
              <Tarjeta tono="menta" kicker="Para subir de puesto" titulo="Te faltan 45 XP">
                <p className="meta">Una sesión de práctica da 30 XP, y una relámpago a tiempo, 20. Con dos sesiones pasas a Valentina y llegas a la zona de ascenso.</p>
                <a className="boton boton--accent" href="#/e15">Practicar ahora</a>
              </Tarjeta>
            </div>
          ) : (
            <div className="liga__columnas">
              <Tarjeta kicker="Reglas" titulo="Ligas pequeñas, por nivel">
                <ul className="liga__reglas">
                  <li><b>1</b>Tu liga se arma con personas de tu mismo nivel del diagnóstico, de a 6.</li>
                  <li><b>2</b>Compites solo con el XP de la semana: sesiones, relámpagos y misiones.</li>
                  <li><b>3</b>Los dos primeros suben de liga y los dos últimos bajan. El lunes se reinicia.</li>
                  <li><b>4</b>No hay tabla global ni se muestran las notas. El XP no es nota.</li>
                </ul>
              </Tarjeta>
              <Tarjeta kicker="Tu grupo votó" titulo="Modo competitivo" accion={<Estado tipo="ok">Mayoría</Estado>}>
                <p className="meta">Este módulo ganó el modo competitivo, 14 votos contra 8. En el siguiente módulo se vuelve a votar.</p>
                <a className="boton boton--suave" href="#/e9">Ver la votación</a>
              </Tarjeta>
            </div>
          )}
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Esta semana', texto: 'Sumar XP', ruta: '#/e15' }} />
    </Pantalla>
  );
}

