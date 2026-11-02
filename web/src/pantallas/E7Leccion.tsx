import { useState } from 'react';
import { Kicker, Pantalla, Pill } from '../componentes/ui';
import {
  NOMBRE_FORMATO,
  PreguntaCompletar,
  PreguntaOpciones,
  PreguntaOrdenar,
  PreguntaUnir,
  PreguntaVF,
  type PreguntaDatos,
  type Resultado,
} from '../componentes/preguntas';
import { sonar } from '../componentes/sonidos';
import { dificultadPara, temaDeRepaso } from '../datos';

export const SESION_MIXTA: PreguntaDatos[] = [
  {
    tipo: 'opciones',
    enunciado: 'Un modelo acierta el 98 % de las veces, pero solo el 2 % de los casos son positivos. ¿Qué concluyes?',
    opciones: ['Es un excelente modelo: casi no se equivoca.', 'La exactitud no basta: un modelo que siempre dice “negativo” ya acierta 98 %.', 'Hay que subir el umbral hasta no ver falsos positivos.', 'No se puede evaluar sin más datos de entrenamiento.'],
    correcta: 1,
    explicacion: 'Con clases muy desbalanceadas, un modelo que nunca predice la clase rara ya parece bueno. Compáralo con un baseline y mira precisión y sensibilidad.',
  },
  {
    tipo: 'vf',
    enunciado: 'Un modelo con 0.99 de exactitud siempre es mejor que el baseline.',
    verdadera: false,
    justificaciones: ['Falso: depende de qué tan raro sea lo que se predice.', 'Falso: la exactitud solo sirve en regresión.', 'Verdadero: 0.99 es casi perfecto.'],
    correctaJustificacion: 0,
    explicacion: 'Si el 99 % de los casos son de una sola clase, el baseline “siempre esa clase” ya saca 0.99.',
  },
  {
    tipo: 'unir',
    enunciado: 'Une cada concepto con su definición',
    pares: [
      { concepto: 'Baseline', definicion: 'El modelo más simple contra el que se compara el tuyo' },
      { concepto: 'Sobreajuste', definicion: 'Aprender el ruido de entrenamiento y fallar con datos nuevos' },
      { concepto: 'Conjunto de prueba', definicion: 'Datos que el modelo no vio al entrenar, para medirlo' },
      { concepto: 'Métrica', definicion: 'Un número que resume qué tan bien predice el modelo' },
    ],
    orden: [2, 0, 3, 1],
    explicacion: 'Estos cuatro conceptos son la base de cualquier comparación de modelos.',
  },
  {
    tipo: 'ordenar',
    enunciado: 'Ordena el flujo para evaluar un modelo',
    pasos: ['Partir los datos en entrenamiento y prueba', 'Entrenar el modelo con el entrenamiento', 'Predecir sobre el conjunto de prueba', 'Medir con la métrica y comparar con el baseline'],
    mezcla: [2, 0, 3, 1],
    explicacion: 'Primero se parte, luego se entrena, se predice sobre lo que no vio y al final se mide y se compara.',
  },
  {
    tipo: 'completar',
    antes: 'Un',
    despues: 'es el modelo más simple contra el que se compara el tuyo.',
    opciones: ['baseline', 'hiperparámetro', 'pipeline', 'sobreajuste'],
    correcta: 0,
    explicacion: 'Si tu modelo no supera al baseline, no aporta nada todavía.',
  },
];

function Pregunta({ datos, alCambiar, bloqueada }: { datos: PreguntaDatos; alCambiar: (resultado: Resultado | null) => void; bloqueada: boolean }) {
  switch (datos.tipo) {
    case 'opciones': return <PreguntaOpciones datos={datos} alCambiar={alCambiar} bloqueada={bloqueada} />;
    case 'vf': return <PreguntaVF datos={datos} alCambiar={alCambiar} bloqueada={bloqueada} />;
    case 'unir': return <PreguntaUnir datos={datos} alCambiar={alCambiar} bloqueada={bloqueada} />;
    case 'ordenar': return <PreguntaOrdenar datos={datos} alCambiar={alCambiar} bloqueada={bloqueada} />;
    default: return <PreguntaCompletar datos={datos} alCambiar={alCambiar} bloqueada={bloqueada} />;
  }
}

export function E7Leccion({ inicio = 0 }: { inicio?: number }) {
  const tema = temaDeRepaso();
  const dificultad = dificultadPara(tema.valor);
  const [cola, setCola] = useState<number[]>(SESION_MIXTA.map((_, indice) => indice).slice(inicio));
  const [hechas, setHechas] = useState(inicio);
  const [repetidas, setRepetidas] = useState<number[]>([]);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [revisando, setRevisando] = useState(false);

  const actual = cola[0];
  const datos = SESION_MIXTA[actual];
  const esRepaso = repetidas.includes(actual);

  const continuar = () => {
    const falla = resultado?.correcta === false && !repetidas.includes(actual);
    const siguiente = falla ? [...cola.slice(1), actual] : cola.slice(1);
    if (falla) setRepetidas((previas) => [...previas, actual]);
    else setHechas((previas) => previas + 1);
    if (siguiente.length === 0) { window.location.hash = repetidas.length > 0 || falla ? '#/e27' : '#/e8'; return; }
    setCola(siguiente);
    setResultado(null);
    setRevisando(false);
  };

  return (
    <Pantalla tono="oscura" clase="p-e7">
      <div className="pantalla__cuerpo">
        <div className="leccion__barra">
          <a className="cerrar-practica" href="#/e15" aria-label="Salir de la práctica" style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, opacity: .8 }}>✕</a>
          <div className="leccion__prog">{SESION_MIXTA.map((_, indice) => <i key={indice} className={indice < hechas ? 'ok' : ''} />)}</div>
          <Pill variante="accent">0:24</Pill>
        </div>
        <div className="contenido sesion__cuerpo" key={`${actual}-${esRepaso}`}>
          <Kicker estilo={{ color: 'var(--mint)' }}>{esRepaso ? 'Repaso de lo que fallaste' : `Práctica mixta · ${NOMBRE_FORMATO[datos.tipo]} · pregunta ${actual + 1} de ${SESION_MIXTA.length}`}</Kicker>
          <p className="leccion__nivel"><img src={`${import.meta.env.BASE_URL}gemas/${tema.gema.gema}.webp`} alt="" />{tema.gema.nombre} · {tema.gema.dimension} · dificultad {dificultad}</p>
          <Pregunta datos={datos} alCambiar={setResultado} bloqueada={revisando} />
        </div>
        {revisando && resultado ? (
          <div className={`sesion__fb ${resultado.correcta ? 'sesion__fb--ok' : 'sesion__fb--mal'}`} role="status">
            <strong>{resultado.correcta ? '¡Correcto!' : 'Casi. Lo repasamos al final.'}</strong>
            <p>{datos.explicacion}</p>
            <button className="boton boton--accent" onClick={continuar}>Continuar</button>
          </div>
        ) : (
          <div className="sesion__pie">
            <button className="boton boton--accent sesion__comprobar" disabled={resultado === null} onClick={() => { setRevisando(true); sonar(resultado?.correcta ? 'acierto' : 'error'); }}>Comprobar</button>
          </div>
        )}
      </div>
    </Pantalla>
  );
}
