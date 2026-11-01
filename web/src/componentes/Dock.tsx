import { useContext, useState } from 'react';
import { IconoSvg } from './Icono';
import { MenuHoja } from './Menu';
import { ModoModal } from './ui';

interface AccionDock {
  etiqueta: string;
  texto: string;
  ruta?: string;
  alPulsar?: () => void;
  deshabilitada?: boolean;
}

export function Dock({ accion }: { accion?: AccionDock }) {
  const [abierto, setAbierto] = useState(false);
  const modal = useContext(ModoModal);
  if (modal) return null;
  return (
    <>
      <footer className="dock">
        <button className="dock__menu" onClick={() => setAbierto(true)} aria-label="Abrir menú"><IconoSvg tipo="menu" tamano={26} /></button>
        {accion ? (
          accion.alPulsar ? (
            <button className="dock__accion" onClick={accion.alPulsar} disabled={accion.deshabilitada} key={accion.texto}>
              <small>{accion.etiqueta}</small>
              <strong>{accion.texto}</strong>
            </button>
          ) : (
            <a className="dock__accion" href={accion.ruta}>
              <small>{accion.etiqueta}</small>
              <strong>{accion.texto}</strong>
            </a>
          )
        ) : (
          <a className="dock__inicio" href="#/home">Volver al campamento</a>
        )}
      </footer>
      <MenuHoja abierta={abierto} alCerrar={() => setAbierto(false)} />
    </>
  );
}
