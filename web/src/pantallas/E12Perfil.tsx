import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Contador, Kicker, Pantalla } from '../componentes/ui';
import { dimensiones } from '../datos';

const HISTORIAL = [
  { semana: 'Semana 1', rol: 'Explorador de datos' },
  { semana: 'Semana 3', rol: 'Explorador de datos' },
  { semana: 'Semana 4', rol: 'Analista', actual: true },
];
const GEMAS = [
  { gema: 'esmeralda', dimension: 'Datos' },
  { gema: 'topacio', dimension: 'Análisis' },
  { gema: 'zafiro', dimension: 'Modelado' },
  { gema: 'peridoto', dimension: 'Validación' },
  { gema: 'aguamarina', dimension: 'Comunicación' },
  { gema: 'ambar', dimension: 'Producción' },
  { gema: 'opalo', dimension: 'Dirección de IA' },
  { gema: 'diamante', dimension: 'Proyecto final' },
];

type NivelGema = 'pulida' | 'tallada' | 'bruto' | 'bloqueada';
const ETIQUETA_NIVEL: Record<NivelGema, string> = { pulida: 'Pulida', tallada: 'Tallada', bruto: 'En bruto', bloqueada: 'Al final del curso' };

function nivelDeGema(valor?: number): NivelGema {
  if (valor === undefined) return 'bloqueada';
  if (valor >= 60) return 'pulida';
  if (valor >= 40) return 'tallada';
  return 'bruto';
}

const XP = 340;
const META_XP = 500;

export function E12Perfil() {
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Perfil" titulo="Camilo Restrepo" subtitulo="Grupo 2 · camilo@uni…" objeto="mochila" jaguar="guia" />
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
          <Kicker>Tu colección de gemas</Kicker>
          <p className="meta" style={{ fontSize: 12 }}>Cada gema se pule a medida que sube su dimensión en el radar.</p>
          <div className="gemas">
            {GEMAS.map((item) => {
              const valor = dimensiones.find((dimension) => dimension.nombre === item.dimension)?.ahora;
              const nivel = nivelDeGema(valor);
              return (
                <div key={item.gema} className={`gema gema--${nivel}`}>
                  <img src={`${import.meta.env.BASE_URL}gemas/${item.gema}.webp`} alt="" />
                  <strong>{item.dimension}</strong>
                  <small>{valor !== undefined ? `${ETIQUETA_NIVEL[nivel]} · ${valor}` : ETIQUETA_NIVEL[nivel]}</small>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
