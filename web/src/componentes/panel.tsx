import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Kicker } from './ui';

export function Tarjeta({ kicker, titulo, accion, tono = 'clara', clase = '', children }: { kicker?: string; titulo?: string; accion?: ReactNode; tono?: 'clara' | 'oscura' | 'aviso' | 'menta'; clase?: string; children?: ReactNode }) {
  return (
    <section className={`tarjeta tarjeta--${tono} ${clase}`}>
      {(kicker || titulo || accion) && (
        <header className="tarjeta__cab">
          <div>
            {kicker && <Kicker>{kicker}</Kicker>}
            {titulo && <h2>{titulo}</h2>}
          </div>
          {accion}
        </header>
      )}
      {children}
    </section>
  );
}

export function Dato({ valor, etiqueta, nota, tono }: { valor: ReactNode; etiqueta: string; nota?: string; tono?: 'alerta' | 'ok' }) {
  return (
    <div className={`dato ${tono ? `dato--${tono}` : ''}`}>
      <span className="num">{valor}</span>
      <strong>{etiqueta}</strong>
      {nota && <small>{nota}</small>}
    </div>
  );
}

export type TipoEstado = 'ok' | 'alerta' | 'pendiente' | 'info' | 'tarde';

export function Estado({ tipo, children }: { tipo: TipoEstado; children: ReactNode }) {
  return <span className={`estado estado--${tipo}`}>{children}</span>;
}

export interface Columna {
  clave: string;
  titulo: string;
  ancho?: string;
}

export function Tabla({ columnas, filas, etiqueta }: { columnas: Columna[]; filas: Record<string, ReactNode>[]; etiqueta: string }) {
  const plantilla = columnas.map((columna) => columna.ancho ?? '1fr').join(' ');
  return (
    <div className="tabla" role="table" aria-label={etiqueta}>
      <div className="tabla__cab" role="row" style={{ gridTemplateColumns: plantilla }}>
        {columnas.map((columna) => <span key={columna.clave} role="columnheader">{columna.titulo}</span>)}
      </div>
      {filas.map((fila, indice) => (
        <div className="tabla__fila" role="row" key={indice} style={{ gridTemplateColumns: plantilla, '--i': indice } as React.CSSProperties}>
          {columnas.map((columna) => <span key={columna.clave} role="cell" data-etiqueta={columna.titulo}>{fila[columna.clave]}</span>)}
        </div>
      ))}
    </div>
  );
}

export function BarraDato({ etiqueta, valor, maximo = 100, sufijo = '%', tono }: { etiqueta: string; valor: number; maximo?: number; sufijo?: string; tono?: 'alerta' | 'azul' | 'accent' }) {
  return (
    <div className="barra-dato">
      <span>{etiqueta}</span>
      <div className="barra-dato__pista"><i className={tono ? `barra-dato--${tono}` : ''} style={{ width: `${Math.min(100, (valor / maximo) * 100)}%` }} /></div>
      <strong>{valor}{sufijo}</strong>
    </div>
  );
}

export function Cuenta({ segundos, total = segundos, detenida = false }: { segundos: number; total?: number; detenida?: boolean }) {
  const [restante, setRestante] = useState(segundos);
  const reloj = useRef<number>(0);
  useEffect(() => {
    if (detenida) return undefined;
    reloj.current = window.setInterval(() => setRestante((actual) => Math.max(0, actual - 1)), 1000);
    return () => window.clearInterval(reloj.current);
  }, [detenida]);
  const progreso = restante / total;
  const circunferencia = 2 * Math.PI * 44;
  return (
    <div className={`cuenta ${restante <= 10 ? 'cuenta--urgente' : ''}`} role="timer" aria-label={`Quedan ${restante} segundos`}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <circle cx="50" cy="50" r="44" className="cuenta__pista" />
        <circle cx="50" cy="50" r="44" className="cuenta__arco" strokeDasharray={circunferencia} strokeDashoffset={circunferencia * (1 - progreso)} />
      </svg>
      <span><b>{restante}</b><small>seg</small></span>
    </div>
  );
}

export function Vacio({ titulo, texto, pose = 'pensando', accion }: { titulo: string; texto: string; pose?: 'pensando' | 'saluda' | 'guia' | 'celebra'; accion?: ReactNode }) {
  return (
    <div className="vacio">
      <img src={`${import.meta.env.BASE_URL}jaguar/${pose}.png`} alt="" width={110} />
      <strong>{titulo}</strong>
      <p>{texto}</p>
      {accion}
    </div>
  );
}
