import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E15PracticarReal } from './PracticarReal';
import { Contador, Kicker, Pantalla } from '../../../compartido/ui/ui';
import { Dock } from '../../../compartido/ui/Dock';
import { dificultadPara, dimensiones, gemasGanadas, nivelDePulido, rachaPractica, temaDeRepaso } from '../../../demo/datos';

export function E15PracticarEjemplo() {
  const racha = rachaPractica.hechos.filter(Boolean).length;
  const cumplida = rachaPractica.sesionesHoy >= rachaPractica.metaHoy;
  const temas = gemasGanadas.map((gema) => ({ gema, valor: dimensiones.find((dimension) => dimension.nombre === gema.dimension)?.ahora ?? 0 }));
  const masFlojo = temaDeRepaso();
  const porcentajeXp = Math.min(100, (rachaPractica.xpSemana / rachaPractica.metaXpSemana) * 100);

  return (
    <Pantalla clase="p-e15">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Repaso sin límite" titulo="Practicar" subtitulo="Sesiones de 5 preguntas con todo lo que ya viste." objeto="binoculares">
          <p className="radar__resumen"><strong>{temas.length}</strong> {temas.length === 1 ? 'tema' : 'temas'} en tu mezcla</p>
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo album practica">
          <section className="album__racha" aria-label="Racha de práctica">
            <div className="album__racha-cifra">
              <span className="num"><Contador valor={racha} /></span>
              <small>días seguidos<br />{cumplida ? '¡Meta de hoy cumplida!' : `Practica hoy y llegas a ${racha + 1}`}</small>
            </div>
            <ol className="album__dias">
              {rachaPractica.dias.map((dia, indice) => {
                const hecho = rachaPractica.hechos[indice];
                const hoy = indice === rachaPractica.hoy;
                return (
                  <li key={`${dia}${indice}`} className={`${hecho ? 'hecho' : ''} ${hoy ? 'hoy' : ''}`} aria-label={`${dia}${hecho ? ', practicado' : hoy ? ', hoy' : ''}`}>
                    <b>{hecho ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.4 6.6 11.5 12.5 4.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}</b>
                    <span>{dia}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="practica__xp" aria-label="XP de la semana">
            <div className="practica__xp-cifra">
              <span className="num"><Contador valor={rachaPractica.xpSemana} /></span>
              <small>de {rachaPractica.metaXpSemana} XP esta semana</small>
            </div>
            <div className="practica__barra" role="progressbar" aria-valuenow={rachaPractica.xpSemana} aria-valuemax={rachaPractica.metaXpSemana}><i style={{ width: `${porcentajeXp}%` }} /></div>
            <p className="meta">+{rachaPractica.xpPorSesion} XP por sesión · {rachaPractica.sesionesSemana} sesiones esta semana. El XP no es nota.</p>
          </section>

          <section className="practica__mezcla" aria-label="Temas de la mezcla">
            <Kicker>Tu mezcla de repaso</Kicker>
            <p className="meta">Cada sesión mezcla los temas de las islas que ya cerraste, con más peso en los que van más flojos.</p>
            <ul className="practica__temas">
              {temas.map(({ gema, valor }) => (
                <li key={gema.gema} className={`tema ${gema.gema === masFlojo.gema.gema ? 'tema--peso' : ''}`}>
                  <img src={`${import.meta.env.BASE_URL}gemas/${gema.gema}.webp`} alt="" />
                  <div>
                    <strong>{gema.dimension} <small>· {gema.islaCorta}</small></strong>
                    <span className="tema__barra"><i style={{ width: `${valor}%` }} /></span>
                    <small>{nivelDePulido(valor)} · dificultad {dificultadPara(valor)}</small>
                  </div>
                  {gema.gema === masFlojo.gema.gema && <em>Más peso</em>}
                </li>
              ))}
            </ul>
            <p className="meta practica__nota">Sin tope de sesiones. Lo que sí tiene tope semanal es el aporte pequeño de la práctica al radar.</p>
          </section>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Sesión de 5 preguntas', texto: 'Empezar a practicar', ruta: '#/e7' }} />
    </Pantalla>
  );
}

export const E15Practicar = conModoDemo(E15PracticarEjemplo, E15PracticarReal);
