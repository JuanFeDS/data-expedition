import { useState } from 'react';
import { Jaguar } from '../componentes/Jaguar';
import { Contador, Hoja, Kicker, Pantalla, Pill } from '../componentes/ui';

type Icono = 'votar' | 'resumen' | 'equipo' | 'perfil' | 'ruta' | 'radar' | 'notas' | 'entregas' | 'leccion' | 'menu';

function IconoSvg({ tipo, tamano = 24 }: { tipo: Icono; tamano?: number }) {
  const t = { stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" aria-hidden="true">
      {tipo === 'votar' && <><rect x="4" y="4" width="16" height="16" rx="3" {...t} /><path d="M8 12.5 11 15.5 16.5 9" {...t} /></>}
      {tipo === 'resumen' && <><path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" {...t} /><path d="M9 13h6M9 17h4" {...t} /></>}
      {tipo === 'equipo' && <><circle cx="9" cy="9" r="3" {...t} /><circle cx="17" cy="10" r="2.4" {...t} /><path d="M3.5 19c.5-3 2.7-4.5 5.5-4.5s5 1.5 5.5 4.5M15.5 14.8c2.6-.2 4.5 1 5 3.7" {...t} /></>}
      {tipo === 'perfil' && <><circle cx="12" cy="8.5" r="3.5" {...t} /><path d="M5 20c.7-3.6 3.4-5.5 7-5.5s6.3 1.9 7 5.5" {...t} /></>}
      {tipo === 'ruta' && <><circle cx="6" cy="18" r="2.2" {...t} /><circle cx="18" cy="6" r="2.2" {...t} /><path d="M8 17c6 0 2-9 8-10.5" {...t} strokeDasharray="1 3.4" /></>}
      {tipo === 'radar' && <path d="M12 3.5 19.5 9l-2.9 9H7.4L4.5 9 12 3.5Z" {...t} />}
      {tipo === 'notas' && <><path d="M5 20V10M12 20V4M19 20v-7" {...t} /></>}
      {tipo === 'entregas' && <><path d="M12 15V4M8 8l4-4 4 4" {...t} /><path d="M5 15v4h14v-4" {...t} /></>}
      {tipo === 'leccion' && <path d="M13 3 5 13.5h6L10 21l9-11h-6.5L13 3Z" {...t} />}
      {tipo === 'menu' && <><rect x="4" y="4" width="6.5" height="6.5" rx="1.8" {...t} /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" {...t} /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" {...t} /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" {...t} /></>}
    </svg>
  );
}

const ACCESOS: { tipo: Icono; etiqueta: string; ruta: string; color: string; aviso?: string }[] = [
  { tipo: 'votar', etiqueta: 'Votación', ruta: '#/e9', color: 'accent', aviso: '1' },
  { tipo: 'resumen', etiqueta: 'Resumen', ruta: '#/e11', color: 'mint', aviso: '•' },
  { tipo: 'equipo', etiqueta: 'Equipo', ruta: '#/e10', color: 'azul' },
  { tipo: 'perfil', etiqueta: 'Perfil', ruta: '#/e12', color: 'claro' },
];

const MENU: { tipo: Icono; etiqueta: string; detalle: string; ruta: string; color: string }[] = [
  { tipo: 'ruta', etiqueta: 'Ruta', detalle: 'Tu recorrido por el curso', ruta: '#/e1', color: 'mint' },
  { tipo: 'radar', etiqueta: 'Radar', detalle: 'Cómo vas frente a tu punto de partida', ruta: '#/e2', color: 'accent' },
  { tipo: 'notas', etiqueta: 'Notas', detalle: 'Tus trabajos y retroalimentación', ruta: '#/e3', color: 'azul' },
  { tipo: 'entregas', etiqueta: 'Entregas', detalle: 'Pendientes y entregadas', ruta: '#/e5', color: 'mint' },
  { tipo: 'leccion', etiqueta: 'Lección del día', detalle: '5 minutos de práctica', ruta: '#/e7', color: 'accent' },
];

const PASOS = ['Declara si usaste IA (con o sin IA).', 'Si usaste IA, cuenta tu bitácora: qué pediste, qué aceptaste y qué descartaste.', 'Responde las preguntas de decisión del trabajo.'];

export function E1Home() {
  const [hoja, setHoja] = useState<'paso' | 'menu' | null>(null);
  const cerrar = () => setHoja(null);
  return (
    <Pantalla tono="oscura">
      <div className="pantalla__cuerpo camp">
        <header className="camp__hud">
          <span className="avatar avatar--verde">CR</span>
          <div className="camp__nombre"><strong>Camila</strong><span>Rol: Analista</span></div>
          <span className="camp__xp"><Contador valor={340} /> XP</span>
          <Pill variante="accent">Semana 4 de 8</Pill>
        </header>

        <div className="camp__cifras">
          <div><span className="num"><Contador valor={40} />%</span><small>del camino</small></div>
          <div><span className="num"><Contador valor={4.2} decimales={1} /></span><small>promedio</small></div>
          <div><span className="num">+6</span><small>dimensiones</small></div>
        </div>

        <div className="camp__zona">
          <Jaguar pose="guia" ancho={200} clase="camp__guia" />
          <p className="camp__globo">Una entrega más y ves la cima.</p>
          <nav className="camp__accesos" aria-label="Accesos rápidos">
            {ACCESOS.map((acceso) => (
              <a key={acceso.etiqueta} href={acceso.ruta} className="acceso-rapido">
                <span className={`acceso-rapido__icono acceso-rapido__icono--${acceso.color}`}>
                  <IconoSvg tipo={acceso.tipo} />
                  {acceso.aviso && <i className="acceso-rapido__aviso">{acceso.aviso}</i>}
                </span>
                <span>{acceso.etiqueta}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="camp__dock">
          <button className="camp__menu" onClick={() => setHoja('menu')} aria-label="Abrir menú"><IconoSvg tipo="menu" tamano={26} /></button>
          <button className="camp__paso" onClick={() => setHoja('paso')}>
            <small>Siguiente paso · vence vie 7</small>
            <strong>Entregar Trabajo 2</strong>
          </button>
        </div>
      </div>

      <Hoja abierta={hoja === 'paso'} alCerrar={cerrar} titulo="Siguiente paso">
        <Kicker>Tu siguiente paso · semanas 4–5</Kicker>
        <div className="hoja__cabeza">
          <h2 className="titulo">Entrega el Trabajo 2</h2>
          <span className="hoja__fecha"><small>VIE</small><b>7</b></span>
        </div>
        <p className="meta">Modelo predictivo. Te quedan 3 días.</p>
        <ol className="hoja__pasos">{PASOS.map((paso) => <li key={paso}>{paso}</li>)}</ol>
        <a href="#/e6"><Pill variante="deep" grande>Empezar la entrega</Pill></a>
      </Hoja>

      <Hoja abierta={hoja === 'menu'} alCerrar={cerrar} titulo="Menú">
        <Kicker>Explorar</Kicker>
        <nav className="hoja__menu">
          {MENU.map((opcion) => (
            <a key={opcion.etiqueta} href={opcion.ruta} className="menu-fila">
              <span className={`acceso-rapido__icono acceso-rapido__icono--${opcion.color}`}><IconoSvg tipo={opcion.tipo} /></span>
              <span className="menu-fila__texto"><strong>{opcion.etiqueta}</strong><small>{opcion.detalle}</small></span>
              <span aria-hidden="true">›</span>
            </a>
          ))}
        </nav>
      </Hoja>
    </Pantalla>
  );
}
