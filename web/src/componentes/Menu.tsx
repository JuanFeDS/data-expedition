import { useContext } from 'react';
import { BotonSalir } from './BotonSalir';
import { IconoSvg } from './Icono';
import { NAVEGACION, type Rol } from './navegacion';
import { useSesion } from './sesion';
import { InterruptorSonido } from './tema';
import { Hoja, Kicker, ModoRol } from './ui';

export const OPCIONES_MENU = (rol: Rol) => NAVEGACION[rol].flatMap((grupo) => grupo.enlaces);

export function MenuHoja({ abierta, alCerrar, omitir }: { abierta: boolean; alCerrar: () => void; omitir?: string }) {
  const rol = useContext(ModoRol);
  const { modoDemo, persona } = useSesion();
  return (
    <Hoja abierta={abierta} alCerrar={alCerrar} titulo="Menú">
      <nav className="hoja__menu">
        {NAVEGACION[rol].map((grupo) => {
          const enlaces = grupo.enlaces.filter((opcion) => opcion.ruta !== omitir);
          if (enlaces.length === 0) return null;
          return (
            <section key={grupo.titulo} className="menu__grupo">
              <Kicker>{grupo.titulo}</Kicker>
              {enlaces.map((opcion) => (
                <a key={opcion.etiqueta} href={opcion.ruta} className="menu-fila">
                  <span className={`acceso-rapido__icono acceso-rapido__icono--${opcion.color}`}><IconoSvg tipo={opcion.tipo} /></span>
                  <span className="menu-fila__texto"><strong>{opcion.etiqueta}</strong><small>{opcion.detalle}</small></span>
                  <span aria-hidden="true">›</span>
                </a>
              ))}
            </section>
          );
        })}
      </nav>
      <div className="menu__ajustes"><InterruptorSonido /></div>
      {!modoDemo && persona && <BotonSalir clase="menu__salir">Cerrar sesión · @{persona.usuario}</BotonSalir>}
    </Hoja>
  );
}
