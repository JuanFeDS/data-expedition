import { useState } from 'react';
import { Cabecera, Pantalla, Pill } from '../componentes/ui';

type Modo = 'colaborativo' | 'competitivo';

const OPCIONES: { modo: Modo; titulo: string; descripcion: string; detalle: string; color: string }[] = [
  { modo: 'colaborativo', titulo: 'Colaborativo', descripcion: 'Metas de grupo: sumamos todos hacia una meta común del módulo.', detalle: 'Barra de meta compartida · sin ranking', color: 'verde' },
  { modo: 'competitivo', titulo: 'Competitivo', descripcion: 'Ligas pequeñas armadas por nivel del diagnóstico. Compites con quienes están cerca de ti.', detalle: 'Ligas de 6 · sin tabla global', color: 'azul' },
];

export function E9Votacion() {
  const [voto, setVoto] = useState<Modo>('colaborativo');
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <Cabecera kicker="Módulo 2 · votación del grupo" titulo="¿Cómo quieren jugar?" subtitulo="Las mismas misiones; cambia cómo se puntúa. Tu voto es anónimo." volver={{ texto: 'Ruta', ruta: '#/e1' }} />
        <div className="contenido" style={{ gap: 10 }}>
          {OPCIONES.map((opcion) => (
            <button key={opcion.modo} className={`voto voto--${opcion.color}`} aria-pressed={voto === opcion.modo} onClick={() => setVoto(opcion.modo)}>
              <span className="voto__cabeza">
                <strong className="titulo" style={{ fontSize: 30 }}>{opcion.titulo}</strong>
                {voto === opcion.modo && <Pill variante="accent">Tu voto</Pill>}
              </span>
              <span className="voto__desc">{opcion.descripcion}</span>
              <span className="voto__detalle">{opcion.detalle}</span>
            </button>
          ))}
          <div className="participacion">
            <strong>14 de 22 ya votaron</strong>
            <div className="participacion__barra"><i style={{ width: `${(14 / 22) * 100}%` }} /></div>
            <p className="meta" style={{ fontSize: 12 }}>Los resultados se muestran al cerrar la votación. Puedes cambiar tu voto hasta entonces. Se repite en cada módulo.</p>
          </div>
        </div>
      </div>
    </Pantalla>
  );
}
