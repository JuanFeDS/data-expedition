import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { Radar } from '../../../compartido/ui/Radar';
import { useCurso, useRutaCurso } from '../../../compartido/estado/curso';
import { parametroDeRuta } from '../../../compartido/navegacion/navegacion';
import { Dato, Estado, Tarjeta } from '../../../compartido/ui/panel';
import { Pantalla, Pill } from '../../../compartido/ui/ui';
import { cargarFicha, type FichaEstudiante } from '../../../servicios/ficha';
import { servicioSupabase as servicioPersonas, type PersonaCurso } from '../../../servicios/personas';

export function D8FichaReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [estudiantes, setEstudiantes] = useState<PersonaCurso[]>([]);
  const [id, setId] = useState<string | null>(parametroDeRuta('estudiante'));
  const [ficha, setFicha] = useState<FichaEstudiante | null>(null);
  const [fallo, setFallo] = useState(false);

  const cargarLista = useCallback(async () => {
    if (!curso) return;
    try {
      const personas = await servicioPersonas.cargar(curso.id);
      const lista = personas.personas.filter((persona) => persona.rol === 'estudiante');
      setEstudiantes(lista);
      setId((actual) => (actual && lista.some((persona) => persona.id === actual) ? actual : (lista[0]?.id ?? null)));
    } catch {
      setFallo(true);
    }
  }, [curso]);

  useEffect(() => { void cargarLista(); }, [cargarLista]);

  useEffect(() => {
    if (!curso || !id) { setFicha(null); return; }
    let activo = true;
    setFicha(null);
    cargarFicha(curso.id, id).then((datos) => { if (activo) setFicha(datos); }).catch(() => { if (activo) setFallo(true); });
    return () => { activo = false; };
  }, [curso, id]);

  const estudiante = estudiantes.find((persona) => persona.id === id);
  const conRadar = ficha?.radar.some((punto) => punto.tieneEvidencia) ?? false;
  const porcentajeAsistencia = ficha && ficha.asistencia.dadas > 0 ? Math.round((ficha.asistencia.cuentan / ficha.asistencia.dadas) * 100) : null;
  const notas = (ficha?.entregas ?? []).map((entrega) => entrega.nota).filter((nota): nota is number => nota !== null);
  const promedio = notas.length > 0 ? notas.reduce((suma, nota) => suma + nota, 0) / notas.length : null;

  return (
    <Pantalla rol="docente" clase="p-d8">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker={estudiante?.usuario ? `@${estudiante.usuario}` : 'Estudiante'} titulo={estudiante ? (estudiante.nombre ?? estudiante.correo) : 'Estudiantes'} subtitulo={estudiante ? 'Su radar, sus notas, su asistencia y su práctica en un solo lugar.' : 'Elige a un estudiante de la lista.'} objeto="binoculares" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar la ficha. <button onClick={() => void cargarLista()}>Reintentar</button></p>}
          {estudiantes.length === 0 && !fallo && <Tarjeta kicker="Por ahora" titulo="Sin estudiantes"><p className="meta">Invita a tus estudiantes en <a href={rutaCurso('#/d13') ?? '#/d13'}><u>Personas</u></a>.</p></Tarjeta>}
          {estudiantes.length > 0 && (
            <div className="d8__columnas">
              <Tarjeta kicker={`${estudiantes.length} ${estudiantes.length === 1 ? 'estudiante' : 'estudiantes'}`} titulo="Lista" clase="d8__lista">
                <ul>
                  {estudiantes.map((candidato) => (
                    <li key={candidato.id}>
                      <button aria-pressed={candidato.id === id} onClick={() => setId(candidato.id)}>
                        <span className="avatar avatar--verde">{(candidato.nombre ?? candidato.correo).slice(0, 2).toUpperCase()}</span>
                        <span>{candidato.nombre ?? candidato.correo}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Tarjeta>
              <Tarjeta kicker="Radar frente a su punto de partida" titulo="Cómo va" clase="d8__radar">
                {!ficha && <p className="meta">Cargando…</p>}
                {ficha && !conRadar && <p className="meta">Aún no hay evidencias: se llena al calificar sus trabajos y registrar su <a href={rutaCurso('#/d2') ?? '#/d2'}><u>diagnóstico</u></a>.</p>}
                {ficha && conRadar && (
                  <>
                    <div className="radar__marco"><Radar dimensiones={ficha.radar} ancho={342} alto={290} radio={96} /></div>
                    <div className="radar__leyenda"><span><i className="ahora" />Ahora</span><span><i className="inicio" />Punto de partida</span></div>
                  </>
                )}
              </Tarjeta>
              <div className="d8__lado">
                <Tarjeta kicker="Resumen" titulo="De un vistazo">
                  <div className="rejilla rejilla--3">
                    <Dato valor={promedio === null ? '—' : promedio.toFixed(1)} etiqueta="Promedio" nota={`${notas.length} ${notas.length === 1 ? 'nota' : 'notas'}`} />
                    <Dato valor={porcentajeAsistencia === null ? '—' : `${porcentajeAsistencia} %`} etiqueta="Asistencia" nota={ficha ? `${ficha.asistencia.cuentan} de ${ficha.asistencia.dadas} clases` : undefined} tono={porcentajeAsistencia !== null && porcentajeAsistencia < 70 ? 'alerta' : undefined} />
                    <Dato valor={ficha?.practica.xp ?? 0} etiqueta="XP" nota={`${ficha?.practica.sesionesSemana ?? 0} sesiones esta semana`} />
                  </div>
                </Tarjeta>
                <Tarjeta kicker="Trabajos" titulo="Notas y declaraciones">
                  <ul className="d8__notas">
                    {ficha?.entregas.map((entrega) => (
                      <li key={entrega.trabajoId}>
                        <strong>{entrega.trabajo}</strong>
                        <small>{entrega.semana ? `Semana ${entrega.semana}` : 'Sin semana'}</small>
                        {entrega.estado === 'calificada' && entrega.nota !== null ? <Pill variante="accent" pequena>{entrega.nota.toFixed(1)}</Pill> : <Estado tipo="tarde">Por calificar</Estado>}
                        <Pill variante={entrega.modoIa === 'sin_ia' ? 'azul' : 'suave'} pequena>{entrega.modoIa === 'sin_ia' ? 'Sin IA' : 'Con IA'}</Pill>
                      </li>
                    ))}
                    {ficha && ficha.entregas.length === 0 && <li><small>Aún no ha entregado ningún trabajo.</small></li>}
                  </ul>
                </Tarjeta>
                <Tarjeta kicker="Evidencias" titulo="Lo que mueve su radar">
                  <ul className="d8__notas">
                    <li><strong>Diagnóstico</strong><small>Con IA y sin IA</small>{ficha?.diagnosticoRegistrado ? <Estado tipo="ok">Registrado</Estado> : <Estado tipo="pendiente">Pendiente</Estado>}</li>
                    <li><strong>Práctica</strong><small>{ficha?.practica.sesiones ?? 0} sesiones · {ficha?.practica.xp ?? 0} XP</small><Estado tipo="info">Con tope</Estado></li>
                    <li><strong>Asistencia</strong><small>{ficha ? `${ficha.asistencia.ausentes} ausencias` : ''}</small>{porcentajeAsistencia === null ? <Estado tipo="pendiente">Sin clases</Estado> : <Estado tipo={porcentajeAsistencia >= 70 ? 'ok' : 'alerta'}>{porcentajeAsistencia} %</Estado>}</li>
                  </ul>
                </Tarjeta>
              </div>
            </div>
          )}
        </div>
      </div>
      <Dock accion={estudiante ? { etiqueta: (estudiante.nombre ?? estudiante.correo).split(' ')[0], texto: 'Ver sus entregas', ruta: rutaCurso('#/d3') ?? '#/d3' } : undefined} />
    </Pantalla>
  );
}
