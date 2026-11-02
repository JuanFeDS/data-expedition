import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ModalAlbum } from '../componentes/AlbumIsla';
import { Isla } from '../componentes/Region';
import { Dock } from '../componentes/Dock';
import { Kicker, ModoViva, Pantalla, Pill } from '../componentes/ui';
import { albumDeIsla, hitosRuta, regionesCurso, semanaActual, totalSemanas, trabajoActual } from '../datos';

interface Tramo {
  d: string;
  hecho: boolean;
}

function Candado() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" fill="#F1F8F4" />
      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#F1F8F4" strokeWidth="1.6" />
    </svg>
  );
}

export function E1Ruta() {
  const viva = useContext(ModoViva);
  const indiceActual = regionesCurso.findIndex((region) => region.estado === 'actual');
  const regiones = regionesCurso.map((region, indice) => ({
    region,
    indice,
    hitos: region.hitos.map((titulo) => hitosRuta.find((hito) => hito.titulo === titulo)).filter((hito) => hito !== undefined),
  }));
  const mostradas = [...regiones].reverse();
  const mapa = useRef<HTMLDivElement>(null);
  const [islaAlbum, setIslaAlbum] = useState<string | null>(null);
  const anclas = useRef<(HTMLDivElement | null)[]>([]);
  const [tramos, setTramos] = useState<Tramo[]>([]);

  useLayoutEffect(() => {
    const medir = () => {
      const caja = mapa.current;
      if (!caja) return;
      const base = caja.getBoundingClientRect();
      const puntos = regionesCurso.map((_, indice) => {
        const elemento = anclas.current[indice];
        if (!elemento) return null;
        const caja_ = elemento.getBoundingClientRect();
        return { x: caja_.left - base.left + caja_.width / 2, y: caja_.top - base.top + caja_.height * 0.62 };
      });
      const nuevos: Tramo[] = [];
      for (let i = 0; i < puntos.length - 1; i++) {
        const desde = puntos[i];
        const hasta = puntos[i + 1];
        if (!desde || !hasta) continue;
        const medio = (desde.y + hasta.y) / 2;
        nuevos.push({ d: `M ${desde.x} ${desde.y} C ${desde.x} ${medio}, ${hasta.x} ${medio}, ${hasta.x} ${hasta.y}`, hecho: i + 1 <= indiceActual });
      }
      setTramos(nuevos);
    };
    medir();
    const observador = new ResizeObserver(medir);
    if (mapa.current) observador.observe(mapa.current);
    return () => observador.disconnect();
  }, [indiceActual]);

  useEffect(() => {
    if (viva) anclas.current[indiceActual]?.scrollIntoView({ block: 'center' });
  }, [viva, indiceActual]);

  return (
    <Pantalla tono="oscura" clase="p-e1">
      <div className="pantalla__cuerpo ruta">
        <header className="ruta__cab">
          <div className="ruta__top"><a href="#/home" style={{ fontWeight: 700, color: 'var(--mint)' }}>‹ Inicio</a><Pill variante="accent">Semana {semanaActual} de {totalSemanas}</Pill></div>
          <h1 className="titulo" style={{ fontSize: 'var(--fs-3xl)', lineHeight: 1.05 }}>Mapa del curso</h1>
          <p className="ruta__sub">Semana {regionesCurso[indiceActual].semanas} de {regionesCurso.length} · una entrega más y ves la cima</p>
        </header>

        <div className="mapa" ref={mapa}>
          <svg className="mapa__ruta" aria-hidden="true">
            {tramos.map((tramo, i) => (
              <path key={i} d={tramo.d} fill="none" strokeLinecap="round" strokeWidth={tramo.hecho ? 6 : 4} stroke={tramo.hecho ? 'var(--mint)' : 'rgba(255,255,255,.55)'} strokeDasharray={tramo.hecho ? undefined : '1 11'} />
            ))}
          </svg>
          {mostradas.map(({ region, indice, hitos }) => {
            const derecha = indice % 2 === 1;
            return (
              <section key={region.nombre} className={`isla-fila isla-fila--${region.estado} ${derecha ? 'isla-fila--der' : ''}`} style={{ '--fila': indice < 4 ? 1 : 2, '--col': indice < 4 ? indice + 1 : 8 - indice } as React.CSSProperties}>
                <div className="isla-fila__arte" ref={(elemento) => { anclas.current[indice] = elemento; }}>
                  <Isla bioma={region.bioma} />
                  {region.estado === 'pendiente' && <span className="isla-fila__candado"><Candado /></span>}
                  {region.estado === 'actual' && <span className="isla-fila__aqui">Estás aquí</span>}
                  {region.estado !== 'pendiente' && (
                    <button className="isla-fila__album" onClick={() => setIslaAlbum(region.nombre)} aria-label={`Abrir el álbum de ${region.nombre}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1-1.6h6.6l1 1.6h1.2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="2" /></svg>
                      {albumDeIsla(region.nombre)?.pagina.reveladas ?? 0}/6
                    </button>
                  )}
                </div>
                <div className="isla-fila__texto">
                  <Kicker estilo={{ color: region.estado === 'actual' ? 'var(--accent)' : 'var(--mint)', fontSize: 'var(--fs-xs)' }}>Semana {region.semanas} · {region.modulo}</Kicker>
                  <h2 className="isla-fila__nombre">{region.nombre}</h2>
                  <ul className="mapa__hitos">
                    {hitos.length === 0 && (
                      <li className="mapa__hito mapa__hito--libre"><span className="mapa__nodo" /><div><small>Lecciones y práctica de la semana</small></div></li>
                    )}
                    {hitos.map((hito) => (
                      <li key={hito.titulo} className={`mapa__hito mapa__hito--${hito.estado}`}>
                        <span className="mapa__nodo" />
                        <div>
                          <strong>{hito.titulo}</strong>
                          {hito.nota && <span className="mapa__nota"><Pill variante="accent" pequena>{hito.nota}</Pill></span>}
                          {hito.meta && <small>{hito.meta}</small>}
                          {hito.accion && <a href={hito.accion.ruta}><Pill variante="deep" boton>{hito.accion.texto}</Pill></a>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <ModalAlbum nombreIsla={islaAlbum} ganada={regionesCurso.find((region) => region.nombre === islaAlbum)?.estado === 'hecha'} alCerrar={() => setIslaAlbum(null)} />
      <Dock accion={{ etiqueta: `Estás en la semana ${semanaActual}`, texto: `Continuar ${trabajoActual.titulo}`, ruta: '#/e6' }} />
    </Pantalla>
  );
}
