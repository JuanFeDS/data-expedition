import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { Estado, Tarjeta } from '../../../compartido/ui/panel';
import { Jaguar } from '../../../compartido/ui/Jaguar';
import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E24EquipoReal } from './RutaEquipoReal';
import { Pantalla } from '../../../compartido/ui/ui';
import { UMBRAL_NIVELACION, UMBRAL_PROFUNDIZACION, equiposCurso, estudiantes } from '../../../demo/datosPlan';

const NIVELES = ['Base', 'Estándar', 'Reto'];
const yo = estudiantes[0];
const equipo = equiposCurso.find((candidato) => candidato.nombre === yo.equipo)!;

export function E24RutaEquipoEjemplo() {
  const nivelActivo = yo.ruta === 'Nivelación' ? 0 : yo.ruta === 'Estándar' ? 1 : 2;
  return (
    <Pantalla clase="p-e24">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Tu recorrido" titulo="Mi ruta y mi equipo" subtitulo="Lo que el diagnóstico decidió para ti, y con quién avanzas." objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          <div className="ruta__columnas">
            <Tarjeta tono="menta" kicker="Tu ruta" titulo={`Ruta ${yo.ruta}`} accion={<Estado tipo="ok">Confirmada por el docente</Estado>}>
              <p className="meta">Tu radar de Datos al entrar fue <b>{yo.datos}</b> de 100. Entre {UMBRAL_NIVELACION} y {UMBRAL_PROFUNDIZACION} sigues el plan tal cual.</p>
              <div className="ruta__umbrales" aria-label="Rutas según el radar de Datos">
                <div className="ruta__tramo"><span>Nivelación</span><small>menos de {UMBRAL_NIVELACION}</small></div>
                <div className="ruta__tramo ruta__tramo--activo"><span>Estándar</span><small>{UMBRAL_NIVELACION} a {UMBRAL_PROFUNDIZACION}</small></div>
                <div className="ruta__tramo"><span>Profundización</span><small>más de {UMBRAL_PROFUNDIZACION}</small></div>
                <i className="ruta__marca" style={{ left: `${yo.datos}%` }} />
              </div>
              <div className="ruta__niveles">
                <span className="kicker">Tus ejercicios por sesión</span>
                <div className="ruta__chips">
                  {NIVELES.map((nivel, indice) => <span key={nivel} className={indice === nivelActivo ? 'on' : ''}>{nivel}</span>)}
                </div>
              </div>
            </Tarjeta>
            <div className="ruta__lado">
              <Tarjeta kicker="Equipo del integrador" titulo={`Equipo ${equipo.nombre}`} accion={<Estado tipo="tarde">Propuesto</Estado>}>
                <p className="meta">Se confirma en la semana 6, al planear el primer sprint. Tu rol sugerido sale de tu radar.</p>
                <ul className="ruta__equipo">
                  {estudiantes.filter((estudiante) => estudiante.equipo === equipo.nombre).map((estudiante) => (
                    <li key={estudiante.id} className={estudiante.id === yo.id ? 'yo' : ''}>
                      <span className="avatar avatar--verde">{estudiante.iniciales}</span>
                      <div><strong>{estudiante.id === yo.id ? 'Tú' : estudiante.nombre}</strong><small>{estudiante.rol}</small></div>
                    </li>
                  ))}
                </ul>
              </Tarjeta>
              <Tarjeta kicker="Revisión en pareja" titulo={yo.pareja}>
                <p className="meta">Revisa y aprueba tu PR, con al menos dos comentarios en línea, y tú el suyo. No lo fusiona: eso lo hace el docente.</p>
                <div className="ruta__pareja"><Jaguar pose="saluda" ancho={70} /><Estado tipo="pendiente">Aún no revisa el Trabajo 3</Estado></div>
              </Tarjeta>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Trabajo 3', texto: 'Ir a mis entregas', ruta: '#/e5' }} />
    </Pantalla>
  );
}

export const E24RutaEquipo = conModoDemo(E24RutaEquipoEjemplo, E24EquipoReal);
