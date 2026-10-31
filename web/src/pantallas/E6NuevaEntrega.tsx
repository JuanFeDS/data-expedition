import { useState } from 'react';
import { Cabecera, Kicker, Pantalla, Pill } from '../componentes/ui';

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
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <Cabecera kicker="Trabajo 2 · Modelo predictivo" titulo="Declara cómo lo hiciste" volver={{ texto: 'Entregas', ruta: '#/e5' }} />
        <div className="contenido" style={{ gap: 10 }}>
          {OPCIONES.map((opcion) => (
            <button key={opcion.modo} className="opcion" aria-pressed={modo === opcion.modo} onClick={() => setModo(opcion.modo)}>
              <span className="opcion__punto" />
              <span><strong>{opcion.titulo}</strong><span>{opcion.descripcion}</span></span>
            </button>
          ))}
          {modo === 'con_ia' && (
            <>
              <Kicker>Tu bitácora</Kicker>
              {BITACORA.map((campo) => (
                <div className="campo" key={campo.etiqueta}>
                  <label>{campo.etiqueta}</label>
                  <input placeholder={campo.ejemplo} />
                </div>
              ))}
            </>
          )}
          <div style={{ flex: 1 }} />
          <button style={{ paddingBottom: 24 }}><Pill grande>Entregar trabajo</Pill></button>
        </div>
      </div>
    </Pantalla>
  );
}
