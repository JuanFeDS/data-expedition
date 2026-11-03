import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Estado, Tarjeta, type TipoEstado } from '../componentes/panel';
import { Pantalla, Segmentado } from '../componentes/ui';
import { servicioSupabase as servicioPersonas, type PersonaCurso } from '../servicios/personas';
import { formatoFecha, useServicioTrabajos, type EntregaVista, type EstadoEntrega, type TrabajoCurso } from '../servicios/trabajos';

const TIPO: Record<EstadoEntrega, TipoEstado> = { borrador: 'pendiente', entregada: 'info', calificada: 'ok', no_presento: 'alerta' };
const TEXTO: Record<EstadoEntrega, string> = { borrador: 'Borrador', entregada: 'Entregada', calificada: 'Calificada', no_presento: 'No presentó' };

export function D3EntregasReal() {
  const servicio = useServicioTrabajos();
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [trabajos, setTrabajos] = useState<TrabajoCurso[]>([]);
  const [entregas, setEntregas] = useState<EntregaVista[]>([]);
  const [estudiantes, setEstudiantes] = useState<PersonaCurso[]>([]);
  const [indice, setIndice] = useState(0);
  const [fallo, setFallo] = useState(false);

  const cargar = useCallback(async () => {
    if (!curso) return;
    try {
      const [lista, vistas, personas] = await Promise.all([servicio.cargarTrabajos(curso.id), servicio.entregasDelCurso(curso.id), servicioPersonas.cargar(curso.id)]);
      setTrabajos(lista);
      setEntregas(vistas);
      setEstudiantes(personas.personas.filter((persona) => persona.rol === 'estudiante'));
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [servicio, curso]);

  useEffect(() => { void cargar(); }, [cargar]);

  const trabajo = trabajos[indice];
  const deEste = trabajo ? entregas.filter((entrega) => entrega.trabajoId === trabajo.id) : [];
  const quienEntrego = new Set(deEste.map((entrega) => entrega.usuario ?? entrega.estudiante));
  const faltan = estudiantes.filter((persona) => !quienEntrego.has(persona.usuario ?? persona.nombre ?? persona.correo));

  return (
    <Pantalla rol="docente" clase="p-d3">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker={trabajo ? `${trabajo.nombre}${trabajo.tema ? ` · ${trabajo.tema}` : ''}` : 'Trabajos'} titulo="Entregas" subtitulo={trabajo ? `Vence el ${formatoFecha(trabajo.venceEn).largo}. Mínimo de Pylint: ${trabajo.minPylint}.` : 'Aún no hay trabajos publicados.'} objeto="cuaderno" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar las entregas. <button onClick={() => void cargar()}>Reintentar</button></p>}
          {trabajos.length === 0 && !fallo && (
            <Tarjeta kicker="Primer paso" titulo="Publica los trabajos">
              <p className="meta">Agrégalos en <a href={rutaCurso('#/d14')}><u>Trabajos</u></a> para que los estudiantes puedan entregar.</p>
            </Tarjeta>
          )}
          {trabajos.length > 0 && <Segmentado opciones={trabajos.map((candidato) => candidato.nombre)} activa={indice} alCambiar={setIndice} />}
          {trabajo && (
            <div className="d3__columnas">
              <Tarjeta kicker="Entregas recibidas" titulo={`${deEste.length} de ${estudiantes.length}`}>
                <ul className="d13__personas">
                  {deEste.map((entrega) => (
                    <li key={entrega.id}>
                      <span className="avatar avatar--verde">{entrega.estudiante.slice(0, 2).toUpperCase()}</span>
                      <span className="d13__datos">
                        <strong>{entrega.estudiante}{entrega.usuario && <em> @{entrega.usuario}</em>}</strong>
                        <small>{entrega.modoIa === 'con_ia' ? 'Con IA' : 'Sin IA'}{entrega.entregadaEn ? ` · ${new Date(entrega.entregadaEn).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : ''}</small>
                      </span>
                      <Estado tipo={TIPO[entrega.estado]}>{TEXTO[entrega.estado]}</Estado>
                      {entrega.enlacePr && <a className="boton boton--suave" href={entrega.enlacePr} target="_blank" rel="noreferrer">Abrir PR</a>}
                      <a className="boton boton--accent" href={`${rutaCurso('#/d4')}?entrega=${entrega.id}`}>{entrega.estado === 'calificada' ? `Nota ${entrega.nota?.toFixed(1) ?? ''}` : 'Calificar'}</a>
                    </li>
                  ))}
                  {deEste.length === 0 && <li><span className="d13__datos"><small>Nadie ha entregado este trabajo todavía.</small></span></li>}
                </ul>
              </Tarjeta>
              <Tarjeta tono="aviso" kicker="Sin entregar" titulo={`${faltan.length} estudiantes`}>
                <ul className="d3__faltan">
                  {faltan.map((persona) => (
                    <li key={persona.id}>
                      <span className="avatar avatar--verde">{(persona.nombre ?? persona.correo).slice(0, 2).toUpperCase()}</span>
                      <div><strong>{persona.nombre ?? persona.correo}</strong><small>{persona.usuario ? `@${persona.usuario}` : 'Aún no completa su perfil'}</small></div>
                    </li>
                  ))}
                  {faltan.length === 0 && <li><div><small>Todos entregaron.</small></div></li>}
                </ul>
              </Tarjeta>
            </div>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
