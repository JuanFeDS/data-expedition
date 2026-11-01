import { IconoSvg, type Icono } from './Icono';
import { Jaguar } from './Jaguar';

interface Enlace {
  tipo: Icono;
  etiqueta: string;
  ruta: string;
  activa: string[];
  aviso?: string;
}

const EXPLORAR: Enlace[] = [
  { tipo: 'inicio', etiqueta: 'Inicio', ruta: '#/home', activa: ['home'] },
  { tipo: 'ruta', etiqueta: 'Mapa del curso', ruta: '#/e1', activa: ['e1'] },
  { tipo: 'radar', etiqueta: 'Radar', ruta: '#/e2', activa: ['e2'] },
  { tipo: 'notas', etiqueta: 'Notas', ruta: '#/e3', activa: ['e3', 'e4'] },
  { tipo: 'entregas', etiqueta: 'Entregas', ruta: '#/e5', activa: ['e5', 'e6'] },
  { tipo: 'leccion', etiqueta: 'Practicar', ruta: '#/e15', activa: ['e15', 'e7', 'e8'] },
];

const GRUPO: Enlace[] = [
  { tipo: 'votar', etiqueta: 'Votación', ruta: '#/e9', activa: ['e9', 'e13'], aviso: '1' },
  { tipo: 'equipo', etiqueta: 'Misión en equipo', ruta: '#/e10', activa: ['e10'] },
  { tipo: 'resumen', etiqueta: 'Resumen semanal', ruta: '#/e11', activa: ['e11'], aviso: '•' },
];

const AYUDA: Enlace[] = [{ tipo: 'ayuda', etiqueta: 'Tutorial', ruta: '#/tutorial', activa: ['tutorial'] }];

function Grupo({ titulo, enlaces, ruta }: { titulo: string; enlaces: Enlace[]; ruta: string }) {
  return (
    <div className="lateral__grupo">
      <span className="lateral__titulo">{titulo}</span>
      {enlaces.map((enlace) => (
        <a key={enlace.etiqueta} className="lateral__enlace" href={enlace.ruta} aria-current={enlace.activa.includes(ruta) ? 'page' : undefined}>
          <span className="lateral__icono"><IconoSvg tipo={enlace.tipo} /></span>
          <span>{enlace.etiqueta}</span>
          {enlace.aviso && <i className="lateral__aviso">{enlace.aviso}</i>}
        </a>
      ))}
    </div>
  );
}

export function BarraLateral({ ruta }: { ruta: string }) {
  return (
    <aside className="barra-lateral" aria-label="Navegación principal">
      <a className="lateral__marca" href="#/home">
        <Jaguar pose="guia" ancho={44} />
        <span>data-<br />expedicion</span>
      </a>
      <span className="lateral__semana">Semana 4 de 8</span>
      <nav className="lateral__nav">
        <Grupo titulo="Explorar" enlaces={EXPLORAR} ruta={ruta} />
        <Grupo titulo="Mi grupo" enlaces={GRUPO} ruta={ruta} />
        <Grupo titulo="Ayuda" enlaces={AYUDA} ruta={ruta} />
      </nav>
      <a className="lateral__usuario" href="#/e12" aria-current={ruta === 'e12' ? 'page' : undefined}>
        <span className="avatar avatar--verde">CR</span>
        <span className="lateral__datos"><strong>Camilo</strong><small>Rol: Analista · 340 XP</small></span>
      </a>
    </aside>
  );
}
