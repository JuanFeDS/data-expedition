import { useEffect, useMemo, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { useSesion } from '../componentes/sesion';
import { Pantalla } from '../componentes/ui';
import { fechaCorta, horaLocal, listarSesiones, type Sesion } from '../servicios/calendario';
import { servicioSupabase as personasReal, type DatosPersonas } from '../servicios/personas';
import { crearServicioDemo as personasDemo } from '../servicios/personasDemo';
import { formatoFecha, useServicioTrabajos, type EntregaPropia, type EntregaVista, type TrabajoCurso } from '../servicios/trabajos';

const DIA = 86400000;

const plazo = (iso: string | null) => {
  if (!iso) return { texto: 'Sin fecha', urgente: false, pasado: false };
  const dias = Math.ceil((new Date(iso).getTime() - Date.now()) / DIA);
  if (dias < 0) return { texto: 'Plazo vencido', urgente: false, pasado: true };
  if (dias === 0) return { texto: 'Vence hoy', urgente: true, pasado: false };
  if (dias === 1) return { texto: 'Vence mañana', urgente: true, pasado: false };
  return { texto: `En ${dias} días`, urgente: dias <= 3, pasado: false };
};

function Flecha() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function CursoDetalle() {
  const { persona, modoDemo } = useSesion();
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const trabajosServicio = useServicioTrabajos();
  const personas = useMemo(() => (modoDemo ? personasDemo() : personasReal), [modoDemo]);
  const rol = persona?.rol ?? 'estudiante';
  const esDocente = rol === 'docente';
  const [trabajos, setTrabajos] = useState<TrabajoCurso[] | null>(null);
  const [entregas, setEntregas] = useState<EntregaPropia[]>([]);
  const [recibidas, setRecibidas] = useState<EntregaVista[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [datos, setDatos] = useState<DatosPersonas | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    setFallo(false);
    void trabajosServicio.cargarTrabajos(curso.id).then(setTrabajos).catch(() => setFallo(true));
    if (esDocente) {
      void personas.cargar(curso.id).then(setDatos).catch(() => setFallo(true));
      void trabajosServicio.entregasDelCurso(curso.id).then(setRecibidas).catch(() => undefined);
    } else {
      void trabajosServicio.misEntregas(curso.id).then(setEntregas).catch(() => undefined);
    }
    if (!modoDemo) void listarSesiones(curso.id).then(setSesiones).catch(() => undefined);
  }, [curso, esDocente, personas, trabajosServicio, modoDemo]);

  const estudiantes = datos?.personas.filter((candidata) => candidata.rol === 'estudiante') ?? [];
  const entregaDe = (trabajoId: string) => entregas.find((entrega) => entrega.trabajoId === trabajoId && entrega.estado !== 'borrador');
  const hechos = (trabajos ?? []).filter((trabajo) => entregaDe(trabajo.id)).length;
  const proximoTrabajo = (trabajos ?? []).find((trabajo) => !entregaDe(trabajo.id) && (trabajo.venceEn === null || new Date(trabajo.venceEn).getTime() > Date.now()));
  const proximaSesion = sesiones.find((sesion) => sesion.iniciaEn !== null && new Date(sesion.iniciaEn).getTime() > Date.now());
  const notas = entregas.map((entrega) => entrega.nota).filter((nota): nota is number => typeof nota === 'number');
  const promedio = notas.length > 0 ? notas.reduce((suma, nota) => suma + nota, 0) / notas.length : null;
  const porCalificar = recibidas.filter((entrega) => entrega.estado === 'entregada').length;
  const detalle = (trabajo: TrabajoCurso) => `${rutaCurso('#/trabajo')}?trabajo=${trabajo.id}`;
  const enlaceSesion = (sesion: Sesion) => `${rutaCurso('#/e23')}?sesion=${sesion.id}`;
  const total = trabajos?.length ?? 0;

  const lista = (
    <section className="cd__trabajos" aria-label="Trabajos del curso">
      <header className="cd__cab">
        <div><span className="kicker">Qué se entrega</span><h2>Trabajos</h2></div>
        <a className="cursos__secundaria" href={rutaCurso(esDocente ? '#/d14' : '#/e5')}>{esDocente ? 'Gestionar' : 'Mis entregas'}</a>
      </header>
      <ul className="cd__lista">
        {trabajos?.map((trabajo, indice) => {
          const entrega = esDocente ? undefined : entregaDe(trabajo.id);
          const vence = plazo(trabajo.venceEn);
          const fecha = formatoFecha(trabajo.venceEn);
          return (
            <li key={trabajo.id} style={{ '--i': indice } as React.CSSProperties}>
              <a className="cd__trabajo" href={detalle(trabajo)}>
                <span className="cd__semana"><small>Sem</small><b>{trabajo.semana ?? '·'}</b></span>
                <span className="cd__texto">
                  <strong>{trabajo.nombre}</strong>
                  <small>{trabajo.tema || 'Sin tema'} · vence {fecha.largo}</small>
                </span>
                {!esDocente && (entrega
                  ? <span className={`cd__etiqueta ${entrega.estado === 'calificada' ? 'cd__etiqueta--nota' : 'cd__etiqueta--ok'}`}>{entrega.estado === 'calificada' && entrega.nota !== null ? `Nota ${entrega.nota.toFixed(1)}` : 'Entregado'}</span>
                  : <span className={`cd__etiqueta ${vence.urgente ? 'cd__etiqueta--urgente' : ''}`}>{vence.texto}</span>)}
                <span className="cd__ir"><Flecha /></span>
              </a>
            </li>
          );
        })}
        {trabajos && trabajos.length === 0 && <li className="cd__vacio">{esDocente ? 'Aún no hay trabajos. Crea el primero en Gestionar.' : 'Tu docente aún no publica trabajos.'}</li>}
      </ul>
    </section>
  );

  return (
    <Pantalla rol={rol} clase="p-cursos p-cursodetalle">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Cursos', ruta: '#/cursos' }} kicker={curso?.periodo ? `Periodo ${curso.periodo}` : 'Tu curso'} titulo={curso?.nombre ?? 'Curso'} subtitulo={esDocente ? 'Un vistazo a tu curso: personas, trabajos y clases.' : 'Lo que necesitas saber de este curso.'} objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar la información del curso. Intenta de nuevo.</p>}
          {!curso && <section className="cd__trabajos"><header className="cd__cab"><div><span className="kicker">Sin curso</span><h2>Elige un curso</h2></div></header><p className="meta">Vuelve a <a href="#/cursos"><u>Cursos</u></a> y elige uno.</p></section>}
          {curso && (
            <>
              <div className="cd__datos">
                {esDocente ? (
                  <>
                    <a className="cd__dato cd__dato--accent" href={rutaCurso('#/d13')}><b>{estudiantes.length}</b><span>{estudiantes.length === 1 ? 'Estudiante' : 'Estudiantes'}</span><small>{datos ? `${datos.invitaciones.length} por registrarse` : 'Cargando…'}</small></a>
                    <a className="cd__dato cd__dato--mint" href={rutaCurso('#/d14')}><b>{total}</b><span>{total === 1 ? 'Trabajo' : 'Trabajos'}</span><small>Publicados en el curso</small></a>
                    <a className="cd__dato cd__dato--deep" href={rutaCurso('#/d3')}><b>{porCalificar}</b><span>Por calificar</span><small>{porCalificar === 0 ? 'Todo al día' : 'Entregas recibidas'}</small></a>
                  </>
                ) : (
                  <>
                    <a className="cd__dato cd__dato--accent" href={proximoTrabajo ? detalle(proximoTrabajo) : rutaCurso('#/e5')}>
                      <b>{proximoTrabajo ? plazo(proximoTrabajo.venceEn).texto.replace('Vence ', '') : '¡Al día!'}</b><span>Próxima entrega</span><small>{proximoTrabajo ? proximoTrabajo.nombre : 'No tienes pendientes'}</small>
                    </a>
                    <a className="cd__dato cd__dato--mint" href={rutaCurso('#/e5')}><b>{hechos}/{total}</b><span>Entregados</span><small>{total === 0 ? 'Aún sin trabajos' : hechos === total ? '¡Completaste todos!' : `Te faltan ${total - hechos}`}</small></a>
                    <a className="cd__dato cd__dato--deep" href={rutaCurso('#/e3')}><b>{promedio === null ? '—' : promedio.toFixed(1)}</b><span>Promedio</span><small>{promedio === null ? 'Aún sin notas' : `${notas.length} ${notas.length === 1 ? 'nota' : 'notas'}`}</small></a>
                  </>
                )}
              </div>
              <div className="cd__columnas">
                {lista}
                <aside className="cd__lado">
                  <section className="cd__sesion">
                    <span className="kicker">Próxima clase</span>
                    {proximaSesion ? (
                      <a href={enlaceSesion(proximaSesion)}>
                        <b>{fechaCorta(proximaSesion.iniciaEn)}</b>
                        <strong>{proximaSesion.codigo} · {proximaSesion.tema}</strong>
                        <small>{horaLocal(proximaSesion.iniciaEn)} · {proximaSesion.modalidad === 'virtual' ? 'virtual' : 'presencial'}</small>
                      </a>
                    ) : <p className="meta">{esDocente ? <>Agrega las sesiones en <a href={rutaCurso('#/d6')}><u>Calendario</u></a>.</> : 'Tu docente aún no programa la próxima sesión.'}</p>}
                  </section>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
