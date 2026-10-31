import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Isla } from '../componentes/Region';
import { Contador, Kicker, Pantalla } from '../componentes/ui';
import { regionesCurso } from '../datos';

const HISTORIAL = [
  { semana: 'Semana 1', rol: 'Explorador de datos' },
  { semana: 'Semana 3', rol: 'Explorador de datos' },
  { semana: 'Semana 4', rol: 'Analista', actual: true },
];
const XP = 340;
const META_XP = 500;

export function E12Perfil() {
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Perfil" titulo="Camilo Restrepo" subtitulo="Grupo 2 · camilo@universidad.edu.co" jaguar="guia" />
        <div className="contenido cuerpo-mundo" style={{ gap: 4 }}>
          <Kicker>Tu rol de expedición hoy</Kicker>
          <div className="perfil__rol">
            <span className="num">Analista</span>
            <p className="meta">Sale de tu radar: Modelado y Datos pesan más hoy. Puede cambiar.</p>
          </div>
          <ol className="linea-tiempo">
            {HISTORIAL.map((fila) => (
              <li key={fila.semana} className={fila.actual ? 'linea-tiempo__actual' : ''}>
                <span className="linea-tiempo__punto" />
                <span className="linea-tiempo__semana">{fila.semana}</span>
                <strong>{fila.rol}</strong>
              </li>
            ))}
          </ol>
          <hr className="sep" />
          <div className="perfil__xp">
            <div className="perfil__xp-cifra"><span className="num"><Contador valor={XP} /></span><small>de {META_XP} XP para el nivel 4</small></div>
            <div className="perfil__xp-barra"><i style={{ width: `${(XP / META_XP) * 100}%` }} /></div>
            <p className="meta" style={{ fontSize: 12 }}>El XP no es nota: se gana con lecciones y misiones y desbloquea retos opcionales.</p>
          </div>
          <hr className="sep" />
          <Kicker>Sellos de la expedición</Kicker>
          <div className="sellos">
            {regionesCurso.map((region) => (
              <div key={region.nombre} className={`sello sello--${region.estado}`}>
                <Isla bioma={region.bioma} />
                <small>Sem {region.semanas}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
