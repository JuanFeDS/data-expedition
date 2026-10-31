import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Isla } from '../componentes/Region';
import { Contador, Pantalla, Pill } from '../componentes/ui';

interface FilaNota {
  nota: string;
  titulo: string;
  meta: string;
  bioma: string;
  chip?: { texto: string; variante: 'suave' | 'accent' | 'azul' };
  estado: 'hecha' | 'actual' | 'pendiente';
  ruta?: string;
}

const FILAS: FilaNota[] = [
  { nota: '4.2', titulo: 'Trabajo 1', meta: 'Semana 3 · calificado el 21 oct · ver rúbrica', bioma: 'costa', chip: { texto: 'Con IA', variante: 'suave' }, estado: 'hecha', ruta: '#/e4' },
  { nota: '—', titulo: 'Trabajo 2', meta: 'Semana 4 · vence el viernes 7', bioma: 'desierto', chip: { texto: 'En curso', variante: 'accent' }, estado: 'actual' },
  { nota: '—', titulo: 'Trabajo 3', meta: 'Semana 6 · se abre al entregar el Trabajo 2', bioma: 'ruinas', estado: 'pendiente' },
  { nota: '0.0', titulo: 'Taller de práctica', meta: 'No presentado · recupéralo con un trabajo adicional', bioma: 'paramo', chip: { texto: 'Recuperable', variante: 'azul' }, estado: 'hecha' },
  { nota: '—', titulo: 'Diagnóstico', meta: 'Semana 1 · fijó tu punto de partida, no cuenta para aprobar', bioma: 'selva', estado: 'hecha' },
];

export function E3Notas() {
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Notas" titulo="Tus trabajos" isla="costa">
          <div className="cifra-mundo">
            <span className="num"><Contador valor={4.2} decimales={1} /></span>
            <small>promedio hasta ahora<br />1 de 3 calificados</small>
          </div>
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo" style={{ gap: 0 }}>
          {FILAS.map((fila) => {
            const contenido = (
              <>
                <span className={`isla-mini ${fila.estado === 'pendiente' ? 'isla-mini--pendiente' : ''}`}><Isla bioma={fila.bioma} /></span>
                <div className="fila__texto">
                  <strong>{fila.titulo}</strong>
                  <span className="meta" style={{ fontSize: 12 }}>{fila.meta}</span>
                  {fila.chip && <div className="chips"><Pill variante={fila.chip.variante} pequena>{fila.chip.texto}</Pill></div>}
                </div>
                <span className={`fila__nota ${fila.estado === 'pendiente' || fila.nota === '—' ? 'fila__nota--atenuada' : ''}`} style={{ width: 'auto' }}>{fila.nota}</span>
              </>
            );
            return fila.ruta
              ? <a className="fila" key={fila.titulo} href={fila.ruta}>{contenido}</a>
              : <div className="fila" key={fila.titulo}>{contenido}</div>;
          })}
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Tu radar', texto: 'Ver cómo vas', ruta: '#/e2' }} />
    </Pantalla>
  );
}
