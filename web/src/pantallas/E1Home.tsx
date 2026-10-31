import { Jaguar } from '../componentes/Jaguar';
import { Contador, Kicker, Pantalla, Pill, TabBar } from '../componentes/ui';

type Icono = 'votar' | 'resumen' | 'equipo' | 'perfil';

function IconoAcceso({ tipo }: { tipo: Icono }) {
  const trazo = { stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      {tipo === 'votar' && <><rect x="4" y="4" width="16" height="16" rx="3" {...trazo} /><path d="M8 12.5 11 15.5 16.5 9" {...trazo} /></>}
      {tipo === 'resumen' && <><path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" {...trazo} /><path d="M9 13h6M9 17h4" {...trazo} /></>}
      {tipo === 'equipo' && <><circle cx="9" cy="9" r="3" {...trazo} /><circle cx="17" cy="10" r="2.4" {...trazo} /><path d="M3.5 19c.5-3 2.7-4.5 5.5-4.5s5 1.5 5.5 4.5M15.5 14.8c2.6-.2 4.5 1 5 3.7" {...trazo} /></>}
      {tipo === 'perfil' && <><circle cx="12" cy="8.5" r="3.5" {...trazo} /><path d="M5 20c.7-3.6 3.4-5.5 7-5.5s6.3 1.9 7 5.5" {...trazo} /></>}
    </svg>
  );
}

const ACCESOS: { tipo: Icono; etiqueta: string; ruta: string; color: string; aviso?: string }[] = [
  { tipo: 'votar', etiqueta: 'Votación', ruta: '#/e9', color: 'accent', aviso: '1' },
  { tipo: 'resumen', etiqueta: 'Resumen', ruta: '#/e11', color: 'mint', aviso: '•' },
  { tipo: 'equipo', etiqueta: 'Equipo', ruta: '#/e10', color: 'azul' },
  { tipo: 'perfil', etiqueta: 'Perfil', ruta: '#/e12', color: 'claro' },
];

function Campamento() {
  return (
    <svg className="camp__escena" width="390" height="300" viewBox="0 0 390 300" fill="none" aria-hidden="true">
      <polygon points="-10,250 70,150 130,215 200,120 290,235 330,185 400,250" fill="#0B4A47" />
      <polygon points="-10,270 90,195 170,250 250,175 330,250 400,215 400,300 -10,300" fill="#0F5A52" />
      <path d="M-10 262 Q100 244 200 258 T400 250 V300 H-10Z" fill="#0A6B52" />
      <g className="camp__tienda">
        <polygon points="255,262 300,196 345,262" fill="#F1F8F4" />
        <polygon points="290,262 300,236 310,262" fill="#073B3A" />
        <polygon points="300,196 300,262 255,262" fill="#D3E5DB" />
        <line x1="300" y1="196" x2="300" y2="182" stroke="#F1F8F4" strokeWidth="3" strokeLinecap="round" />
        <polygon points="300,182 318,187 300,192" fill="#FFD23F" />
      </g>
      <g className="camp__fuego">
        <path d="M205 262c-12-10-6-24 0-34 3 8 12 12 10 24 3-3 5-6 5-10 8 9 3 19-3 20Z" fill="#FFD23F" />
        <path d="M207 262c-6-5-3-12 0-17 2 4 6 6 5 12Z" fill="#F1F8F4" />
      </g>
      <rect x="190" y="261" width="34" height="6" rx="3" fill="#073B3A" />
    </svg>
  );
}

export function E1Home() {
  return (
    <Pantalla tono="oscura">
      <div className="pantalla__cuerpo camp">
        <header className="camp__hud">
          <span className="avatar avatar--verde">CR</span>
          <div className="camp__nombre"><strong>Camila</strong><span>Rol: Analista</span></div>
          <span className="camp__xp"><Contador valor={340} /> XP</span>
          <Pill variante="accent">Semana 4 de 8</Pill>
        </header>

        <div className="camp__zona">
          <Campamento />
          <Jaguar pose="guia" ancho={158} clase="camp__guia" />
          <p className="camp__globo">Una entrega más y ves la cima.</p>
          <nav className="camp__accesos" aria-label="Accesos rápidos">
            {ACCESOS.map((acceso) => (
              <a key={acceso.etiqueta} href={acceso.ruta} className="acceso-rapido">
                <span className={`acceso-rapido__icono acceso-rapido__icono--${acceso.color}`}>
                  <IconoAcceso tipo={acceso.tipo} />
                  {acceso.aviso && <i className="acceso-rapido__aviso">{acceso.aviso}</i>}
                </span>
                <span>{acceso.etiqueta}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="camp__cifras">
          <div><span className="num"><Contador valor={40} />%</span><small>del camino</small></div>
          <div><span className="num"><Contador valor={4.2} decimales={1} /></span><small>promedio</small></div>
          <div><span className="num">+6</span><small>dimensiones</small></div>
        </div>

        <section className="camp__siguiente">
          <Kicker estilo={{ color: 'var(--deep)' }}>Tu siguiente paso · vence vie 7</Kicker>
          <h2 className="titulo">Entrega el Trabajo 2</h2>
          <p>Modelo predictivo. Declara si usaste IA y cuéntanos cómo lo hiciste.</p>
          <a href="#/e6"><Pill variante="deep" grande>Entregar</Pill></a>
        </section>
      </div>
      <TabBar activa="Inicio" />
    </Pantalla>
  );
}
