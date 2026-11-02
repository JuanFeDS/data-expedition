import { useEffect, useMemo, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso } from '../componentes/curso';
import { Dato, Tarjeta } from '../componentes/panel';
import { useSesion } from '../componentes/sesion';
import { Pantalla } from '../componentes/ui';
import { crearServicioCursosDemo, servicioCursosSupabase } from '../servicios/cursos';
import { servicioSupabase as personasReal, type DatosPersonas } from '../servicios/personas';
import { crearServicioDemo as personasDemo } from '../servicios/personasDemo';
import { formatoFecha, useServicioTrabajos, type TrabajoCurso } from '../servicios/trabajos';

const cursosDemo = crearServicioCursosDemo();
const plural = (cantidad: number, uno: string, varios: string) => `${cantidad} ${cantidad === 1 ? uno : varios}`;

export function CursoDetalle() {
  const { persona, modoDemo } = useSesion();
  const { curso } = useCurso();
  const trabajosServicio = useServicioTrabajos();
  const personas = useMemo(() => (modoDemo ? personasDemo() : personasReal), [modoDemo]);
  const cursos = modoDemo ? cursosDemo : servicioCursosSupabase;
  const rol = persona?.rol ?? 'estudiante';
  const esDocente = rol === 'docente';
  const [trabajos, setTrabajos] = useState<TrabajoCurso[] | null>(null);
  const [datos, setDatos] = useState<DatosPersonas | null>(null);
  const [miGrupo, setMiGrupo] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    setFallo(false);
    void trabajosServicio.cargarTrabajos(curso.id).then(setTrabajos).catch(() => setFallo(true));
    if (esDocente) void personas.cargar(curso.id).then(setDatos).catch(() => setFallo(true));
    else void cursos.miGrupo(curso.id).then(setMiGrupo).catch(() => setMiGrupo(null));
  }, [curso, esDocente, personas, cursos, trabajosServicio]);

  const estudiantes = datos?.personas.filter((candidata) => candidata.rol === 'estudiante') ?? [];
  const porGrupo = (grupoId: string) => estudiantes.filter((candidata) => candidata.grupoId === grupoId).length;
  const sinGrupo = estudiantes.filter((candidata) => !candidata.grupoId).length;

  return (
    <Pantalla rol={rol} clase="p-cursos">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Cursos', ruta: '#/cursos' }} kicker={curso?.periodo ? `Periodo ${curso.periodo}` : 'Tu curso'} titulo={curso?.nombre ?? 'Curso'} subtitulo={esDocente ? 'Un vistazo a tu curso: personas, grupos y trabajos.' : 'Lo que necesitas saber de este curso.'} objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar la información del curso. Intenta de nuevo.</p>}
          {!curso && <Tarjeta kicker="Sin curso" titulo="Elige un curso"><p className="meta">Vuelve a <a href="#/cursos"><u>Cursos</u></a> y elige uno.</p></Tarjeta>}
          {curso && esDocente && (
            <>
              <div className="detalle__datos">
                <Tarjeta><Dato valor={estudiantes.length} etiqueta={estudiantes.length === 1 ? 'Estudiante' : 'Estudiantes'} nota={datos ? `${datos.invitaciones.length} por registrarse` : undefined} /></Tarjeta>
                <Tarjeta><Dato valor={datos?.grupos.length ?? 0} etiqueta={datos?.grupos.length === 1 ? 'Grupo' : 'Grupos'} /></Tarjeta>
                <Tarjeta><Dato valor={trabajos?.length ?? 0} etiqueta={trabajos?.length === 1 ? 'Trabajo' : 'Trabajos'} /></Tarjeta>
              </div>
              <div className="d13__columnas">
                <Tarjeta kicker="Organización" titulo="Grupos" accion={<a className="cursos__secundaria" href="#/d13">Gestionar</a>}>
                  <ul className="detalle__lista">
                    {datos?.grupos.map((grupo) => <li key={grupo.id}><strong>{grupo.nombre}</strong><small>{plural(porGrupo(grupo.id), 'estudiante', 'estudiantes')}</small></li>)}
                    {sinGrupo > 0 && <li><strong>Sin grupo</strong><small>{plural(sinGrupo, 'estudiante', 'estudiantes')}</small></li>}
                    {datos && datos.grupos.length === 0 && sinGrupo === 0 && <li><small>Aún no hay grupos ni estudiantes.</small></li>}
                  </ul>
                </Tarjeta>
                <Tarjeta kicker="Qué se entrega" titulo="Trabajos" accion={<a className="cursos__secundaria" href="#/d14">Gestionar</a>}>
                  <ul className="detalle__lista">
                    {trabajos?.map((trabajo) => <li key={trabajo.id}><strong>{trabajo.nombre}</strong><small>Vence {formatoFecha(trabajo.venceEn).largo}</small></li>)}
                    {trabajos && trabajos.length === 0 && <li><small>Aún no hay trabajos.</small></li>}
                  </ul>
                </Tarjeta>
              </div>
            </>
          )}
          {curso && !esDocente && (
            <div className="d13__columnas">
              <Tarjeta kicker="Tu lugar" titulo="Tu grupo">
                <p className="meta">{miGrupo ? <>Estás en <b>{miGrupo}</b>.</> : 'Aún no te asignan un grupo. Tu docente lo hará pronto.'}</p>
              </Tarjeta>
              <Tarjeta kicker="Qué se entrega" titulo="Trabajos" accion={<a className="cursos__secundaria" href="#/e5">Mis entregas</a>}>
                <ul className="detalle__lista">
                  {trabajos?.map((trabajo) => <li key={trabajo.id}><strong>{trabajo.nombre}</strong><small>Vence {formatoFecha(trabajo.venceEn).largo}</small></li>)}
                  {trabajos && trabajos.length === 0 && <li><small>Tu docente aún no publica trabajos.</small></li>}
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
