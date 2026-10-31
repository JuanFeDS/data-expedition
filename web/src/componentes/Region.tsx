import { useRef, useState } from 'react';
import type { RegionCurso } from '../datos';

export function IslaProvisional() {
  return (
    <svg viewBox="0 0 200 170" fill="none" aria-hidden="true" className="region__isla">
      <path d="M22 78h156c-6 34-30 62-78 86-48-24-72-52-78-86Z" fill="#0B4A47" />
      <path d="M44 90h112c-6 24-24 44-56 62-32-18-50-38-56-62Z" fill="#0F5A52" />
      <ellipse cx="100" cy="76" rx="82" ry="26" fill="#0A8057" />
      <ellipse cx="100" cy="70" rx="74" ry="21" fill="#17A06C" />
      <polygon points="74,66 104,22 134,66" fill="#F1F8F4" />
      <polygon points="92,66 104,44 116,66" fill="#D3E5DB" />
      <polygon points="48,66 64,40 80,66" fill="#0F5A52" />
      <polygon points="138,68 152,46 166,68" fill="#0F5A52" />
      <circle cx="120" cy="70" r="5" fill="#FFD23F" />
    </svg>
  );
}

export function Isla({ bioma }: { bioma: string }) {
  const [falla, setFalla] = useState(false);
  return falla
    ? <IslaProvisional />
    : <img className="region__isla" src={`${import.meta.env.BASE_URL}regiones/${bioma}.webp`} alt="" onError={() => setFalla(true)} />;
}

interface PropsRegion {
  regiones: RegionCurso[];
  actual: number;
  vista: number;
  alCambiar: (indice: number) => void;
}

const UMBRAL_DESLIZAR = 40;

export function Region({ regiones, actual, vista, alCambiar }: PropsRegion) {
  const region = regiones[vista];
  const total = regiones.length;
  const [direccion, setDireccion] = useState(0);
  const inicioX = useRef<number | null>(null);
  const deslizo = useRef(false);

  const ir = (nuevo: number) => {
    if (nuevo < 0 || nuevo >= total || nuevo === vista) return;
    setDireccion(nuevo > vista ? 1 : -1);
    alCambiar(nuevo);
  };

  const alPresionar = (evento: React.PointerEvent) => {
    inicioX.current = evento.clientX;
    deslizo.current = false;
  };
  const alSoltar = (evento: React.PointerEvent) => {
    if (inicioX.current === null) return;
    const desplazamiento = evento.clientX - inicioX.current;
    inicioX.current = null;
    if (Math.abs(desplazamiento) > UMBRAL_DESLIZAR) {
      deslizo.current = true;
      ir(vista + (desplazamiento < 0 ? 1 : -1));
    }
  };
  const alHacerClic = (evento: React.MouseEvent) => {
    if (deslizo.current) {
      evento.preventDefault();
      deslizo.current = false;
    }
  };

  const estadoTexto = region.estado === 'hecha' ? 'Completada' : region.estado === 'pendiente' ? 'Se abre más adelante' : region.modulo;

  return (
    <div className={`region region--${region.estado}`}>
      <div className="region__fila">
      <button className="region__flecha region__flecha--izq" onClick={() => ir(vista - 1)} disabled={vista === 0} aria-label="Isla anterior">‹</button>
      <a className="region__enlace" href="#/e1" onPointerDown={alPresionar} onPointerUp={alSoltar} onClick={alHacerClic} aria-label={`${region.nombre}, semana ${region.semanas}. Abrir el mapa`}>
        <div className="region__escena" key={vista} data-dir={direccion}>
          <Isla bioma={region.bioma} />
          {region.estado === 'pendiente' && (
            <span className="region__candado">
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="2.5" y="6" width="9" height="6.5" rx="1.5" fill="#F1F8F4" /><path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#F1F8F4" strokeWidth="1.6" /></svg>
            </span>
          )}
          {region.estado === 'hecha' && (
            <span className="region__hecha">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" stroke="#073B3A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          )}
        </div>
        <span className="region__sombra" />
      </a>
      <button className="region__flecha region__flecha--der" onClick={() => ir(vista + 1)} disabled={vista === total - 1} aria-label="Isla siguiente">›</button>
      </div>
      <div className="region__etiqueta">
        <small>Semana {region.semanas} de {total} · {estadoTexto}</small>
        <strong>{region.nombre}</strong>
        <div className="region__avance">
          {regiones.map((otra, indice) => (
            <button
              key={otra.nombre}
              className={`${indice < actual ? 'hecha' : indice === actual ? 'actual' : ''} ${indice === vista ? 'vista' : ''}`}
              onClick={() => ir(indice)}
              aria-label={`Ir a la semana ${otra.semanas}: ${otra.nombre}`}
              aria-current={indice === vista ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
      <div className="region__volver-hueco">
        {vista !== actual && <button className="region__volver" onClick={() => ir(actual)}>Volver a la semana {regiones[actual].semanas}</button>}
      </div>
    </div>
  );
}
