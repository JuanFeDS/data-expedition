import { useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { Isla } from '../../../compartido/ui/Region';
import { Pantalla, Pill } from '../../../compartido/ui/ui';

type Modo = 'colaborativo' | 'competitivo';

const VOTOS = 14;
const GRUPO = 22;

function Podio({ activo }: { activo: boolean }) {
  const base = activo ? '#fff' : '#1F6BFF';
  const opacidad = activo ? [0.55, 1, 0.4] : [0.55, 1, 0.35];
  return (
    <svg className="voto__dibujo" viewBox="0 0 120 64" fill="none" aria-hidden="true">
      <rect x="6" y="30" width="32" height="34" rx="6" fill={base} fillOpacity={opacidad[0]} />
      <rect x="44" y="10" width="32" height="54" rx="6" fill={activo ? '#FFD23F' : '#1F6BFF'} fillOpacity={opacidad[1]} />
      <rect x="82" y="40" width="32" height="24" rx="6" fill={base} fillOpacity={opacidad[2]} />
      <text x="22" y="52" textAnchor="middle" fontSize="16" fontWeight="800" fill={activo ? '#0B2A24' : '#fff'}>2</text>
      <text x="60" y="42" textAnchor="middle" fontSize="20" fontWeight="800" fill={activo ? '#0B2A24' : '#fff'}>1</text>
      <text x="98" y="58" textAnchor="middle" fontSize="14" fontWeight="800" fill={activo ? '#0B2A24' : '#fff'}>3</text>
    </svg>
  );
}

export function E9Votacion() {
  const [voto, setVoto] = useState<Modo>('colaborativo');
  return (
    <Pantalla clase="p-e9">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Módulo 2 · votación del grupo" titulo="¿Cómo quieren jugar?" subtitulo="Las mismas misiones; cambia cómo se puntúa. Tu voto es anónimo." objeto="urna" />
        <div className="contenido cuerpo-mundo" style={{ gap: 12 }}>
          <button className="voto voto--verde" aria-pressed={voto === 'colaborativo'} onClick={() => setVoto('colaborativo')}>
            <span className="voto__cabeza">
              <strong className="titulo" style={{ fontSize: 'var(--fs-2xl)' }}>Colaborativo</strong>
              {voto === 'colaborativo' && <Pill variante="accent">Tu voto</Pill>}
            </span>
            <span className="voto__desc">Metas de grupo: sumamos todos hacia una meta común del módulo.</span>
            <span className="voto__islas" aria-hidden="true"><Isla bioma="selva" /><Isla bioma="paramo" /><Isla bioma="costa" /></span>
            <span className="voto__detalle">Barra de meta compartida · sin ranking</span>
          </button>
          <button className="voto voto--azul" aria-pressed={voto === 'competitivo'} onClick={() => setVoto('competitivo')}>
            <span className="voto__cabeza">
              <strong className="titulo" style={{ fontSize: 'var(--fs-2xl)' }}>Competitivo</strong>
              {voto === 'competitivo' && <Pill variante="accent">Tu voto</Pill>}
            </span>
            <span className="voto__desc">Ligas pequeñas armadas por nivel del diagnóstico. Compites con quienes están cerca de ti.</span>
            <Podio activo={voto === 'competitivo'} />
            <span className="voto__detalle">Ligas de 6 · sin tabla global</span>
          </button>
          <div className="participacion">
            <strong>{VOTOS} de {GRUPO} ya votaron</strong>
            <div className="votantes" aria-hidden="true">
              {Array.from({ length: GRUPO }, (_, i) => <i key={i} className={i < VOTOS ? 'ya' : ''} />)}
            </div>
            <p className="meta" style={{ fontSize: 'var(--fs-xs)' }}>Los resultados se muestran al cerrar la votación. Puedes cambiar tu voto hasta entonces. Se repite en cada módulo.</p>
          </div>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
