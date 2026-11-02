import { useEffect, useRef, useState } from 'react';

export interface Resultado {
  correcta: boolean;
}

interface PropsPregunta {
  alCambiar: (resultado: Resultado | null) => void;
  bloqueada: boolean;
}

export interface PreguntaOpcionesDatos {
  tipo: 'opciones';
  enunciado: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}
export interface PreguntaVFDatos {
  tipo: 'vf';
  enunciado: string;
  verdadera: boolean;
  justificaciones: string[];
  correctaJustificacion: number;
  explicacion: string;
}
export interface PreguntaUnirDatos {
  tipo: 'unir';
  enunciado: string;
  pares: { concepto: string; definicion: string }[];
  orden: number[];
  explicacion: string;
}
export interface PreguntaOrdenarDatos {
  tipo: 'ordenar';
  enunciado: string;
  pasos: string[];
  mezcla: number[];
  explicacion: string;
}
export interface PreguntaCompletarDatos {
  tipo: 'completar';
  antes: string;
  despues: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}
export type PreguntaDatos = PreguntaOpcionesDatos | PreguntaVFDatos | PreguntaUnirDatos | PreguntaOrdenarDatos | PreguntaCompletarDatos;

export const NOMBRE_FORMATO: Record<PreguntaDatos['tipo'], string> = {
  opciones: 'Opción múltiple',
  vf: 'Verdadero o falso',
  unir: 'Unir conceptos',
  ordenar: 'Ordenar',
  completar: 'Completar',
};

export function PreguntaOpciones({ datos, alCambiar, bloqueada }: PropsPregunta & { datos: PreguntaOpcionesDatos }) {
  const [elegida, setElegida] = useState<number | null>(null);
  const elegir = (indice: number) => {
    if (bloqueada) return;
    setElegida(indice);
    alCambiar({ correcta: indice === datos.correcta });
  };
  return (
    <>
      <h1 className="titulo preg__titulo">{datos.enunciado}</h1>
      {datos.opciones.map((texto, indice) => (
        <button key={texto} className={`resp ${bloqueada && indice === datos.correcta ? 'resp--ok' : ''} ${bloqueada && elegida === indice && indice !== datos.correcta ? 'resp--mal' : ''}`} aria-pressed={elegida === indice} onClick={() => elegir(indice)}>
          <b>{'ABCD'[indice]}</b><span>{texto}</span>
        </button>
      ))}
    </>
  );
}

export function PreguntaVF({ datos, alCambiar, bloqueada }: PropsPregunta & { datos: PreguntaVFDatos }) {
  const [valor, setValor] = useState<boolean | null>(null);
  const [justificacion, setJustificacion] = useState<number | null>(null);
  const actualizar = (nuevoValor: boolean | null, nuevaJust: number | null) => {
    if (nuevoValor === null || nuevaJust === null) { alCambiar(null); return; }
    alCambiar({ correcta: nuevoValor === datos.verdadera && nuevaJust === datos.correctaJustificacion });
  };
  return (
    <>
      <h1 className="titulo preg__titulo">{datos.enunciado}</h1>
      <div className="preg__vf">
        {[true, false].map((opcion) => (
          <button key={String(opcion)} className="resp preg__vf-boton" aria-pressed={valor === opcion} disabled={bloqueada} onClick={() => { setValor(opcion); actualizar(opcion, justificacion); }}>
            <span>{opcion ? 'Verdadero' : 'Falso'}</span>
          </button>
        ))}
      </div>
      <p className="preg__ayuda">Elige la justificación</p>
      {datos.justificaciones.map((texto, indice) => (
        <button key={texto} className={`resp preg__just ${bloqueada && indice === datos.correctaJustificacion ? 'resp--ok' : ''}`} aria-pressed={justificacion === indice} disabled={bloqueada} onClick={() => { setJustificacion(indice); actualizar(valor, indice); }}>
          <span>{texto}</span>
        </button>
      ))}
    </>
  );
}

const COLORES = ['amarillo', 'menta', 'azul', 'coral'];

