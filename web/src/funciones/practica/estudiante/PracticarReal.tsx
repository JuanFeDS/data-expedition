import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { useCurso, useRutaCurso } from '../../../compartido/estado/curso';
import { Contador, Kicker, Pantalla } from '../../../compartido/ui/ui';
import { META_XP_SEMANA, NOMBRE_DIFICULTAD, PREGUNTAS_POR_SESION, XP_POR_SESION, cargarBancoActivo, dificultadPara, miPractica, type ResumenPractica } from '../../../servicios/practica';
import { miRadar, type PuntoRadar } from '../../../servicios/radar';

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function E15PracticarReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [resumen, setResumen] = useState<ResumenPractica | null>(null);
  const [radar, setRadar] = useState<PuntoRadar[]>([]);
  const [conteo, setConteo] = useState<Record<string, number>>({});
  const [cargado, setCargado] = useState(false);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    Promise.all([miPractica(curso.id), miRadar(curso.id), cargarBancoActivo(curso.id)]).then(([practica, puntos, banco]) => {
      setResumen(practica);
      setRadar(puntos);
      setConteo(banco.reduce<Record<string, number>>((acumulado, pregunta) => ({ ...acumulado, [pregunta.dimensionId]: (acumulado[pregunta.dimensionId] ?? 0) + 1 }), {}));
      setCargado(true);
    }).catch(() => { setFallo(true); setCargado(true); });
  }, [curso]);

  const temas = radar.filter((punto) => (conteo[punto.id] ?? 0) > 0);
  const hayPreguntas = temas.length > 0;
  const cumplida = (resumen?.sesionesHoy ?? 0) >= 1;
  const porcentajeXp = Math.min(100, ((resumen?.xpSemana ?? 0) / META_XP_SEMANA) * 100);
  const masFlojo = [...temas].sort((a, b) => (a.tieneEvidencia ? a.ahora : 50) - (b.tieneEvidencia ? b.ahora : 50))[0];

  return (
    <Pantalla clase="p-e15">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker="Repaso sin límite" titulo="Practicar" subtitulo={`Sesiones de ${PREGUNTAS_POR_SESION} preguntas con todo lo que ya viste.`} objeto="binoculares">
          {hayPreguntas && <p className="radar__resumen"><strong>{temas.length}</strong> {temas.length === 1 ? 'tema' : 'temas'} en tu mezcla</p>}
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo album practica">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar tu práctica. Intenta de nuevo en un momento.</p>}
          {resumen && (
            <>
              <section className="album__racha" aria-label="Racha de práctica">
                <div className="album__racha-cifra">
                  <span className="num"><Contador valor={resumen.racha} /></span>
                  <small>días seguidos<br />{cumplida ? '¡Meta de hoy cumplida!' : `Practica hoy y llegas a ${resumen.racha + 1}`}</small>
                </div>
                <ol className="album__dias">
                  {DIAS.map((dia, indice) => {
                    const hecho = resumen.dias[indice];
                    const hoy = indice === resumen.hoy;
                    return (
                      <li key={dia} className={`${hecho ? 'hecho' : ''} ${hoy ? 'hoy' : ''}`} aria-label={`${dia}${hecho ? ', practicado' : hoy ? ', hoy' : ''}`}>
                        <b>{hecho ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.4 6.6 11.5 12.5 4.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}</b>
                        <span>{dia}</span>
                      </li>
                    );
                  })}
                </ol>
              </section>
              <section className="practica__xp" aria-label="XP de la semana">
                <div className="practica__xp-cifra">
                  <span className="num"><Contador valor={resumen.xpSemana} /></span>
                  <small>de {META_XP_SEMANA} XP esta semana</small>
                </div>
                <div className="practica__barra" role="progressbar" aria-valuenow={resumen.xpSemana} aria-valuemax={META_XP_SEMANA}><i style={{ width: `${porcentajeXp}%` }} /></div>
                <p className="meta">+{XP_POR_SESION} XP por sesión · {resumen.sesionesSemana} {resumen.sesionesSemana === 1 ? 'sesión' : 'sesiones'} esta semana. El XP no es nota.</p>
              </section>
            </>
          )}
          {cargado && !fallo && !hayPreguntas && (
            <section className="practica__mezcla"><Kicker>Aún sin preguntas</Kicker><p className="meta">Tu docente todavía no carga el banco de práctica. Cuando lo haga, aquí podrás empezar.</p></section>
          )}
          {hayPreguntas && (
            <section className="practica__mezcla" aria-label="Temas de la mezcla">
              <Kicker>Tu mezcla de repaso</Kicker>
              <p className="meta">Cada sesión mezcla las dimensiones con preguntas, con más peso en las que van más flojas.</p>
              <ul className="practica__temas">
                {temas.map((punto) => {
                  const valor = punto.tieneEvidencia ? punto.ahora : 50;
                  return (
                    <li key={punto.id} className={`tema ${punto.id === masFlojo?.id ? 'tema--peso' : ''}`}>
                      <div>
                        <strong>{punto.nombre} <small>· {conteo[punto.id]} {conteo[punto.id] === 1 ? 'pregunta' : 'preguntas'}</small></strong>
                        <span className="tema__barra"><i style={{ width: `${valor}%` }} /></span>
                        <small>{punto.tieneEvidencia ? `Radar ${valor}` : 'Sin evidencia todavía'} · dificultad {NOMBRE_DIFICULTAD[dificultadPara(valor)]}</small>
                      </div>
                      {punto.id === masFlojo?.id && temas.length > 1 && <em>Más peso</em>}
                    </li>
                  );
                })}
              </ul>
              <p className="meta practica__nota">Sin tope de sesiones. Lo que sí tiene tope semanal es el aporte pequeño de la práctica al radar.</p>
            </section>
          )}
        </div>
      </div>
      <Dock accion={hayPreguntas ? { etiqueta: `Sesión de ${PREGUNTAS_POR_SESION} preguntas`, texto: 'Empezar a practicar', ruta: rutaCurso('#/e7') ?? '#/e7' } : undefined} />
    </Pantalla>
  );
}
