import { useState } from 'react';
import { Jaguar } from '../componentes/Jaguar';
import { PreguntaUnir, type PreguntaUnirDatos, type Resultado } from '../componentes/preguntas';
import { Kicker, Pantalla, Pill } from '../componentes/ui';
import { SESION_MIXTA } from './E7Leccion';

const DATOS = SESION_MIXTA.find((pregunta): pregunta is PreguntaUnirDatos => pregunta.tipo === 'unir')!;

export function E16UnirConceptos() {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  return (
    <Pantalla tono="oscura" clase="p-e16">
      <div className="pantalla__cuerpo">
        <div className="leccion__barra">
          <a className="cerrar-practica" href="#/e15" aria-label="Salir de la práctica" style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, opacity: .8 }}>✕</a>
          <div className="leccion__prog">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < 2 + (resultado ? 1 : 0) ? 'ok' : ''} />)}</div>
          <Pill variante="accent">0:41</Pill>
        </div>
        <div className="contenido unir">
          <Kicker estilo={{ color: 'var(--mint)' }}>Práctica mixta · Modelado · pregunta 3 de 5</Kicker>
          <PreguntaUnir datos={DATOS} alCambiar={setResultado} bloqueada={false} />
          {resultado && (
            <div className="unir__ok">
              <Jaguar pose="celebra" ancho={84} />
              <p>{resultado.correcta ? 'Sin fallar ninguna. ¡Excelente!' : 'Bien. Las que fallaste las repasamos al final.'}</p>
            </div>
          )}
        </div>
        <a href="#/e8" className={resultado ? '' : 'unir__comprobar--apagado'} style={{ padding: '8px 24px 34px' }} aria-disabled={!resultado}><Pill variante="accent" grande>{resultado ? 'Comprobar' : 'Une todos para continuar'}</Pill></a>
      </div>
    </Pantalla>
  );
}
