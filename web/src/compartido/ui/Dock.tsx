import { useContext, useState } from 'react';
import { useRutaCurso } from '../estado/curso';
import { IconoSvg } from './Icono';
import { MenuHoja } from '../navegacion/Menu';
import { ModoModal, ModoRol } from './ui';
import { inicioDeRol } from '../navegacion/navegacion';

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
  const rol = useContext(ModoRol);
  const rutaCurso = useRutaCurso();
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
            <a className="dock__accion" href={rutaCurso(accion.ruta)}>
              <small>{accion.etiqueta}</small>
              <strong>{accion.texto}</strong>
            </a>
          )
        ) : (
          <a className="dock__inicio" href={inicioDeRol[rol]}>{rol === 'estudiante' ? 'Volver al campamento' : rol === 'docente' ? 'Volver al panel' : 'Volver al resumen'}</a>
        )}
      </footer>
      <MenuHoja abierta={abierto} alCerrar={() => setAbierto(false)} />
    </>
  );
}
