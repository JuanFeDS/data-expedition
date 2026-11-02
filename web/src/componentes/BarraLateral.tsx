import { IconoSvg } from './Icono';
import { BotonSalir } from './BotonSalir';
import { InterruptorSonido } from './tema';
import { Jaguar } from './Jaguar';
import { NAVEGACION, inicioDeRol, rolDeRuta, usuarioDeRol, type Enlace } from './navegacion';
import { useSesion } from './sesion';
import { semanaActual, totalSemanas } from '../datos';

function Grupo({ titulo, enlaces, ruta }: { titulo: string; enlaces: Enlace[]; ruta: string }) {
  return (
    <div className="lateral__grupo">
      <span className="lateral__titulo">{titulo}</span>
      {enlaces.map((enlace) => (
        <a key={enlace.etiqueta} className="lateral__enlace" href={enlace.ruta} aria-current={enlace.activa.includes(ruta) ? 'page' : undefined}>
          <span className="lateral__icono"><IconoSvg tipo={enlace.tipo} /></span>
          <span>{enlace.etiqueta}</span>
          {enlace.aviso && <i className="lateral__aviso">{enlace.aviso}</i>}
        </a>
      ))}
    </div>
  );
}

export function BarraLateral({ ruta }: { ruta: string }) {
  const rol = rolDeRuta(ruta);
  const { modoDemo, persona } = useSesion();
  const base = usuarioDeRol[rol];
  const real = !modoDemo && persona !== null;
  const nombreVisible = persona?.nombre?.trim() || persona?.usuario || '';
  const usuario = real
    ? { ...base, iniciales: nombreVisible.slice(0, 2).toUpperCase(), nombre: nombreVisible, detalle: persona.usuario ? `@${persona.usuario}` : base.detalle }
    : base;
  return (
    <aside className={`barra-lateral barra-lateral--${rol}`} aria-label="Navegación principal">
      <a className="lateral__marca" href={inicioDeRol[rol]} aria-label="Data Expedition, ir al inicio">
        <img className="marca-logo" src={`${import.meta.env.BASE_URL}marca/logo.webp`} alt="" />
        <img className="marca-letras" src={`${import.meta.env.BASE_URL}marca/letras.webp`} alt="" />
      </a>
      <span className="lateral__semana">{rol === 'estudiante' ? `Semana ${semanaActual} de ${totalSemanas}` : `${rol === 'docente' ? 'Docente' : 'Observación'} · semana ${semanaActual}`}</span>
      <nav className="lateral__nav">
        {NAVEGACION[rol].map((grupo) => <Grupo key={grupo.titulo} titulo={grupo.titulo} enlaces={grupo.enlaces} ruta={ruta} />)}
      </nav>
      <div className="lateral__ajustes"><InterruptorSonido /></div>
      <a className="lateral__usuario" href={usuario.ruta} aria-current={ruta === usuario.ruta.replace('#/', '') ? 'page' : undefined}>
        <span className={`avatar avatar--${usuario.color}`}>{usuario.iniciales}</span>
        <span className="lateral__datos"><strong>{usuario.nombre}</strong><small>{usuario.detalle}</small></span>
      </a>
      {real && <BotonSalir clase="lateral__salir">Cerrar sesión</BotonSalir>}
    </aside>
  );
}
