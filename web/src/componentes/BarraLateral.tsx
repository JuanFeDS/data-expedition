import { IconoSvg } from './Icono';
import { INICIO_REAL } from './acceso';
import { useCurso } from './curso';
import { useDesbloqueos } from './desbloqueos';
import { BotonSalir } from './BotonSalir';
import { InterruptorSonido } from './tema';
import { RutaProgreso } from './RutaProgreso';
import { RUTAS_COMUNES, gruposVisibles, inicioDeRol, rolDeRuta, separarBloqueadas, usuarioDeRol, type Enlace } from './navegacion';
import { rutaDeRol } from '../servicios/ruta';
import { useSesion } from './sesion';
import { semanaActual, totalSemanas } from '../datos';

function Grupo({ titulo, enlaces, ruta }: { titulo: string; enlaces: Enlace[]; ruta: string }) {
  return (
    <div className="lateral__grupo">
      <span className="lateral__titulo">{titulo}</span>
      {enlaces.map((enlace) => (
        <a key={enlace.etiqueta} className="lateral__enlace" data-codigo={enlace.activa[0]} href={enlace.ruta} aria-current={enlace.activa.includes(ruta) ? 'page' : undefined}>
          <span className="lateral__icono"><IconoSvg tipo={enlace.tipo} /></span>
          <span>{enlace.etiqueta}</span>
          {enlace.aviso && <i className="lateral__aviso">{enlace.aviso}</i>}
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
  const { abiertas, porDescubrir } = separarBloqueadas(gruposVisibles(rol, real, dentro ? curso : reciente, todo ? null : desbloqueadas), rutaDeRol(rol));
  return (
    <aside className={`barra-lateral barra-lateral--${rol} ${real ? 'barra-lateral--real' : ''}`} aria-label="Navegación principal">
      <a className="lateral__marca" href={real ? INICIO_REAL[rol] : inicioDeRol[rol]} aria-label="Data Expedition, ir al inicio">
        <img className="marca-logo" src={`${import.meta.env.BASE_URL}marca/logo.webp`} alt="" />
        <img className="marca-letras" src={`${import.meta.env.BASE_URL}marca/letras.webp`} alt="" />
      </a>
      {!real && <span className="lateral__semana">{rol === 'estudiante' ? `Semana ${semanaActual} de ${totalSemanas}` : `${rol === 'docente' ? 'Docente' : 'Observación'} · semana ${semanaActual}`}</span>}
      {real && dentro && curso && <span className="lateral__curso">{curso.nombre}</span>}
      <nav className="lateral__nav">
        {abiertas.map((grupo) => <Grupo key={grupo.titulo} titulo={grupo.titulo} enlaces={grupo.enlaces} ruta={ruta} />)}
        {porDescubrir.length > 0 && (
          <details className="lateral__descubrir">
            <summary><span>Descubrir</span><i>{porDescubrir.length}</i></summary>
            <p>Abre lo que necesites: se suma a tu panel y el jaguar te lo explica.</p>
            {porDescubrir.map((enlace) => (
              <a key={enlace.etiqueta} className="lateral__enlace" data-codigo={enlace.activa[0]} href={enlace.ruta}>
                <span className="lateral__icono"><IconoSvg tipo={enlace.tipo} /></span>
                <span>{enlace.etiqueta}</span>
              </a>
            ))}
          </details>
        )}
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
