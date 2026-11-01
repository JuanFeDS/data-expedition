import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { Isla } from '../componentes/Region';
import { Kicker, Pantalla } from '../componentes/ui';
import { dificultadPara, dimensiones, gemasGanadas, paginasAlbum, rachaPractica, temaDeRepaso } from '../datos';

const FOTOS_POR_PAGINA = 6;
const GIROS = [-2.4, 1.8, -1.2, 2.6, -1.9, 1.4];

export function E15Practicar() {
  const paginas = gemasGanadas.map((gema) => ({ gema, pagina: paginasAlbum.find((candidata) => candidata.gema === gema.gema)! }));
  const [actual, setActual] = useState(Math.max(0, paginas.findIndex((item) => item.gema.gema === temaDeRepaso().gema.gema)));
  const { gema, pagina } = paginas[actual];
  const valor = dimensiones.find((dimension) => dimension.nombre === gema.dimension)?.ahora ?? 0;
  const dificultad = dificultadPara(valor);
  const completa = pagina.reveladas >= FOTOS_POR_PAGINA;
  const racha = rachaPractica.hechos.filter(Boolean).length;
  const cumplida = rachaPractica.sesionesHoy >= rachaPractica.metaHoy;
  const totalReveladas = paginas.reduce((suma, item) => suma + item.pagina.reveladas, 0);

  return (
    <Pantalla clase="p-e15">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Tu álbum de la expedición" titulo="Practicar" subtitulo="Cada sesión de 5 preguntas revela una foto nueva." objeto="binoculares">
          <p className="radar__resumen"><strong>{totalReveladas} de {paginas.length * FOTOS_POR_PAGINA}</strong> fotos reveladas</p>
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo album">
          <section className="album__racha" aria-label="Racha de práctica">
            <div className="album__racha-cifra">
              <span className="num">{racha}</span>
              <small>días seguidos<br />{cumplida ? '¡Meta de hoy cumplida!' : `Practica hoy y llegas a ${racha + 1}`}</small>
            </div>
            <ol className="album__dias">
              {rachaPractica.dias.map((dia, indice) => {
                const hecho = rachaPractica.hechos[indice];
                const hoy = indice === rachaPractica.hoy;
                return (
                  <li key={`${dia}${indice}`} className={`${hecho ? 'hecho' : ''} ${hoy ? 'hoy' : ''}`} aria-label={`${dia}${hecho ? ', practicado' : hoy ? ', hoy' : ''}`}>
                    <b>{hecho ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.4 6.6 11.5 12.5 4.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}</b>
                    <span>{dia}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <nav className="album__paginas" aria-label="Páginas del álbum">
            <Kicker>Páginas</Kicker>
            <div className="album__lista">
              {paginas.map((item, indice) => (
                <button key={item.gema.gema} className="album__pestana" aria-pressed={indice === actual} onClick={() => setActual(indice)}>
                  <img src={`${import.meta.env.BASE_URL}gemas/${item.gema.gema}.webp`} alt="" />
                  <span><strong>{item.gema.dimension}</strong><small>{item.pagina.reveladas}/{FOTOS_POR_PAGINA}</small></span>
                </button>
              ))}
            </div>
          </nav>

          <section className="album__pagina" key={gema.gema} aria-label={`Página de ${gema.dimension}`}>
            <header className="album__cabeza">
              <img src={`${import.meta.env.BASE_URL}gemas/${gema.gema}.webp`} alt="" />
              <div>
                <Kicker>Página {actual + 1} · dificultad {dificultad}</Kicker>
                <h2 className="titulo">{gema.nombre}</h2>
                <p className="meta">{gema.dimension} · {completa ? 'página completa' : `${pagina.reveladas} de ${FOTOS_POR_PAGINA} fotos`}</p>
              </div>
            </header>
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
          </section>
        </div>
      </div>
      <Dock accion={{ etiqueta: completa ? 'Página completa' : `Foto ${pagina.reveladas + 1} de ${FOTOS_POR_PAGINA}`, texto: completa ? 'Repasar este tema' : `Practicar ${gema.dimension}`, ruta: '#/e7' }} />
    </Pantalla>
  );
}
