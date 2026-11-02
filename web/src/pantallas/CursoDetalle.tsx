import { useEffect, useMemo, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Dato, Tarjeta } from '../componentes/panel';
import { useSesion } from '../componentes/sesion';
import { Pantalla } from '../componentes/ui';
import { servicioSupabase as personasReal, type DatosPersonas } from '../servicios/personas';
import { crearServicioDemo as personasDemo } from '../servicios/personasDemo';
import { formatoFecha, useServicioTrabajos, type TrabajoCurso } from '../servicios/trabajos';


export function CursoDetalle() {
  const { persona, modoDemo } = useSesion();
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const trabajosServicio = useServicioTrabajos();
  const personas = useMemo(() => (modoDemo ? personasDemo() : personasReal), [modoDemo]);
  const rol = persona?.rol ?? 'estudiante';
  const esDocente = rol === 'docente';
  const [trabajos, setTrabajos] = useState<TrabajoCurso[] | null>(null);
  const [datos, setDatos] = useState<DatosPersonas | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    setFallo(false);
    void trabajosServicio.cargarTrabajos(curso.id).then(setTrabajos).catch(() => setFallo(true));
    if (esDocente) void personas.cargar(curso.id).then(setDatos).catch(() => setFallo(true));
  }, [curso, esDocente, personas, trabajosServicio]);

  const estudiantes = datos?.personas.filter((candidata) => candidata.rol === 'estudiante') ?? [];

  return (
    <Pantalla rol={rol} clase="p-cursos">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Cursos', ruta: '#/cursos' }} kicker={curso?.periodo ? `Periodo ${curso.periodo}` : 'Tu curso'} titulo={curso?.nombre ?? 'Curso'} subtitulo={esDocente ? 'Un vistazo a tu curso: personas, grupos y trabajos.' : 'Lo que necesitas saber de este curso.'} objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar la información del curso. Intenta de nuevo.</p>}
          {!curso && <Tarjeta kicker="Sin curso" titulo="Elige un curso"><p className="meta">Vuelve a <a href="#/cursos"><u>Cursos</u></a> y elige uno.</p></Tarjeta>}
          {curso && esDocente && (
            <>
              <div className="detalle__datos detalle__datos--dos">
                <Tarjeta><Dato valor={estudiantes.length} etiqueta={estudiantes.length === 1 ? 'Estudiante' : 'Estudiantes'} nota={datos ? `${datos.invitaciones.length} por registrarse` : undefined} /></Tarjeta>
                <Tarjeta><Dato valor={trabajos?.length ?? 0} etiqueta={trabajos?.length === 1 ? 'Trabajo' : 'Trabajos'} /></Tarjeta>
              </div>
              <div className="d13__columnas">
                <Tarjeta kicker="Quiénes están" titulo="Personas" accion={<a className="cursos__secundaria" href={rutaCurso('#/d13')}>Gestionar</a>}>
                  <ul className="detalle__lista">
                    <li><strong>Estudiantes</strong><small>{estudiantes.length}</small></li>
                    <li><strong>Por registrarse</strong><small>{datos?.invitaciones.length ?? 0}</small></li>
                  </ul>
                </Tarjeta>
                <Tarjeta kicker="Qué se entrega" titulo="Trabajos" accion={<a className="cursos__secundaria" href={rutaCurso('#/d14')}>Gestionar</a>}>
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
              <Tarjeta kicker="Qué se entrega" titulo="Trabajos" accion={<a className="cursos__secundaria" href={rutaCurso('#/e5')}>Mis entregas</a>}>
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
