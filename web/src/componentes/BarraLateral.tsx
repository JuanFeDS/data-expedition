import { IconoSvg } from './Icono';
import { INICIO_REAL } from './acceso';
import { useCurso } from './curso';
import { useDesbloqueos } from './desbloqueos';
import { BotonSalir } from './BotonSalir';
import { InterruptorSonido } from './tema';
import { Jaguar } from './Jaguar';
import { RutaProgreso } from './RutaProgreso';
import { RUTAS_COMUNES, gruposVisibles, inicioDeRol, rolDeRuta, usuarioDeRol, type Enlace } from './navegacion';
import { useSesion } from './sesion';
import { semanaActual, totalSemanas } from '../datos';

function Grupo({ titulo, enlaces, ruta }: { titulo: string; enlaces: Enlace[]; ruta: string }) {
  return (
    <div className="lateral__grupo">
      <span className="lateral__titulo">{titulo}</span>
      {enlaces.map((enlace) => (
        <a key={enlace.etiqueta} className={`lateral__enlace ${enlace.bloqueada ? 'lateral__enlace--bloqueada' : ''}`} data-codigo={enlace.activa[0]} href={enlace.ruta} aria-current={enlace.activa.includes(ruta) ? 'page' : undefined}>
          <span className="lateral__icono"><IconoSvg tipo={enlace.tipo} /></span>
          <span>{enlace.etiqueta}</span>
          {enlace.aviso && <i className="lateral__aviso">{enlace.aviso}</i>}
          {enlace.bloqueada && <span className="lateral__candado" aria-label="Se desbloquea al entrar"><svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="2.5" y="6" width="9" height="6.5" rx="1.5" fill="currentColor" /><path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.6" /></svg></span>}
        </a>
      ))}
    </div>
  );
}

export function BarraLateral({ ruta }: { ruta: string }) {
  const { modoDemo, persona } = useSesion();
  const { curso, dentro, reciente } = useCurso();
  const { todo, desbloqueadas } = useDesbloqueos();
  const rol = RUTAS_COMUNES.has(ruta) && persona ? persona.rol : rolDeRuta(ruta);
  const base = usuarioDeRol[rol];
  const real = !modoDemo && persona !== null;
  const nombreVisible = persona?.nombre?.trim() || persona?.usuario || '';
  const usuario = real
    ? { ...base, iniciales: nombreVisible.slice(0, 2).toUpperCase(), nombre: nombreVisible, detalle: persona.usuario ? `@${persona.usuario}` : base.detalle }
    : base;
  return (
    <aside className={`barra-lateral barra-lateral--${rol} ${real ? 'barra-lateral--real' : ''}`} aria-label="Navegación principal">
      <a className="lateral__marca" href={real ? INICIO_REAL[rol] : inicioDeRol[rol]} aria-label="Data Expedition, ir al inicio">
        <img className="marca-logo" src={`${import.meta.env.BASE_URL}marca/logo.webp`} alt="" />
        <img className="marca-letras" src={`${import.meta.env.BASE_URL}marca/letras.webp`} alt="" />
      </a>
      {!real && <span className="lateral__semana">{rol === 'estudiante' ? `Semana ${semanaActual} de ${totalSemanas}` : `${rol === 'docente' ? 'Docente' : 'Observación'} · semana ${semanaActual}`}</span>}
      <nav className="lateral__nav">
        {gruposVisibles(rol, real, dentro ? curso : reciente, todo ? null : desbloqueadas).map((grupo) => <Grupo key={grupo.titulo} titulo={grupo.titulo} enlaces={grupo.enlaces} ruta={ruta} />)}
      </nav>
      {real && <RutaProgreso />}
      <div className="lateral__ajustes"><InterruptorSonido /></div>
      <a className="lateral__usuario" href={usuario.ruta} aria-current={ruta === usuario.ruta.replace('#/', '') ? 'page' : undefined}>
        <span className={`avatar avatar--${usuario.color}`}>{usuario.iniciales}</span>
        <span className="lateral__datos"><strong>{usuario.nombre}</strong><small>{usuario.detalle}</small></span>
      </a>
      {real && <BotonSalir clase="lateral__salir">Cerrar sesión</BotonSalir>}
    </aside>
  );
}
