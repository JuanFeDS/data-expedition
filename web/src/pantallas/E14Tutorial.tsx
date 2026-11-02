import { Jaguar } from '../componentes/Jaguar';
import { IconoSvg } from '../componentes/Icono';
import { Kicker, Pantalla, Pill } from '../componentes/ui';
import { pasosTutorial } from '../datos';

export function E14Tutorial() {
  return (
    <Pantalla tono="oscura" clase="p-tutorial">
      <div className="pantalla__cuerpo">
        <header className="tutorial__cab">
          <a className="cerrar-practica" href="#/home" style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--mint)', justifyContent: 'flex-start' }}>‹ Inicio</a>
          <Kicker estilo={{ color: 'var(--mint)' }}>Tutorial</Kicker>
          <h1 className="titulo" style={{ fontSize: 'var(--fs-3xl)', lineHeight: 1.05, maxWidth: 220 }}>Así se usa la expedición</h1>
          <Jaguar pose="saluda" ancho={120} clase="tutorial__guia" />
          <img className="tutorial__linterna" src={`${import.meta.env.BASE_URL}objetos/linterna.webp`} alt="" />
        </header>
        <ol className="tutorial__lista">
          {pasosTutorial.map((paso, indice) => (
            <li className="tutorial__paso" key={paso.titulo} style={{ '--i': indice } as React.CSSProperties}>
              <span className="tutorial__icono"><IconoSvg tipo={paso.icono} /></span>
              <div>
                <strong className="titulo">{paso.titulo}</strong>
                <p>{paso.texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <a href="#/home" className="tutorial__fin"><Pill variante="accent" grande>Entendido, a la expedición</Pill></a>
      </div>
    </Pantalla>
  );
}
