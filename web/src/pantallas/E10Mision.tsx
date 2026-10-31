import { Cabecera, Kicker, Pantalla, Pill } from '../componentes/ui';

const EQUIPO = [
  { iniciales: 'CR', nombre: 'Camila R. (tú)', rol: 'Modelado', aportes: '9 aportes · bitácora al día', color: 'verde' },
  { iniciales: 'JA', nombre: 'Julián A.', rol: 'Datos', aportes: '7 aportes', color: 'azul' },
  { iniciales: 'MS', nombre: 'María S.', rol: 'Comunicación', aportes: '6 aportes', color: 'verde' },
  { iniciales: 'DP', nombre: 'Daniel P.', rol: 'Producción', aportes: '2 aportes · sin movimiento hace 4 días', color: 'azul' },
];

export function E10Mision() {
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <Cabecera kicker="La cima · semana 8" titulo="Proyecto final" subtitulo="Equipo Páramo · 4 personas" volver={{ texto: 'Ruta', ruta: '#/e1' }} />
        <div className="contenido">
          <Kicker>Quién responde por qué</Kicker>
          {EQUIPO.map((miembro) => (
            <div className="fila" key={miembro.nombre}>
              <span className={`avatar avatar--${miembro.color}`}>{miembro.iniciales}</span>
              <div className="fila__texto">
                <strong>{miembro.nombre}</strong>
                <span className="meta" style={{ fontSize: 12 }}>{miembro.aportes}</span>
              </div>
              <Pill variante="suave" pequena>Rol: {miembro.rol}</Pill>
            </div>
          ))}
          <p className="meta" style={{ fontSize: 13, padding: '14px 0 0' }}>La nota es la misma para todo el equipo. Tu radar cambia según tu rol, que se calcula de tu radar y puede cambiar.</p>
          <div style={{ flex: 1 }} />
          <a href="#/e1" style={{ padding: '12px 0 26px' }}><Pill grande>Abrir la bitácora del equipo</Pill></a>
        </div>
      </div>
    </Pantalla>
  );
}
