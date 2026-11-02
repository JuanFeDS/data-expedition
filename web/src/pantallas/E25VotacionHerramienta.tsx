import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { BarraDato, Estado, Tarjeta } from '../componentes/panel';
import { Pantalla, Segmentado } from '../componentes/ui';

const VOTACIONES = [
  { sesion: 'S4 · cerrada', titulo: 'Librería de visualización', usos: 'Trabajo 1 y el resto del curso', cerrada: true, opciones: [{ nombre: 'Plotly', votos: 19 }, { nombre: 'Matplotlib y Seaborn', votos: 14 }] },
  { sesion: 'S9 · abierta', titulo: 'Herramienta de dashboards', usos: 'Trabajo 4', cerrada: false, opciones: [{ nombre: 'Power BI', votos: 0 }, { nombre: 'Looker Studio', votos: 0 }, { nombre: 'Streamlit', votos: 0 }] },
];

export function E25VotacionHerramienta() {
  const [indice, setIndice] = useState(0);
  const [voto, setVoto] = useState<string | null>(null);
  const votacion = VOTACIONES[indice];
  const total = votacion.opciones.reduce((suma, opcion) => suma + opcion.votos, 0) + (votacion.cerrada || voto === null ? 0 : 1);
  const ganadora = votacion.cerrada ? [...votacion.opciones].sort((a, b) => b.votos - a.votos)[0] : null;

  return (
    <Pantalla clase="p-e25">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Calendario', ruta: '#/e22' }} kicker={`Votación · ${votacion.sesion}`} titulo={votacion.titulo} subtitulo={`Define la herramienta del ${votacion.usos}.`} objeto="urna" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['S4 · visualización', 'S9 · dashboards']} activa={indice} alCambiar={(valor) => { setIndice(valor); setVoto(null); }} />
          <div className="vot__columnas">
            <Tarjeta kicker={votacion.cerrada ? 'Resultado guardado' : 'Elige una'} titulo={ganadora ? `Ganó ${ganadora.nombre}` : 'Tu voto es anónimo'} accion={<Estado tipo={votacion.cerrada ? 'ok' : 'info'}>{votacion.cerrada ? 'Cerrada' : 'En vivo'}</Estado>}>
              <div className="vot__opciones">
                {votacion.opciones.map((opcion) => {
                  const votos = opcion.votos + (!votacion.cerrada && voto === opcion.nombre ? 1 : 0);
                  const porcentaje = total === 0 ? 0 : Math.round((votos / total) * 100);
                  return (
                    <button key={opcion.nombre} className="opcion vot__opcion" aria-pressed={voto === opcion.nombre} disabled={votacion.cerrada} onClick={() => setVoto(opcion.nombre)}>
                      <span className="opcion__punto" />
                      <span className="vot__texto"><strong>{opcion.nombre}</strong>{(votacion.cerrada || voto !== null) && <BarraDato etiqueta={`${votos} votos`} valor={porcentaje} tono={ganadora?.nombre === opcion.nombre ? undefined : 'azul'} />}</span>
                    </button>
                  );
                })}
              </div>
              <p className="meta">{votacion.cerrada ? 'El resultado queda en la edición del curso y el material de las próximas sesiones lo usa.' : 'Los resultados se muestran al cerrar la votación. Puedes cambiar tu voto hasta entonces.'}</p>
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: votacion.cerrada ? 'Votación cerrada' : voto ? 'Voto guardado' : 'Elige una opción', texto: 'Ver el calendario', ruta: '#/e22' }} />
    </Pantalla>
  );
}
