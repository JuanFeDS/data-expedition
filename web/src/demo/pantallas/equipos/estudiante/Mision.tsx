import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { Contador, Kicker, Pantalla, Pill } from '../../../../compartido/ui/ui';

const EQUIPO = [
  { iniciales: 'CR', nombre: 'Camilo R. (tú)', rol: 'Modelado', aportes: 9, color: 'verde' },
  { iniciales: 'JA', nombre: 'Julián A.', rol: 'Datos', aportes: 7, color: 'azul' },
  { iniciales: 'MS', nombre: 'María S.', rol: 'Comunicación', aportes: 6, color: 'verde' },
  { iniciales: 'DP', nombre: 'Daniel P.', rol: 'Producción', aportes: 2, color: 'azul', alerta: 'Sin movimiento hace 4 días' },
];
const MAXIMO = 10;

export function E10Mision() {
  const total = EQUIPO.reduce((suma, miembro) => suma + miembro.aportes, 0);
  return (
    <Pantalla clase="p-e10">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="La cima · semana 8" titulo="Proyecto final" subtitulo="Equipo Páramo · 4 personas" isla="volcan" />
        <div className="contenido cuerpo-mundo centrar" style={{ gap: 0 }}>
          <div className="mision__resumen">
            <span className="num"><Contador valor={total} /></span>
            <p><strong>aportes en la bitácora</strong><br />3 de 4 personas al día</p>
          </div>
          <Kicker>Quién responde por qué</Kicker>
          {EQUIPO.map((miembro) => (
            <div className="mision__miembro" key={miembro.nombre}>
              <span className={`avatar avatar--${miembro.color}`}>{miembro.iniciales}</span>
              <div className="fila__texto">
                <div className="mision__linea"><strong>{miembro.nombre}</strong><Pill variante="suave" pequena>Rol: {miembro.rol}</Pill></div>
                <div className="mision__barra" aria-label={`${miembro.aportes} aportes`}><i style={{ width: `${(miembro.aportes / MAXIMO) * 100}%` }} className={miembro.alerta ? 'mision__barra--alerta' : ''} /></div>
                <span className="meta" style={{ fontSize: 'var(--fs-xs)' }}>{miembro.aportes} aportes{miembro.alerta ? ` · ${miembro.alerta}` : ''}</span>
              </div>
            </div>
          ))}
          <p className="meta" style={{ fontSize: 'var(--fs-sm)', paddingTop: 14 }}>La nota es la misma para todo el equipo. Tu radar cambia según tu rol, que se calcula de tu radar y puede cambiar.</p>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Misión en equipo', texto: 'Abrir la bitácora', ruta: '#/e10' }} />
    </Pantalla>
  );
}
