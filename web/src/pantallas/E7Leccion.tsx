import { useState } from 'react';
import { Kicker, Pantalla, Pill } from '../componentes/ui';
import { dificultadPara, temaDeRepaso } from '../datos';

const RESPUESTAS = [
  'Mandarle una captura con mi resultado para que le crea.',
  'Fijar las versiones de las librerías y ejecutar el cuaderno de principio a fin.',
  'Decirle que cambie de computador, el mío funciona.',
  'Borrar las celdas que fallan antes de entregar.',
];

export function E7Leccion() {
  const [elegida, setElegida] = useState(1);
  const tema = temaDeRepaso();
  const dificultad = dificultadPara(tema.valor);
  return (
    <Pantalla tono="oscura" clase="p-e7">
      <div className="pantalla__cuerpo">
        <div className="leccion__barra">
          <a href="#/home" style={{ fontSize: 20, fontWeight: 700, opacity: .8 }}>✕</a>
          <div className="leccion__prog">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < 3 ? 'ok' : ''} />)}</div>
          <Pill variante="accent">0:24</Pill>
        </div>
        <div className="contenido" style={{ gap: 14, paddingTop: 18 }}>
          <Kicker estilo={{ color: 'var(--mint)' }}>Repaso de {tema.gema.dimension} · pregunta 4 de 5</Kicker>
          <p className="leccion__nivel"><img src={`${import.meta.env.BASE_URL}gemas/${tema.gema.gema}.webp`} alt="" />{tema.gema.nombre} · dificultad {dificultad}</p>
          <h1 className="titulo" style={{ fontSize: 26, lineHeight: 1.12 }}>Tu cuaderno corre bien en tu computador, pero a tu compañero le da error. ¿Qué haces primero?</h1>
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
