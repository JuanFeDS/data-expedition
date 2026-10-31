import { useState } from 'react';
import { IconoSvg } from './Icono';
import { MenuHoja } from './Menu';

interface AccionDock {
  etiqueta: string;
  texto: string;
  ruta: string;
}

export function Dock({ accion }: { accion?: AccionDock }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <footer className="dock">
        <button className="dock__menu" onClick={() => setAbierto(true)} aria-label="Abrir menú"><IconoSvg tipo="menu" tamano={26} /></button>
        {accion ? (
          <a className="dock__accion" href={accion.ruta}>
            <small>{accion.etiqueta}</small>
            <strong>{accion.texto}</strong>
          </a>
        ) : (
          <a className="dock__inicio" href="#/home">Volver al campamento</a>
        )}
      </footer>
      <MenuHoja abierta={abierto} alCerrar={() => setAbierto(false)} />
    </>
  );
}
