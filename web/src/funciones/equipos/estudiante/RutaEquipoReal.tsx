import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { useCurso } from '../../../compartido/estado/curso';
import { Estado, Tarjeta } from '../../../compartido/ui/panel';
import { Pantalla } from '../../../compartido/ui/ui';
import { misEquipos, trabajosConEquipo, type MiEquipo, type TrabajoConEquipo } from '../../../servicios/equipos';

export function E24EquipoReal() {
  const { curso } = useCurso();
  const [trabajos, setTrabajos] = useState<TrabajoConEquipo[] | null>(null);
  const [equipos, setEquipos] = useState<MiEquipo[]>([]);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    Promise.all([trabajosConEquipo(curso.id), misEquipos(curso.id)])
      .then(([lista, mios]) => { setTrabajos(lista.filter((trabajo) => trabajo.tamanoEquipo !== null)); setEquipos(mios); })
      .catch(() => setFallo(true));
  }, [curso]);

  return (
    <Pantalla clase="p-e24">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker={curso?.nombre ?? 'Curso'} titulo="Mi equipo" subtitulo="Con quién haces cada trabajo en equipo." objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar tus equipos. Intenta de nuevo en un momento.</p>}
          {trabajos?.length === 0 && <Tarjeta kicker="Por ahora" titulo="Trabajos individuales"><p className="meta">Ningún trabajo del curso es en equipo. Si tu docente define alguno, aquí verás con quién lo haces.</p></Tarjeta>}
          <div className="ruta__columnas">
            {trabajos?.map((trabajo) => {
              const equipo = equipos.find((candidato) => candidato.trabajoId === trabajo.id);
              return (
                <Tarjeta key={trabajo.id} tono={equipo ? 'menta' : 'clara'} kicker={trabajo.nombre} titulo={equipo ? equipo.equipo : 'Equipo por definir'} accion={equipo ? <Estado tipo="ok">Asignado</Estado> : <Estado tipo="tarde">Pendiente</Estado>}>
                  {equipo ? (
                    <ul className="ruta__equipo">
                      {equipo.integrantes.map((integrante) => (
                        <li key={integrante.nombre + (integrante.usuario ?? '')} className={integrante.soyYo ? 'yo' : ''}>
                          <span className="avatar avatar--verde">{integrante.nombre.slice(0, 2).toUpperCase()}</span>
                          <div><strong>{integrante.soyYo ? 'Tú' : integrante.nombre}</strong><small>{integrante.usuario ? `@${integrante.usuario}` : ''}</small></div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="meta">Tu docente aún no sortea los equipos de este trabajo, de {trabajo.tamanoEquipo} personas.</p>}
                </Tarjeta>
              );
            })}
          </div>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
