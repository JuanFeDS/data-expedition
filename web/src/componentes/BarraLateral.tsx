import { IconoSvg } from './Icono';
import { InterruptorSonido, InterruptorTema } from './tema';
import { Jaguar } from './Jaguar';
import { NAVEGACION, inicioDeRol, rolDeRuta, usuarioDeRol, type Enlace } from './navegacion';
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
  const usuario = usuarioDeRol[rol];
  return (
    <aside className={`barra-lateral barra-lateral--${rol}`} aria-label="Navegación principal">
      <a className="lateral__marca" href={inicioDeRol[rol]}>
        <Jaguar pose="guia" ancho={44} />
        <span>data-<br />expedicion</span>
      </a>
      <span className="lateral__semana">{rol === 'estudiante' ? `Semana ${semanaActual} de ${totalSemanas}` : `${rol === 'docente' ? 'Docente' : 'Observación'} · semana ${semanaActual}`}</span>
      <nav className="lateral__nav">
        {NAVEGACION[rol].map((grupo) => <Grupo key={grupo.titulo} titulo={grupo.titulo} enlaces={grupo.enlaces} ruta={ruta} />)}
      </nav>
      <div className="lateral__ajustes"><InterruptorTema /><InterruptorSonido /></div>
      <a className="lateral__usuario" href={usuario.ruta} aria-current={ruta === usuario.ruta.replace('#/', '') ? 'page' : undefined}>
        <span className={`avatar avatar--${usuario.color}`}>{usuario.iniciales}</span>
        <span className="lateral__datos"><strong>{usuario.nombre}</strong><small>{usuario.detalle}</small></span>
      </a>
    </aside>
  );
}
