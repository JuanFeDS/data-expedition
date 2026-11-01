import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Kicker, Pantalla } from '../componentes/ui';

type Modo = 'sin_ia' | 'con_ia';

const OPCIONES: { modo: Modo; titulo: string; descripcion: string }[] = [
  { modo: 'sin_ia', titulo: 'Sin IA', descripcion: 'Lo hice yo solo. Se evalúan tus habilidades de base.' },
  { modo: 'con_ia', titulo: 'Con IA', descripcion: 'Usé IA. Mismo tope de nota: aquí se evalúa cómo la diriges.' },
];

const BITACORA = [
  { etiqueta: '¿Qué le pediste a la IA?', ejemplo: 'Ej: sugiere variables para predecir la deserción…' },
  { etiqueta: '¿Qué aceptaste?', ejemplo: 'Lo que usaste tal cual o con ajustes…' },
  { etiqueta: '¿Qué descartaste y por qué?', ejemplo: 'Lo que no usaste y la razón…' },
];

export function E6NuevaEntrega() {
  const [modo, setModo] = useState<Modo>('con_ia');
  const pasoActual = modo === 'con_ia' ? 2 : 3;
  return (
    <Pantalla clase="p-e6">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Entregas', ruta: '#/e5' }} kicker="Trabajo 2 · Modelo predictivo" titulo="Declara cómo lo hiciste" objeto="cuaderno" />
        <div className="contenido cuerpo-mundo centrar" style={{ gap: 12 }}>
          <ol className="pasos" aria-label="Pasos de la entrega">
            {['Declarar', 'Bitácora', 'Entregar'].map((etiqueta, indice) => (
              <li key={etiqueta} className={indice + 1 < pasoActual ? 'hecho' : indice + 1 === pasoActual ? 'actual' : ''}>
                <b>{indice + 1}</b><span>{etiqueta}</span>
              </li>
            ))}
          </ol>
          {OPCIONES.map((opcion) => (
            <button key={opcion.modo} className="opcion" aria-pressed={modo === opcion.modo} onClick={() => setModo(opcion.modo)}>
              <span className="opcion__punto" />
              <span><strong>{opcion.titulo}</strong><span>{opcion.descripcion}</span></span>
            </button>
          ))}
          {modo === 'con_ia' ? (
            <>
              <Kicker>Tu bitácora</Kicker>
              {BITACORA.map((campo, indice) => (
                <div className="campo campo--numerado" key={campo.etiqueta}>
                  <label><b>{indice + 1}</b>{campo.etiqueta}</label>
                  <input placeholder={campo.ejemplo} />
                </div>
              ))}
            </>
          ) : (
            <p className="meta" style={{ fontSize: 13 }}>Sin IA no necesitas bitácora. Al entregar responderás las preguntas de decisión del trabajo.</p>
          )}
        </div>
      </div>
      <Dock accion={{ etiqueta: `Paso ${pasoActual} de 3`, texto: 'Entregar trabajo', ruta: '#/e5' }} />
    </Pantalla>
  );
}
