import { useEffect } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { Dato, Estado, Tarjeta } from '../componentes/panel';
import { sonar } from '../componentes/sonidos';
import { Contador, Pantalla } from '../componentes/ui';

const FALLADAS = [
  { formato: 'Verdadero o falso', enunciado: 'Un modelo con 0.99 de exactitud siempre es mejor que el baseline.', tuya: 'Verdadero', correcta: 'Falso: depende de qué tan rara sea la clase que se predice.', pista: 'Con 99 % de casos de una sola clase, el baseline “siempre esa clase” ya saca 0.99.' },
  { formato: 'Ordenar', enunciado: 'Ordena el flujo para evaluar un modelo', tuya: 'Entrenar, partir, predecir, medir', correcta: 'Partir, entrenar, predecir sobre la prueba y medir.', pista: 'Se parte primero para que el modelo no vea los datos con los que se mide.' },
];

export function E27PracticaFallos() {
  useEffect(() => { sonar('sesion'); }, []);
  return (
    <Pantalla clase="p-e27">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Practicar', ruta: '#/e15' }} kicker="Práctica mixta · Modelado" titulo="Buen intento" subtitulo="3 de 5 a la primera. Las otras 2 se repasaron al final." objeto="linterna" />
        <div className="contenido cuerpo-mundo panel">
          <div className="fallos__columnas">
            <Tarjeta tono="menta" kicker="Lo que sumaste" titulo="Fallar también cuenta">
              <div className="rejilla">
                <Dato valor={<>+<Contador valor={30} /></>} etiqueta="XP de la sesión" nota="Sin penalización" />
                <Dato valor="2" etiqueta="Para repasar" nota="Quedan en tu mezcla" tono="alerta" />
              </div>
              <div className="fallos__jaguar"><Jaguar pose="pensando" ancho={110} /><p>Sin vidas ni castigos: lo que fallas hoy se vuelve a preguntar hasta que lo domines.</p></div>
            </Tarjeta>
            <div className="fallos__lado">
              {FALLADAS.map((falla) => (
                <Tarjeta key={falla.enunciado} kicker={falla.formato} titulo={falla.enunciado} accion={<Estado tipo="alerta">Para repasar</Estado>}>
                  <dl className="fallos__respuestas">
                    <div><dt>Tu respuesta</dt><dd className="fallos__mala">{falla.tuya}</dd></div>
                    <div><dt>La correcta</dt><dd className="fallos__buena">{falla.correcta}</dd></div>
                  </dl>
                  <p className="meta">{falla.pista}</p>
                </Tarjeta>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Repasa lo que fallaste', texto: 'Practicar de nuevo', ruta: '#/e7' }} />
    </Pantalla>
  );
}
