import { Kicker, Pantalla, Pill, TabBar } from '../componentes/ui';
import { hitosRuta, type HitoRuta } from '../datos';

function Montana({ tamano = 36 }: { tamano?: number }) {
  return (
    <svg width={tamano} height={(tamano * 62) / 64} viewBox="0 0 64 62" fill="none" aria-hidden="true">
      <polygon points="2,60 32,22 62,60" fill="#F1F8F4" />
      <polygon points="22,60 32,46 42,60" fill="#D3E5DB" />
      <line x1="32" y1="22" x2="32" y2="3" stroke="#F1F8F4" strokeWidth="3" strokeLinecap="round" />
      <polygon points="32,3 52,9 32,15" fill="#FFD23F" />
    </svg>
  );
}

function Candado() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" fill="#A8C7BE" />
      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#A8C7BE" strokeWidth="1.6" />
    </svg>
  );
}

function Nodo({ hito }: { hito: HitoRuta }) {
  if (hito.estado === 'cima') return <span className="paso__nodo paso__nodo--cima"><Montana /></span>;
  if (hito.estado === 'hecho') {
    return (
      <span className="paso__nodo paso__nodo--hecho">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" stroke="#073B3A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  }
  if (hito.estado === 'actual') return <span className="paso__nodo paso__nodo--aqui" />;
  return <span className="paso__nodo paso__nodo--bloqueado"><Candado /></span>;
}

export function E1Ruta() {
  const total = hitosRuta.length;
  const indiceActual = hitosRuta.findIndex((hito) => hito.estado === 'actual');
  const mostrados = [...hitosRuta].reverse();

  return (
    <Pantalla tono="oscura">
      <div className="pantalla__cuerpo ruta">
        <header className="ruta__cab">
          <div className="ruta__top"><span>Hola, Camila</span><Pill variante="accent">Semana 4 de 8</Pill></div>
          <h1 className="titulo" style={{ fontSize: 40, lineHeight: 1.1 }}>Tu ruta</h1>
          <div className="tramos" aria-hidden="true">
            {hitosRuta.map((hito, indice) => (
              <i key={hito.titulo} className={indice < indiceActual ? 'tramos__hecho' : indice === indiceActual ? 'tramos__actual' : ''} />
            ))}
          </div>
          <p className="ruta__sub">Tramo {indiceActual + 1} de {total} · la cima es el proyecto final</p>
        </header>
        <ol className="itinerario">
          {mostrados.map((hito, indice) => {
            const clases = ['paso', `paso--${hito.estado}`, indice === 0 && 'paso--primero', indice === mostrados.length - 1 && 'paso--ultimo'].filter(Boolean).join(' ');
            return (
              <li key={hito.titulo} className={clases}>
                <Nodo hito={hito} />
                <div className="paso__texto">
                  <Kicker>{hito.kicker}</Kicker>
                  <span className="paso__titulo">{hito.titulo}</span>
                  {hito.nota && <span className="paso__nota"><Pill variante="accent" pequena>{hito.nota}</Pill> calificado</span>}
                  {hito.meta && <span className="paso__meta">{hito.meta}</span>}
                  {hito.accion && <a className="paso__accion" href={hito.accion.ruta}><Pill variante="deep" grande>{hito.accion.texto}</Pill></a>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <TabBar activa="Ruta" />
    </Pantalla>
  );
}
