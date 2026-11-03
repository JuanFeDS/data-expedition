import { Isla } from '../../../compartido/ui/Region';
import { Jaguar } from '../../../compartido/ui/Jaguar';
import { Hoja, Kicker, Pill } from '../../../compartido/ui/ui';
import { albumDeIsla, dificultadPara, dimensiones, nivelDePulido, type PaginaAlbum } from '../../../demo/datos';

export const FOTOS_POR_PAGINA = 6;
const GIROS = [-2.4, 1.8, -1.2, 2.6, -1.9, 1.4];

export const fotosReveladas = (nombreIsla: string) => albumDeIsla(nombreIsla)?.pagina.reveladas ?? 0;

function Fotos({ pagina, dificultad }: { pagina: PaginaAlbum; dificultad: string }) {
  return (
    <ol className="album__fotos">
      {pagina.fotos.map((foto, indice) => {
        const estado = indice < pagina.reveladas ? 'revelada' : indice === pagina.reveladas ? 'siguiente' : 'oculta';
        return (
          <li key={foto.pie} className={`foto foto--${estado}`} style={{ '--i': indice, '--giro': `${GIROS[indice]}deg` } as React.CSSProperties}>
            <div className="foto__marco">
              {estado === 'revelada' ? (
                <div className={`foto__imagen foto__imagen--${dificultad}`}>
                  <span className="foto__isla"><Isla bioma={pagina.bioma} /></span>
                  <Jaguar pose={foto.jaguar} ancho={64} clase="foto__jaguar" />
                  <img className="foto__objeto" src={`${import.meta.env.BASE_URL}objetos/${foto.objeto}.webp`} alt="" />
                </div>
              ) : (
                <div className="foto__imagen foto__imagen--vacia">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1-1.6h6.6l1 1.6h1.2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  {estado === 'siguiente' && <small>Siguiente</small>}
                </div>
              )}
              <p>{estado === 'revelada' ? foto.pie : estado === 'siguiente' ? 'Sin revelar' : 'Por llegar'}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function AlbumIsla({ nombreIsla, ganada }: { nombreIsla: string; ganada: boolean }) {
  const album = albumDeIsla(nombreIsla);
  if (!album) return null;
  const { gema, pagina } = album;
  const valor = dimensiones.find((dimension) => dimension.nombre === gema.dimension)?.ahora ?? 0;
  const dificultad = dificultadPara(valor);
  const completa = pagina.reveladas >= FOTOS_POR_PAGINA;
  return (
    <section className="album__pagina album__pagina--isla" aria-label={`Álbum de ${nombreIsla}`}>
      <header className="album__cabeza">
        <img src={`${import.meta.env.BASE_URL}gemas/${gema.gema}.webp`} alt="" />
        <div>
          <Kicker>Álbum · {gema.islaCorta} · dificultad {dificultad}</Kicker>
          <h2 className="titulo">{gema.nombre}</h2>
          <p className="meta">{gema.dimension} · {ganada ? `${nivelDePulido(valor)} ${valor}` : 'gema por ganar al cerrar la isla'} · {completa ? 'álbum completo' : `${pagina.reveladas} de ${FOTOS_POR_PAGINA} fotos`}</p>
        </div>
      </header>
      <Fotos pagina={pagina} dificultad={dificultad} />
      <a className="album__repasar" href="#/e7"><Pill variante="deep" grande>{completa ? 'Repasar este tema' : `Revelar la foto ${pagina.reveladas + 1}`}</Pill></a>
    </section>
  );
}

interface PropsModalAlbum {
  nombreIsla: string | null;
  ganada: boolean;
  alCerrar: () => void;
}

export function ModalAlbum({ nombreIsla, ganada, alCerrar }: PropsModalAlbum) {
  return (
    <Hoja abierta={nombreIsla !== null} alCerrar={alCerrar} titulo={`Álbum de ${nombreIsla ?? ''}`} clase="hoja--pantalla hoja--album">
      {nombreIsla && <AlbumIsla nombreIsla={nombreIsla} ganada={ganada} />}
    </Hoja>
  );
}
