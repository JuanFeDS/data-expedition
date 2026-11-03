import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso } from '../componentes/curso';
import { Dato, Estado, Tarjeta } from '../componentes/panel';
import { Pantalla, Segmentado } from '../componentes/ui';
import { miHistorico, type HistoricoPropio } from '../servicios/estudiante';

const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

export function E30HistoricoReal() {
  const { curso } = useCurso();
  const [vista, setVista] = useState(0);
  const [datos, setDatos] = useState<HistoricoPropio | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    miHistorico(curso.id).then(setDatos).catch(() => setFallo(true));
  }, [curso]);

  const relampagos = datos?.relampagos ?? [];
  const aciertos = relampagos.filter((registro) => registro.acerto).length;
  const lista = vista === 1 ? datos?.encuestas : datos?.votaciones;

  return (
    <Pantalla clase="p-e30">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker="Lo que has respondido" titulo="Mis resultados" subtitulo="Relámpagos, encuestas y votaciones, una por una." objeto="trofeo" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar tus resultados. Intenta de nuevo en un momento.</p>}
          <Segmentado opciones={['Relámpagos', 'Encuestas', 'Votaciones']} activa={vista} alCambiar={setVista} />
          <div className="hist__columnas" key={vista}>
            {vista === 0 && (
              <>
                <Tarjeta tono="menta" kicker="Hasta hoy" titulo={`${aciertos} de ${relampagos.length} acertadas`}>
                  <div className="rejilla">
                    <Dato valor={relampagos.length ? `${Math.round((aciertos / relampagos.length) * 100)} %` : '—'} etiqueta="Acierto" nota="En los relámpagos que respondiste" />
                    <Dato valor={relampagos.length} etiqueta="Respondidos" />
                  </div>
                </Tarjeta>
                <Tarjeta kicker="Una por sesión" titulo="Detalle">
                  <ul className="hist__lista">
                    {relampagos.map((registro, indice) => (
                      <li key={registro.formularioId} style={{ '--i': indice } as React.CSSProperties}>
                        <b>{fecha(registro.fecha)}</b>
                        <div><strong>{registro.titulo}</strong></div>
                        <Estado tipo={registro.acerto ? 'ok' : 'alerta'}>{registro.acerto ? 'Acierto' : 'Fallo'}</Estado>
                      </li>
                    ))}
                    {datos && relampagos.length === 0 && <li><div><small>Aún no has respondido ningún relámpago.</small></div></li>}
                  </ul>
                </Tarjeta>
              </>
            )}
            {vista !== 0 && (
              <Tarjeta kicker="Lo que contestaste" titulo={vista === 1 ? 'Encuestas' : 'Votaciones'} accion={vista === 1 ? <Estado tipo="info">Anónimas o no, solo tú lo ves</Estado> : null}>
                <ul className="hist__lista">
                  {lista?.map((registro, indice) => (
                    <li key={registro.formularioId} style={{ '--i': indice } as React.CSSProperties}>
                      <b>{fecha(registro.fecha)}</b>
                      <div><strong>{registro.titulo}</strong></div>
                      <Estado tipo="ok">{registro.estado}</Estado>
                    </li>
                  ))}
                  {datos && (lista?.length ?? 0) === 0 && <li><div><small>{vista === 1 ? 'Aún no has respondido encuestas.' : 'Aún no has votado.'}</small></div></li>}
                </ul>
              </Tarjeta>
            )}
          </div>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
