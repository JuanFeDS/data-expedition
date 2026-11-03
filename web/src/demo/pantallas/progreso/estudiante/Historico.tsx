import { useState } from 'react';
import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { BarraDato, Dato, Estado, Tarjeta, type TipoEstado } from '../../../../compartido/ui/panel';
import { Pantalla, Segmentado } from '../../../../compartido/ui/ui';
import { historicoEncuestas, historicoRelampagos, pulsoSemanal } from '../../../datosPlan';

const TEXTO: Record<string, { tipo: TipoEstado; texto: string }> = {
  acierto: { tipo: 'ok', texto: 'Acierto' },
  fallo: { tipo: 'alerta', texto: 'Fallo' },
  fuera: { tipo: 'tarde', texto: 'Fuera de tiempo' },
};

export function E30HistoricoEjemplo() {
  const [vista, setVista] = useState(0);
  const aciertos = historicoRelampagos.filter((registro) => registro.resultado === 'acierto').length;
  const xp = historicoRelampagos.reduce((suma, registro) => suma + registro.xp, 0);
  return (
    <Pantalla clase="p-e30">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Lo que has respondido" titulo="Mis resultados" subtitulo="Relámpagos, encuestas y votaciones, sesión por sesión." objeto="trofeo" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Relámpagos', 'Encuestas', 'Votaciones']} activa={vista} alCambiar={setVista} />
          <div className="hist__columnas" key={vista}>
            {vista === 0 && (
              <>
                <Tarjeta tono="menta" kicker="Hasta la semana 4" titulo={`${aciertos} de ${historicoRelampagos.length} acertadas`}>
                  <div className="rejilla">
                    <Dato valor={`+${xp}`} etiqueta="XP de bonificación" nota="No es nota" />
                    <Dato valor={`${Math.round((aciertos / historicoRelampagos.length) * 100)} %`} etiqueta="Acierto" nota="Dentro de la ventana" />
                  </div>
                  <div className="hist__barras" role="img" aria-label="Resultado de cada relámpago">
                    {historicoRelampagos.map((registro, indice) => <i key={registro.sesion} className={`hist__barra hist__barra--${registro.resultado}`} style={{ '--i': indice } as React.CSSProperties} title={`${registro.sesion}: ${TEXTO[registro.resultado].texto}`} />)}
                  </div>
                </Tarjeta>
                <Tarjeta kicker="Una por sesión" titulo="Detalle">
                  <ul className="hist__lista">
                    {historicoRelampagos.map((registro, indice) => (
                      <li key={registro.sesion} style={{ '--i': indice } as React.CSSProperties}>
                        <b>{registro.sesion}</b>
                        <div><strong>{registro.tema}</strong><small>{registro.segundos} s · {registro.xp > 0 ? `+${registro.xp} XP` : 'sin XP'}</small></div>
                        <Estado tipo={TEXTO[registro.resultado].tipo}>{TEXTO[registro.resultado].texto}</Estado>
                      </li>
                    ))}
                  </ul>
                </Tarjeta>
              </>
            )}
            {vista === 1 && (
              <>
                <Tarjeta kicker="Pulso semanal del grupo" titulo="Cómo ha ido la clase" accion={<Estado tipo="info">Anónimo</Estado>}>
                  {pulsoSemanal.map((semana) => <BarraDato key={semana.semana} etiqueta={`Semana ${semana.semana}`} valor={semana.claridad} maximo={5} sufijo=" / 5" />)}
                  <p className="meta">Claridad promedio de todo el grupo. Tu respuesta individual no se ve.</p>
                </Tarjeta>
                <Tarjeta kicker="Lo que contestaste" titulo="Encuestas">
                  <ul className="hist__lista">
                    {historicoEncuestas.map((encuesta, indice) => (
                      <li key={`${encuesta.nombre}${encuesta.semana}`} style={{ '--i': indice } as React.CSSProperties}>
                        <b>S{encuesta.semana}</b>
                        <div><strong>{encuesta.nombre}</strong><small>{encuesta.respuesta}</small></div>
                        <Estado tipo="ok">Enviada</Estado>
                      </li>
                    ))}
                  </ul>
                </Tarjeta>
              </>
            )}
            {vista === 2 && (
              <>
                <Tarjeta kicker="Semana 2 · cerrada" titulo="Librería de visualización" accion={<Estado tipo="ok">Ganó Plotly</Estado>}>
                  <BarraDato etiqueta="Plotly" valor={58} />
                  <BarraDato etiqueta="Matplotlib" valor={42} tono="azul" />
                  <p className="meta">Tu voto: <b>Plotly</b>. Se usa en el Trabajo 1 y en el resto del curso.</p>
                </Tarjeta>
                <Tarjeta kicker="Semana 5 · aún no abre" titulo="Herramienta de dashboards" accion={<Estado tipo="pendiente">Próxima</Estado>}>
                  <p className="meta">Power BI, Looker Studio o Streamlit. Se vota en la S9 y define el Trabajo 4.</p>
                </Tarjeta>
              </>
            )}
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Sigue sumando', texto: 'Ver mi liga', ruta: '#/e31' }} />
    </Pantalla>
  );
}

