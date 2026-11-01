import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export const ModoViva = createContext(false);
export const ModoModal = createContext(false);

type Tono = 'claro' | 'oscura' | 'verde' | 'menta';

export function Pantalla({ tono = 'claro', clase = '', children }: { tono?: Tono; clase?: string; children: ReactNode }) {
  const viva = useContext(ModoViva);
  const modal = useContext(ModoModal);
  const tonoClase = tono === 'claro' ? '' : `pantalla--${tono}`;
  return <div className={`pantalla ${tonoClase} ${viva ? 'pantalla--viva' : ''} ${modal ? 'pantalla--modal' : ''} ${clase}`}>{children}</div>;
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
          <i style={{ width: `${Math.max(0, Math.min(1, nivel - indice)) * 100}%`, '--i': indice } as React.CSSProperties} />
        </div>
      ))}
    </div>
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

function reducirMovimiento() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Contador({ valor, decimales = 0, prefijo = '', duracion = 600 }: { valor: number; decimales?: number; prefijo?: string; duracion?: number }) {
  const [actual, setActual] = useState(reducirMovimiento() ? valor : 0);
  useEffect(() => {
    if (reducirMovimiento()) { setActual(valor); return; }
    const inicio = performance.now();
    let cuadro = 0;
    const paso = (ahora: number) => {
      const avance = Math.min(1, (ahora - inicio) / duracion);
      setActual(valor * (1 - Math.pow(1 - avance, 3)));
      if (avance < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor, duracion]);
  return <>{prefijo}{actual.toFixed(decimales)}</>;
}

export function Hoja({ abierta, alCerrar, titulo, clase = '', children }: { abierta: boolean; alCerrar: () => void; titulo: string; clase?: string; children: ReactNode }) {
  const cierre = useRef<HTMLButtonElement>(null);
  const hoja = useRef<HTMLDivElement>(null);
  const ajuste = useRef<HTMLDivElement>(null);
  const encaja = clase.includes('hoja--pantalla');
  useLayoutEffect(() => {
    if (!abierta || !encaja) return;
    const reducir = () => {
      const contenido = ajuste.current;
      const contenedor = hoja.current?.offsetParent as HTMLElement | null;
      if (!contenido || !contenedor) return;
      const objetivo = contenedor.clientHeight * 0.92;
      let escala = 1;
      contenido.style.zoom = '1';
      for (let intento = 0; intento < 8; intento += 1) {
        const alto = contenido.offsetHeight * escala;
        if (alto <= objetivo + 1) break;
        escala = Math.max(0.5, escala * 0.985 * (objetivo / alto));
        contenido.style.zoom = String(escala);
      }
    };
    reducir();
    const pendiente = setTimeout(reducir, 350);
    window.addEventListener('resize', reducir);
    return () => { clearTimeout(pendiente); window.removeEventListener('resize', reducir); };
  }, [abierta, encaja]);
  useEffect(() => {
    if (!abierta) return;
    cierre.current?.focus();
    const alTeclear = (evento: KeyboardEvent) => { if (evento.key === 'Escape') alCerrar(); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierta, alCerrar]);
  if (!abierta) return null;
  return (
    <>
      <div className="hoja__velo" onClick={alCerrar} />
      <div ref={hoja} className={`hoja ${clase}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="hoja__asa" />
        <button ref={cierre} className="hoja__cerrar" onClick={alCerrar} aria-label="Cerrar">✕</button>
        {encaja ? <div ref={ajuste}>{children}</div> : children}
      </div>
    </>
  );
}
