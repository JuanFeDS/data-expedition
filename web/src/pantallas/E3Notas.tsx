import { Kicker, Pantalla, Pill, TabBar } from '../componentes/ui';

interface FilaNota {
  nota: string;
  titulo: string;
  meta: string;
  chip?: { texto: string; variante: 'suave' | 'accent' | 'azul' };
  atenuada?: boolean;
  ruta?: string;
}

const FILAS: FilaNota[] = [
  { nota: '4.2', titulo: 'Trabajo 1', meta: 'Calificado el 21 oct · ver rúbrica', chip: { texto: 'Con IA', variante: 'suave' }, ruta: '#/e4' },
  { nota: '—', titulo: 'Trabajo 2', meta: 'Modelo predictivo · vence el viernes 7', chip: { texto: 'Pendiente', variante: 'accent' }, atenuada: true },
  { nota: '—', titulo: 'Trabajo 3', meta: 'Se abre al entregar el Trabajo 2', atenuada: true },
  { nota: '0.0', titulo: 'Taller de práctica', meta: 'No presentado · recupéralo con un trabajo adicional', chip: { texto: 'Recuperable', variante: 'azul' }, atenuada: true },
  { nota: '—', titulo: 'Diagnóstico', meta: 'Fijó tu punto de partida · no cuenta para aprobar', atenuada: true },
];

export function E3Notas() {
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <header className="banda banda--verde" style={{ gap: 2 }}>
          <Kicker>Notas</Kicker>
          <div className="promedio">
            <span className="num">4.2</span>
            <div><strong style={{ fontSize: 14 }}>promedio hasta ahora</strong><div className="meta" style={{ color: 'inherit', opacity: .8, fontSize: 12 }}>1 de 3 trabajos calificados</div></div>
          </div>
        </header>
        <div className="contenido" style={{ paddingTop: 12 }}>
          {FILAS.map((fila) => {
            const contenido = (
              <>
                <span className={`fila__nota ${fila.atenuada ? 'fila__nota--atenuada' : ''}`}>{fila.nota}</span>
                <div className="fila__texto">
                  <strong>{fila.titulo}</strong>
                  <span className="meta" style={{ fontSize: 12 }}>{fila.meta}</span>
                  {fila.chip && <div className="chips"><Pill variante={fila.chip.variante} pequena>{fila.chip.texto}</Pill></div>}
                </div>
              </>
            );
            return fila.ruta
              ? <a className="fila" key={fila.titulo} href={fila.ruta} style={{ gap: 16 }}>{contenido}</a>
              : <div className="fila" key={fila.titulo} style={{ gap: 16 }}>{contenido}</div>;
          })}
        </div>
      </div>
      <TabBar activa="Notas" />
    </Pantalla>
  );
}
