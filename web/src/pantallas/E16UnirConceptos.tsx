import { useEffect, useRef, useState } from 'react';
import { Jaguar } from '../componentes/Jaguar';
import { Kicker, Pantalla, Pill } from '../componentes/ui';

interface Par {
  concepto: string;
  definicion: string;
}

const PARES: Par[] = [
  { concepto: 'Reproducibilidad', definicion: 'Que otra persona obtenga tu mismo resultado al correr tu trabajo' },
  { concepto: 'Entorno virtual', definicion: 'Un espacio aislado con las librerías exactas de un proyecto' },
  { concepto: 'Control de versiones', definicion: 'El historial de cambios que permite volver atrás y colaborar' },
  { concepto: 'Semilla aleatoria', definicion: 'Un valor fijo que hace repetible un proceso con azar' },
];

const ORDEN_DEFINICIONES = [2, 0, 3, 1];
const COLORES = ['amarillo', 'menta', 'azul', 'coral'];

export function E16UnirConceptos() {
  const [concepto, setConcepto] = useState<number | null>(null);
  const [unidos, setUnidos] = useState<Record<number, number>>({});
  const [falla, setFalla] = useState<{ concepto: number; definicion: number } | null>(null);
  const [errores, setErrores] = useState(0);
  const temporizador = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const orden = Object.keys(unidos).map(Number);
  const colorDe = (indiceConcepto: number) => COLORES[orden.indexOf(indiceConcepto) % COLORES.length];
  const definicionUnida = (indiceDefinicion: number) => Object.entries(unidos).find(([, definicion]) => definicion === indiceDefinicion)?.[0];
  const completo = orden.length === PARES.length;

  const elegirConcepto = (indice: number) => {
    if (indice in unidos || falla) return;
    setConcepto(concepto === indice ? null : indice);
  };

  const elegirDefinicion = (indice: number) => {
    if (concepto === null || falla || definicionUnida(indice) !== undefined) return;
    if (concepto === indice) {
      setUnidos((actual) => ({ ...actual, [concepto]: indice }));
      setConcepto(null);
      return;
    }
    setErrores((actual) => actual + 1);
    setFalla({ concepto, definicion: indice });
    temporizador.current = window.setTimeout(() => {
      setFalla(null);
      setConcepto(null);
    }, 650);
  };

  return (
    <Pantalla tono="oscura" clase="p-e16">
      <div className="pantalla__cuerpo">
        <div className="leccion__barra">
          <a href="#/e15" style={{ fontSize: 20, fontWeight: 700, opacity: .8 }}>✕</a>
          <div className="leccion__prog">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < 2 + (completo ? 1 : 0) ? 'ok' : ''} />)}</div>
          <Pill variante="accent">0:41</Pill>
        </div>
        <div className="contenido unir">
          <Kicker estilo={{ color: 'var(--mint)' }}>Repaso de Producción · pregunta 3 de 5</Kicker>
          <h1 className="titulo" style={{ fontSize: 26, lineHeight: 1.12 }}>Une cada concepto con su definición</h1>
          <p className="unir__ayuda">{completo ? '¡Todo unido!' : concepto === null ? 'Toca un concepto y luego su definición.' : 'Ahora toca la definición que le corresponde.'}</p>

          <div className="unir__tablero">
            <ul className="unir__columna" aria-label="Conceptos">
              {PARES.map((par, indice) => {
                const unido = indice in unidos;
                const estado = unido ? `unido unido--${colorDe(indice)}` : concepto === indice ? 'activo' : '';
                const mal = falla?.concepto === indice ? 'mal' : '';
                return (
                  <li key={par.concepto}>
                    <button className={`ficha ficha--concepto ${estado} ${mal}`} onClick={() => elegirConcepto(indice)} aria-pressed={concepto === indice} disabled={unido}>
                      <span>{par.concepto}</span>
                      {unido && <i className="ficha__enlace" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <ul className="unir__columna" aria-label="Definiciones">
              {ORDEN_DEFINICIONES.map((indice) => {
                const dueno = definicionUnida(indice);
                const unido = dueno !== undefined;
                const estado = unido ? `unido unido--${colorDe(Number(dueno))}` : '';
                const mal = falla?.definicion === indice ? 'mal' : '';
                return (
                  <li key={PARES[indice].definicion}>
                    <button className={`ficha ficha--definicion ${estado} ${mal} ${concepto !== null && !unido ? 'disponible' : ''}`} onClick={() => elegirDefinicion(indice)} disabled={unido}>
                      <span>{PARES[indice].definicion}</span>
                      {unido && <i className="ficha__enlace" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="unir__estado" aria-live="polite">
            <span>{orden.length} de {PARES.length} unidos</span>
            {errores > 0 && <span className="unir__errores">{errores} {errores === 1 ? 'intento fallado' : 'intentos fallados'}</span>}
          </div>
          {completo && (
            <div className="unir__ok">
              <Jaguar pose="celebra" ancho={84} />
              <p>{errores === 0 ? 'Sin fallar ninguna. ¡Excelente!' : 'Bien. Las que fallaste las repasamos al final.'}</p>
            </div>
          )}
        </div>
        <a href="#/e8" className={completo ? '' : 'unir__comprobar--apagado'} style={{ padding: '8px 24px 34px' }} aria-disabled={!completo}><Pill variante="accent" grande>{completo ? 'Comprobar' : 'Une todos para continuar'}</Pill></a>
      </div>
    </Pantalla>
  );
}