export function PreguntaUnir({ datos, alCambiar, bloqueada }: PropsPregunta & { datos: PreguntaUnirDatos }) {
  const [concepto, setConcepto] = useState<number | null>(null);
  const [unidos, setUnidos] = useState<Record<number, number>>({});
  const [falla, setFalla] = useState<{ concepto: number; definicion: number } | null>(null);
  const [errores, setErrores] = useState(0);
  const temporizador = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const orden = Object.keys(unidos).map(Number);
  const colorDe = (indiceConcepto: number) => COLORES[orden.indexOf(indiceConcepto) % COLORES.length];
  const definicionUnida = (indiceDefinicion: number) => Object.entries(unidos).find(([, definicion]) => definicion === indiceDefinicion)?.[0];

  const elegirConcepto = (indice: number) => {
    if (indice in unidos || falla || bloqueada) return;
    setConcepto(concepto === indice ? null : indice);
  };
  const elegirDefinicion = (indice: number) => {
    if (concepto === null || falla || bloqueada || definicionUnida(indice) !== undefined) return;
    if (concepto === indice) {
      const siguientes = { ...unidos, [concepto]: indice };
      setUnidos(siguientes);
      setConcepto(null);
      if (Object.keys(siguientes).length === datos.pares.length) alCambiar({ correcta: errores === 0 });
      return;
    }
    setErrores((actual) => actual + 1);
    setFalla({ concepto, definicion: indice });
    temporizador.current = window.setTimeout(() => { setFalla(null); setConcepto(null); }, 650);
  };

  return (
    <>
      <h1 className="titulo preg__titulo">{datos.enunciado}</h1>
      <p className="unir__ayuda">{orden.length === datos.pares.length ? '¡Todo unido!' : concepto === null ? 'Toca un concepto y luego su definición.' : 'Ahora toca la definición que le corresponde.'}</p>
      <div className="unir__tablero">
        <ul className="unir__columna" aria-label="Conceptos">
          {datos.pares.map((par, indice) => {
            const unido = indice in unidos;
            return (
              <li key={par.concepto}>
                <button className={`ficha ficha--concepto ${unido ? `unido unido--${colorDe(indice)}` : concepto === indice ? 'activo' : ''} ${falla?.concepto === indice ? 'mal' : ''}`} onClick={() => elegirConcepto(indice)} disabled={unido}>
                  <span>{par.concepto}</span>{unido && <i className="ficha__enlace" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="unir__columna" aria-label="Definiciones">
          {datos.orden.map((indice) => {
            const dueno = definicionUnida(indice);
            const unido = dueno !== undefined;
            return (
              <li key={datos.pares[indice].definicion}>
                <button className={`ficha ficha--definicion ${unido ? `unido unido--${colorDe(Number(dueno))}` : ''} ${falla?.definicion === indice ? 'mal' : ''} ${concepto !== null && !unido ? 'disponible' : ''}`} onClick={() => elegirDefinicion(indice)} disabled={unido}>
                  <span>{datos.pares[indice].definicion}</span>{unido && <i className="ficha__enlace" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="unir__estado"><span>{orden.length} de {datos.pares.length} unidos</span>{errores > 0 && <span className="unir__errores">{errores} {errores === 1 ? 'intento fallado' : 'intentos fallados'}</span>}</div>
    </>
  );
}

export function PreguntaOrdenar({ datos, alCambiar, bloqueada }: PropsPregunta & { datos: PreguntaOrdenarDatos }) {
  const [elegidos, setElegidos] = useState<number[]>([]);
  const alternar = (indice: number) => {
    if (bloqueada) return;
    const siguientes = elegidos.includes(indice) ? elegidos.filter((valor) => valor !== indice) : [...elegidos, indice];
    setElegidos(siguientes);
    alCambiar(siguientes.length === datos.pasos.length ? { correcta: siguientes.every((valor, posicion) => valor === posicion) } : null);
  };
  return (
    <>
      <h1 className="titulo preg__titulo">{datos.enunciado}</h1>
      <p className="unir__ayuda">Toca los pasos en el orden correcto. Toca uno elegido para quitarlo.</p>
      <ul className="ord__lista">
        {datos.mezcla.map((indice) => {
          const posicion = elegidos.indexOf(indice);
          return (
            <li key={datos.pasos[indice]}>
              <button className={`ficha ord__paso ${posicion >= 0 ? 'unido unido--menta' : ''} ${bloqueada && posicion >= 0 && posicion !== indice ? 'mal' : ''}`} onClick={() => alternar(indice)}>
                <b className="ord__numero">{posicion >= 0 ? posicion + 1 : ''}</b>
                <span>{datos.pasos[indice]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function PreguntaCompletar({ datos, alCambiar, bloqueada }: PropsPregunta & { datos: PreguntaCompletarDatos }) {
  const [elegida, setElegida] = useState<number | null>(null);
  const elegir = (indice: number) => {
    if (bloqueada) return;
    setElegida(indice);
    alCambiar({ correcta: indice === datos.correcta });
  };
  return (
    <>
      <h1 className="titulo preg__titulo">Completa la frase</h1>
      <p className="comp__frase">{datos.antes} <span className={`comp__hueco ${elegida !== null ? 'lleno' : ''}`}>{elegida !== null ? datos.opciones[elegida] : '      '}</span> {datos.despues}</p>
      <div className="comp__opciones">
        {datos.opciones.map((texto, indice) => (
          <button key={texto} className={`diag__chip comp__chip ${bloqueada && indice === datos.correcta ? 'resp--ok' : ''}`} aria-pressed={elegida === indice} disabled={bloqueada} onClick={() => elegir(indice)}>{texto}</button>
        ))}
      </div>
    </>
  );
}
