import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Dock } from '../componentes/Dock';
import { Isla } from '../componentes/Region';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Kicker, Pantalla, Pill } from '../componentes/ui';
import { formatoFecha, useServicioTrabajos, type EntregaPropia, type TrabajoCurso } from '../servicios/trabajos';

const BIOMAS = ['selva', 'paramo', 'desierto', 'cueva', 'glaciar', 'costa', 'ruinas', 'volcan'];
const POR_FILA = 4;

interface Tramo { d: string; hecho: boolean }

function Candado() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" fill="#F1F8F4" />
      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#F1F8F4" strokeWidth="1.6" />
    </svg>
  );
}

export function E1RutaReal() {
  const servicio = useServicioTrabajos();
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [trabajos, setTrabajos] = useState<TrabajoCurso[] | null>(null);
  const [entregas, setEntregas] = useState<EntregaPropia[]>([]);
  const [fallo, setFallo] = useState(false);
  const [tramos, setTramos] = useState<Tramo[]>([]);
  const mapa = useRef<HTMLDivElement>(null);
  const anclas = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!curso) return;
    Promise.all([servicio.cargarTrabajos(curso.id), servicio.misEntregas(curso.id)])
      .then(([lista, propias]) => { setTrabajos(lista); setEntregas(propias); })
      .catch(() => setFallo(true));
  }, [servicio, curso]);

  const islas = useMemo(() => {
    const entregaDe = (id: string) => entregas.find((entrega) => entrega.trabajoId === id && entrega.estado !== 'borrador');
    const lista = trabajos ?? [];
    const indiceActual = lista.findIndex((trabajo) => !entregaDe(trabajo.id));
    return lista.map((trabajo, indice) => {
      const entrega = entregaDe(trabajo.id);
      const estado: 'hecha' | 'actual' | 'pendiente' = entrega ? 'hecha' : indice === indiceActual ? 'actual' : 'pendiente';
      return { trabajo, indice, entrega, estado, bioma: BIOMAS[indice % BIOMAS.length] };
    });
  }, [trabajos, entregas]);

  const indiceActual = islas.findIndex((isla) => isla.estado === 'actual');
  const actual = indiceActual >= 0 ? islas[indiceActual] : null;
  const hechas = islas.filter((isla) => isla.estado === 'hecha').length;
  const mostradas = [...islas].reverse();
  const detalle = (id: string) => `${rutaCurso('#/trabajo')}?trabajo=${id}`;

  useLayoutEffect(() => {
    const medir = () => {
      const caja = mapa.current;
      if (!caja) return;
      const base = caja.getBoundingClientRect();
      const puntos = islas.map((_, indice) => {
        const elemento = anclas.current[indice];
        if (!elemento) return null;
        const cajaIsla = elemento.getBoundingClientRect();
        return { x: cajaIsla.left - base.left + cajaIsla.width / 2, y: cajaIsla.top - base.top + cajaIsla.height * 0.62 };
      });
      const nuevos: Tramo[] = [];
      for (let i = 0; i < puntos.length - 1; i += 1) {
        const desde = puntos[i];
        const hasta = puntos[i + 1];
        if (!desde || !hasta) continue;
        const medio = (desde.y + hasta.y) / 2;
        nuevos.push({ d: `M ${desde.x} ${desde.y} C ${desde.x} ${medio}, ${hasta.x} ${medio}, ${hasta.x} ${hasta.y}`, hecho: indiceActual === -1 || i + 1 <= indiceActual });
      }
      setTramos(nuevos);
    };
    medir();
    const observador = new ResizeObserver(medir);
    if (mapa.current) observador.observe(mapa.current);
    return () => observador.disconnect();
  }, [islas, indiceActual]);

  return (
    <Pantalla tono="oscura" clase="p-e1">
      <div className="pantalla__cuerpo ruta">
        <header className="ruta__cab">
          <div className="ruta__top"><a className="ruta__volver" href="#/inicio">‹ Inicio</a><Pill variante="accent">{hechas} de {islas.length} islas</Pill></div>
          <h1 className="titulo ruta__titulo">Mapa del curso</h1>
          <p className="ruta__sub">{islas.length === 0 ? 'Tu docente aún no publica los trabajos que forman el mapa.' : actual ? `Isla ${actual.indice + 1} de ${islas.length} · una entrega más y avanzas` : '¡Recorriste todo el mapa!'}</p>
        </header>
        {fallo && <p className="acceso__error" role="alert">No pudimos cargar el mapa. Intenta de nuevo en un momento.</p>}
        <div className="mapa" ref={mapa}>
          <svg className="mapa__ruta" aria-hidden="true">
            {tramos.map((tramo, i) => (
              <path key={i} d={tramo.d} fill="none" strokeLinecap="round" strokeWidth={tramo.hecho ? 6 : 4} stroke={tramo.hecho ? 'var(--mint)' : 'rgba(255,255,255,.55)'} strokeDasharray={tramo.hecho ? undefined : '1 11'} />
            ))}
          </svg>
          {mostradas.map(({ trabajo, indice, entrega, estado, bioma }) => {
            const fila = Math.floor(indice / POR_FILA) + 1;
            const posicion = indice % POR_FILA;
            const columna = fila % 2 === 1 ? posicion + 1 : POR_FILA - posicion;
            const vence = formatoFecha(trabajo.venceEn);
            return (
              <section key={trabajo.id} className={`isla-fila isla-fila--${estado} ${indice % 2 === 1 ? 'isla-fila--der' : ''}`} style={{ '--fila': fila, '--col': columna } as React.CSSProperties}>
                <div className="isla-fila__arte" ref={(elemento) => { anclas.current[indice] = elemento; }}>
                  <Isla bioma={bioma} />
                  {estado === 'pendiente' && <span className="isla-fila__candado"><Candado /></span>}
                  {estado === 'actual' && <span className="isla-fila__aqui">Estás aquí</span>}
                </div>
                <div className="isla-fila__texto">
                  <Kicker estilo={{ color: estado === 'actual' ? 'var(--accent)' : 'var(--mint)', fontSize: 'var(--fs-xs)' }}>{trabajo.semana ? `Semana ${trabajo.semana}` : `Isla ${indice + 1}`}{trabajo.tema ? ` · ${trabajo.tema}` : ''}</Kicker>
                  <h2 className="isla-fila__nombre"><a href={detalle(trabajo.id)}>{trabajo.nombre}</a></h2>
                  <ul className="mapa__hitos">
                    <li className={`mapa__hito mapa__hito--${estado === 'hecha' ? 'hecho' : estado === 'actual' ? 'actual' : 'bloqueado'}`}>
                      <span className="mapa__nodo" />
                      <div>
                        {entrega?.estado === 'calificada' && entrega.nota !== null && <span className="mapa__nota"><Pill variante="accent" pequena>{entrega.nota.toFixed(1)}</Pill></span>}
                        <small>{entrega ? (entrega.estado === 'calificada' ? 'Calificado' : 'Entregado, en revisión') : `Vence ${vence.largo}`}</small>
                        {estado === 'actual' && <a href={rutaCurso('#/e6')}><Pill variante="deep" boton>Entregar</Pill></a>}
                      </div>
                    </li>
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <Dock accion={actual ? { etiqueta: `Isla ${actual.indice + 1}`, texto: `Continuar ${actual.trabajo.nombre}`, ruta: detalle(actual.trabajo.id) } : undefined} />
    </Pantalla>
  );
}
