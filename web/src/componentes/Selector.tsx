import { useEffect, useRef, useState } from 'react';

export interface OpcionSelector<T extends string> {
  valor: T;
  etiqueta: string;
}

interface PropsSelector<T extends string> {
  valor: T;
  opciones: OpcionSelector<T>[];
  alCambiar: (valor: T) => void;
  etiqueta: string;
  deshabilitado?: boolean;
  clase?: string;
}

export function Selector<T extends string>({ valor, opciones, alCambiar, etiqueta, deshabilitado = false, clase = '' }: PropsSelector<T>) {
  const [abierto, setAbierto] = useState(false);
  const [resaltada, setResaltada] = useState(0);
  const caja = useRef<HTMLDivElement>(null);
  const indiceActual = Math.max(0, opciones.findIndex((opcion) => opcion.valor === valor));

  useEffect(() => {
    if (!abierto) return undefined;
    const alPulsarFuera = (evento: MouseEvent) => { if (!caja.current?.contains(evento.target as Node)) setAbierto(false); };
    document.addEventListener('mousedown', alPulsarFuera);
    return () => document.removeEventListener('mousedown', alPulsarFuera);
  }, [abierto]);

  const abrir = () => {
    setResaltada(indiceActual);
    setAbierto(true);
  };

  const elegir = (opcion: OpcionSelector<T>) => {
    setAbierto(false);
    if (opcion.valor !== valor) alCambiar(opcion.valor);
  };

  const alTeclear = (evento: React.KeyboardEvent) => {
    if (evento.key === 'Escape') { setAbierto(false); return; }
    if (!abierto) {
      if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') { evento.preventDefault(); abrir(); }
      return;
    }
    if (evento.key === 'ArrowDown') { evento.preventDefault(); setResaltada((actual) => Math.min(opciones.length - 1, actual + 1)); }
    if (evento.key === 'ArrowUp') { evento.preventDefault(); setResaltada((actual) => Math.max(0, actual - 1)); }
    if (evento.key === 'Enter') { evento.preventDefault(); elegir(opciones[resaltada]); }
  };

  return (
    <div className={`selector ${abierto ? 'selector--abierto' : ''} ${clase}`} ref={caja} onKeyDown={alTeclear}>
      <button type="button" className="selector__boton" aria-haspopup="listbox" aria-expanded={abierto} aria-label={etiqueta} disabled={deshabilitado} onClick={() => (abierto ? setAbierto(false) : abrir())}>
        <span>{opciones[indiceActual]?.etiqueta}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {abierto && (
        <ul className="selector__lista" role="listbox" aria-label={etiqueta}>
          {opciones.map((opcion, indice) => (
            <li key={opcion.valor} role="option" aria-selected={opcion.valor === valor} className={indice === resaltada ? 'resaltada' : ''}>
              <button type="button" onMouseEnter={() => setResaltada(indice)} onClick={() => elegir(opcion)}>
                <span>{opcion.etiqueta}</span>
                {opcion.valor === valor && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.4 6.6 11.5 12.5 4.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
