import { useContext } from 'react';
import { IconoSvg } from './Icono';
import { NAVEGACION, type Rol } from './navegacion';
import { InterruptorSonido, InterruptorTema } from './tema';
import { Hoja, Kicker, ModoRol } from './ui';

export const OPCIONES_MENU = (rol: Rol) => NAVEGACION[rol].flatMap((grupo) => grupo.enlaces);

export function MenuHoja({ abierta, alCerrar, omitir }: { abierta: boolean; alCerrar: () => void; omitir?: string }) {
  const rol = useContext(ModoRol);
  return (
    <Hoja abierta={abierta} alCerrar={alCerrar} titulo="Menú">
      <Kicker>{rol === 'estudiante' ? 'Explorar' : rol === 'docente' ? 'Panel del docente' : 'Observación'}</Kicker>
      <nav className="hoja__menu">
        {OPCIONES_MENU(rol).filter((opcion) => opcion.ruta !== omitir).map((opcion) => (
          <a key={opcion.etiqueta} href={opcion.ruta} className="menu-fila">
            <span className={`acceso-rapido__icono acceso-rapido__icono--${opcion.color}`}><IconoSvg tipo={opcion.tipo} /></span>
            <span className="menu-fila__texto"><strong>{opcion.etiqueta}</strong><small>{opcion.detalle}</small></span>
            <span aria-hidden="true">›</span>
          </a>
        ))}
      </nav>
      <div className="menu__ajustes"><InterruptorTema /><InterruptorSonido /></div>
    </Hoja>
  );
}
