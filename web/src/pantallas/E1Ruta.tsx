import { Kicker, Pantalla, Pill, TabBar } from '../componentes/ui';

type Tipo = 'hecho' | 'aqui' | 'proximo' | 'cima';

interface Hito {
  x: number;
  y: number;
  tipo: Tipo;
  kicker: string;
  titulo: string;
  meta?: string;
  nota?: string;
  accion?: string;
}

const HITOS: Hito[] = [
  { x: 100, y: 478, tipo: 'hecho', kicker: 'Semana 1', titulo: 'Diagnóstico', meta: 'Punto de partida fijado' },
  { x: 280, y: 372, tipo: 'hecho', kicker: 'Semanas 2–3', titulo: 'Trabajo 1', nota: '4.2' },
  { x: 105, y: 262, tipo: 'aqui', kicker: 'Estás aquí · Semanas 4–5', titulo: 'Trabajo 2', meta: 'Modelo predictivo · vence el viernes 7', accion: 'Entregar' },
  { x: 280, y: 152, tipo: 'proximo', kicker: 'Semana 6', titulo: 'Trabajo 3', meta: 'Se abre al entregar el 2' },
  { x: 120, y: 52, tipo: 'cima', kicker: 'La cima · Semana 8', titulo: 'Proyecto final', meta: 'Misión en equipo' },
];

const tramo = (a: Hito, b: Hito) => `C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y}`;
const CURVAS: [number, number, number, number, number][] = [
  [300, 60, 45, 30, -20], [300, 60, 80, 55, -20], [300, 60, 118, 82, -20], [300, 60, 160, 112, -20],
  [40, 420, 40, 28, 25], [40, 420, 75, 52, 25], [40, 420, 112, 78, 25],
];

function Montana() {
  return (
    <svg width="64" height="62" viewBox="0 0 64 62" fill="none" aria-hidden="true">
      <polygon points="2,60 32,22 62,60" fill="#F1F8F4" />
      <polygon points="22,60 32,46 42,60" fill="#D3E5DB" />
      <line x1="32" y1="22" x2="32" y2="3" stroke="#F1F8F4" strokeWidth="3" strokeLinecap="round" />
      <polygon points="32,3 52,9 32,15" fill="#FFD23F" />
    </svg>
  );
}

export function E1Ruta() {
  const [diagnostico, trabajo1, trabajo2, trabajo3, cima] = HITOS;
  const hecho = `M ${diagnostico.x} ${diagnostico.y} ${tramo(diagnostico, trabajo1)} ${tramo(trabajo1, trabajo2)}`;
  const pendiente = `M ${trabajo2.x} ${trabajo2.y} ${tramo(trabajo2, trabajo3)} ${tramo(trabajo3, cima)}`;

  return (
    <Pantalla tono="oscura">
      <div className="pantalla__cuerpo ruta">
        <header className="ruta__cab">
          <div className="ruta__top"><span>Hola, Camila</span><Pill variante="accent">Semana 4 de 8</Pill></div>
          <h1 className="titulo" style={{ fontSize: 40, lineHeight: 1.1 }}>Tu ruta</h1>
          <p className="ruta__sub">Tramo 3 de 5 · la cima es el proyecto final</p>
        </header>
        <div className="ruta__mapa" style={{ width: 390, margin: '0 auto' }}>
          <svg width="390" height="560" viewBox="0 0 390 560" fill="none" aria-hidden="true">
            {CURVAS.map(([cx, cy, rx, ry, giro], i) => (
              <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${giro} ${cx} ${cy})`} stroke="#fff" strokeOpacity=".09" strokeWidth="1.5" />
            ))}
            <path d="M -10 428 C 120 416, 250 440, 400 424" stroke="var(--secondary)" strokeWidth="14" strokeLinecap="round" />
            <path d={pendiente} stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 11" />
            <path d={hecho} stroke="var(--mint)" strokeWidth="6" strokeLinecap="round" />
          </svg>
          {HITOS.map((hito) => {
            const derecha = hito.x < 195;
            const separacion = hito.tipo === 'aqui' ? 52 : 46;
            const izquierda = derecha ? hito.x + separacion : hito.x - separacion - 190;
            return (
              <div key={hito.titulo}>
                <div className={`nodo nodo--${hito.tipo}`} style={{ left: hito.x, top: hito.y }}>
                  {hito.tipo === 'hecho' && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" stroke="#073B3A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                  {hito.tipo === 'cima' && <Montana />}
                </div>
                <div className={`hito ${derecha ? 'hito--der' : 'hito--izq'} ${hito.tipo === 'proximo' ? 'hito--bloqueado' : ''}`} style={{ left: izquierda, top: hito.y }}>
                  <Kicker estilo={hito.tipo === 'aqui' || hito.tipo === 'cima' ? { color: 'var(--accent)' } : undefined}>{hito.kicker}</Kicker>
                  <span className="hito__titulo">{hito.titulo}</span>
                  {hito.nota && <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Pill variante="accent" pequena>{hito.nota}</Pill><span className="hito__meta">calificado</span></span>}
                  {hito.meta && <span className="hito__meta">{hito.meta}</span>}
                  {hito.accion && <a href="#/e6"><Pill variante="accent" boton>{hito.accion}</Pill></a>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <TabBar activa="Ruta" />
    </Pantalla>
  );
}
