import { useState } from 'react';
import { Kicker, Pantalla, Pill } from '../componentes/ui';
import { dificultadPara, temaDeRepaso } from '../datos';

const RESPUESTAS = [
  'El promedio: suma todo y refleja a todos.',
  'La mediana: el valor central no se mueve por un caso extremo.',
  'El máximo: muestra hasta dónde llega una compra.',
  'La suma: da el total de lo que se vendió.',
];

export function E7Leccion() {
  const [elegida, setElegida] = useState(1);
  const tema = temaDeRepaso();
  const dificultad = dificultadPara(tema.valor);
  return (
    <Pantalla tono="oscura" clase="p-e7">
      <div className="pantalla__cuerpo">
        <div className="leccion__barra">
          <a href="#/e15" style={{ fontSize: 20, fontWeight: 700, opacity: .8 }}>✕</a>
          <div className="leccion__prog">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < 3 ? 'ok' : ''} />)}</div>
          <Pill variante="accent">0:24</Pill>
        </div>
        <div className="contenido" style={{ gap: 14, paddingTop: 18 }}>
          <Kicker estilo={{ color: 'var(--mint)' }}>Práctica mixta · pregunta 4 de 5</Kicker>
          <p className="leccion__nivel"><img src={`${import.meta.env.BASE_URL}gemas/${tema.gema.gema}.webp`} alt="" />{tema.gema.nombre} · {tema.gema.dimension} · dificultad {dificultad}</p>
          <h1 className="titulo" style={{ fontSize: 26, lineHeight: 1.12 }}>Nueve de cada diez clientes compran 20 USD y uno compra 2.000 USD. ¿Qué medida resume mejor la compra típica?</h1>
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
