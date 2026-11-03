import { Jaguar } from '../../../compartido/ui/Jaguar';
import { Contador } from '../../../compartido/ui/ui';
import { META_XP_SEMANA, type ResumenPractica } from '../../../servicios/practica';

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const CONFETI = Array.from({ length: 22 }, (_, i) => {
  const angulo = (i / 22) * Math.PI * 2;
  const distancia = 110 + (i % 4) * 28;
  return { dx: Math.round(Math.cos(angulo) * distancia), dy: Math.round(Math.sin(angulo) * distancia) - 30, giro: (i % 2 ? 1 : -1) * (120 + i * 23) };
});

const titularPara = (aciertos: number, total: number) => {
  if (aciertos === total) return { kicker: 'Sesión perfecta', texto: 'Ni un fallo. Así se pule una dimensión.', pose: 'celebra' as const };
  if (aciertos / total >= 0.6) return { kicker: 'Sesión terminada', texto: 'Lo que fallaste lo repasaste al final: así se aprende.', pose: 'celebra' as const };
  return { kicker: 'Sesión terminada', texto: 'Cada repaso cuenta. La próxima te sale mejor.', pose: 'saluda' as const };
};

interface Props {
  aciertos: number;
  total: number;
  xp: number;
  primeraVez: boolean[];
  resumen: ResumenPractica | null;
  guardado: boolean;
  alOtraSesion: () => void;
  rutaVolver: string;
}

export function ResultadoPractica({ aciertos, total, xp, primeraVez, resumen, guardado, alOtraSesion, rutaVolver }: Props) {
  const { kicker, texto, pose } = titularPara(aciertos, total);
  const xpSemana = resumen?.xpSemana ?? xp;
  const antes = Math.max(0, xpSemana - xp);
  const porcentaje = Math.min(100, (xpSemana / META_XP_SEMANA) * 100);
  const porcentajeAntes = Math.min(100, (antes / META_XP_SEMANA) * 100);
  const falta = Math.max(0, META_XP_SEMANA - xpSemana);

  return (
    <div className="rp">
      <div className="rp__texto">
        <span className="kicker rp__kicker">{kicker}</span>
        <h1 className="titulo rp__titulo">{aciertos} de {total} a la primera</h1>
        <p className="rp__sub">{texto}</p>

        <ol className="rp__preguntas" aria-label="Resultado por pregunta">
          {primeraVez.map((acierto, indice) => (
            <li key={indice} className={acierto ? 'ok' : 'repaso'} style={{ '--i': indice } as React.CSSProperties} aria-label={`Pregunta ${indice + 1}: ${acierto ? 'a la primera' : 'repasada'}`}>
              {acierto
                ? <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.4 6.6 11.5 12.5 4.8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                : <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v3h-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </li>
          ))}
        </ol>

        {guardado ? (
          <div className="rp__xp">
            <div className="rp__xp-cifra">
              <span className="num"><Contador valor={xp} prefijo="+" duracion={900} /></span>
              <div><strong>XP</strong><small>Por esta sesión. El XP no es nota.</small></div>
            </div>
            <div className="rp__barra" role="progressbar" aria-valuenow={xpSemana} aria-valuemax={META_XP_SEMANA} aria-label="XP de la semana">
              <i className="rp__barra-antes" style={{ width: `${porcentajeAntes}%` }} />
              <i className="rp__barra-nueva" style={{ width: `${porcentaje}%` }} />
            </div>
            <small className="rp__barra-pie">{falta > 0 ? `${xpSemana} de ${META_XP_SEMANA} XP esta semana · te faltan ${falta}` : `¡Meta semanal cumplida! ${xpSemana} XP`}</small>
          </div>
        ) : (
          <p className="acceso__error" role="alert">No pudimos guardar tu sesión, así que no sumó XP. Intenta de nuevo más tarde.</p>
        )}

        {resumen && guardado && (
          <div className="rp__racha">
            <div className="rp__racha-cifra"><b>{resumen.racha}</b><span>{resumen.racha === 1 ? 'día seguido' : 'días seguidos'}</span></div>
            <ol className="rp__dias" aria-label="Tu semana">
              {DIAS.map((dia, indice) => <li key={dia} className={`${resumen.dias[indice] ? 'hecho' : ''} ${indice === resumen.hoy ? 'hoy' : ''}`}><b />{dia}</li>)}
            </ol>
          </div>
        )}

        <div className="rp__acciones">
          <button className="boton boton--accent" onClick={alOtraSesion}>Otra sesión</button>
          <a className="boton boton--suave" href={rutaVolver}>Volver a practicar</a>
        </div>
      </div>
      <div className="rp__escena" aria-hidden="true">
        <span className="rp__aro rp__aro--1" /><span className="rp__aro rp__aro--2" />
        {CONFETI.map((pieza, indice) => <i key={indice} className="confeti" style={{ '--dx': `${pieza.dx}px`, '--dy': `${pieza.dy}px`, '--giro': `${pieza.giro}deg`, '--i': indice } as React.CSSProperties} />)}
        <Jaguar pose={pose} ancho={300} clase="rp__jaguar" />
      </div>
    </div>
  );
}
