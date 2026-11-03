import { useContext } from 'react';
import { BotonSalir } from '../ui/BotonSalir';
import { IconoSvg } from '../ui/Icono';
import { useCurso } from '../estado/curso';
import { useDesbloqueos } from '../estado/desbloqueos';
import { NAVEGACION, esConectada, gruposVisibles, separarBloqueadas, type Rol } from './navegacion';
import { rutaDeRol } from '../../servicios/ruta';
import { useSesion } from '../estado/sesion';
import { InterruptorSonido } from '../ui/tema';
import { RutaProgreso } from './RutaProgreso';
import { Hoja, Kicker, ModoRol } from '../ui/ui';

const ATAJOS_DOCENTE = ['#/d1', '#/d3', '#/d4', '#/d8'];

export const OPCIONES_MENU = (rol: Rol) => NAVEGACION[rol].flatMap((grupo) => grupo.enlaces);

export function MenuHoja({ abierta, alCerrar, omitir }: { abierta: boolean; alCerrar: () => void; omitir?: string }) {
  const rol = useContext(ModoRol);
  const { modoDemo, persona } = useSesion();
  const { curso, dentro, reciente } = useCurso();
  const { todo, desbloqueadas } = useDesbloqueos();
  const { abiertas, porDescubrir } = separarBloqueadas(gruposVisibles(rol, !modoDemo, dentro ? curso : reciente, todo ? null : desbloqueadas), rutaDeRol(rol));
  return (
    <Hoja abierta={abierta} alCerrar={alCerrar} titulo="Menú">
      {rol === 'docente' && (
        <div className="menu__atajos">
          {OPCIONES_MENU(rol).filter((opcion) => ATAJOS_DOCENTE.includes(opcion.ruta) && (modoDemo || esConectada(opcion.ruta))).map((opcion) => (
            <a key={opcion.etiqueta} href={opcion.ruta} aria-current={opcion.ruta === omitir ? 'page' : undefined}>
              <span className={`acceso-rapido__icono acceso-rapido__icono--${opcion.color}`}><IconoSvg tipo={opcion.tipo} /></span>
              <strong>{opcion.etiqueta}</strong>
            </a>
          ))}
        </div>
      )}
      <nav className="hoja__menu">
        {abiertas.map((grupo) => {
          const enlaces = grupo.enlaces.filter((opcion) => opcion.ruta !== omitir && !(rol === 'docente' && ATAJOS_DOCENTE.includes(opcion.ruta)));
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
        {porDescubrir.length > 0 && (
          <section className="menu__grupo">
            <Kicker>Descubrir</Kicker>
            {porDescubrir.map((opcion) => (
              <a key={opcion.etiqueta} href={opcion.ruta} className="menu-fila">
                <span className={`acceso-rapido__icono acceso-rapido__icono--${opcion.color}`}><IconoSvg tipo={opcion.tipo} /></span>
                <span className="menu-fila__texto"><strong>{opcion.etiqueta}</strong><small>{opcion.detalle}</small></span>
                <span aria-hidden="true">›</span>
              </a>
            ))}
          </section>
        )}
      </nav>
      {!modoDemo && <RutaProgreso />}
      <div className="menu__ajustes"><InterruptorSonido /></div>
      {!modoDemo && persona && <BotonSalir clase="menu__salir">Cerrar sesión · @{persona.usuario}</BotonSalir>}
    </Hoja>
  );
}
