import { useState } from 'react';
import { Kicker, Pantalla, Pill } from '../componentes/ui';

const RESPUESTAS = [
  'Es un excelente modelo: casi no se equivoca.',
  'La exactitud no basta: un modelo que siempre dice “negativo” ya acierta 98 %.',
  'Hay que subir el umbral hasta no ver falsos positivos.',
  'No se puede evaluar sin más datos de entrenamiento.',
];

export function E7Leccion() {
  const [elegida, setElegida] = useState(1);
  return (
    <Pantalla tono="oscura" clase="p-e7">
      <div className="pantalla__cuerpo">
        <div className="leccion__barra">
          <a href="#/home" style={{ fontSize: 20, fontWeight: 700, opacity: .8 }}>✕</a>
          <div className="leccion__prog">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < 3 ? 'ok' : ''} />)}</div>
          <Pill variante="accent">0:24</Pill>
        </div>
        <div className="contenido" style={{ gap: 14, paddingTop: 18 }}>
          <Kicker estilo={{ color: 'var(--mint)' }}>Validación · pregunta 4 de 5</Kicker>
          <h1 className="titulo" style={{ fontSize: 26, lineHeight: 1.12 }}>Un modelo acierta el 98 % de las veces, pero solo el 2 % de los casos son positivos. ¿Qué concluyes?</h1>
          {RESPUESTAS.map((texto, indice) => (
            <button key={texto} className="resp" aria-pressed={elegida === indice} onClick={() => setElegida(indice)}>
              <b>{'ABCD'[indice]}</b><span>{texto}</span>
            </button>
          ))}
          <p style={{ fontSize: 12, fontWeight: 600, opacity: .6 }}>Los valores de este ejercicio son distintos para cada estudiante.</p>
        </div>
        <a href="#/e8" style={{ padding: '8px 24px 34px' }}><Pill variante="accent" grande>Comprobar</Pill></a>
      </div>
    </Pantalla>
  );
}
