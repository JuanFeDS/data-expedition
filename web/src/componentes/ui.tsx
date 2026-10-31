import { createContext, useContext, type ReactNode } from 'react';

export const ModoViva = createContext(false);

type Tono = 'claro' | 'oscura' | 'verde' | 'menta';

export function Pantalla({ tono = 'claro', clase = '', children }: { tono?: Tono; clase?: string; children: ReactNode }) {
  const viva = useContext(ModoViva);
  const tonoClase = tono === 'claro' ? '' : `pantalla--${tono}`;
  return <div className={`pantalla ${tonoClase} ${viva ? 'pantalla--viva' : ''} ${clase}`}>{children}</div>;
}

export function Kicker({ children, estilo }: { children: ReactNode; estilo?: React.CSSProperties }) {
  return <span className="kicker" style={estilo}>{children}</span>;
}

type VariantePill = 'ink' | 'accent' | 'suave' | 'azul' | 'deep';

export function Pill({ children, variante = 'ink', pequena = false, boton = false, grande = false }: { children: ReactNode; variante?: VariantePill; pequena?: boolean; boton?: boolean; grande?: boolean }) {
  const clases = ['pill', variante !== 'ink' && `pill--${variante}`, pequena && 'pill--sm', boton && 'pill--boton', grande && 'pill--grande'].filter(Boolean).join(' ');
  return <span className={clases}>{children}</span>;
}

export function Segmentado({ opciones, activa, alCambiar }: { opciones: string[]; activa: number; alCambiar?: (indice: number) => void }) {
  return (
    <div className="segmentado" role="tablist">
      {opciones.map((opcion, indice) => (
        <button key={opcion} role="tab" aria-selected={indice === activa} onClick={() => alCambiar?.(indice)}>{opcion}</button>
      ))}
    </div>
  );
}

export function Niveles({ nivel }: { nivel: number }) {
  return (
    <div className="nivel" aria-label={`Nivel ${nivel} de 5`}>
      {[0, 1, 2, 3, 4].map((indice) => (
        <div className="nivel__seg" key={indice}>
          <i style={{ width: `${Math.max(0, Math.min(1, nivel - indice)) * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

const PESTANAS = [
  { nombre: 'Ruta', ruta: '#/e1' },
  { nombre: 'Radar', ruta: '#/e2' },
  { nombre: 'Notas', ruta: '#/e3' },
  { nombre: 'Entregas', ruta: '#/e5' },
];

export function TabBar({ activa }: { activa: 'Ruta' | 'Radar' | 'Notas' | 'Entregas' }) {
  return (
    <nav className="tabs">
      {PESTANAS.map((pestana) => (
        <a key={pestana.nombre} href={pestana.ruta} aria-current={pestana.nombre === activa ? 'page' : undefined}>{pestana.nombre}</a>
      ))}
    </nav>
  );
}

export function Cabecera({ kicker, titulo, subtitulo, volver }: { kicker?: string; titulo: string; subtitulo?: string; volver?: { texto: string; ruta: string } }) {
  return (
    <header className="cabecera">
      {volver && <a className="cabecera__volver" href={volver.ruta}>‹ {volver.texto}</a>}
      {kicker && <Kicker>{kicker}</Kicker>}
      <h1 className="titulo titulo--xl">{titulo}</h1>
      {subtitulo && <p className="meta" style={{ fontSize: 14 }}>{subtitulo}</p>}
    </header>
  );
}
