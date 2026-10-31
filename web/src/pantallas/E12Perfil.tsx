import { Contador, Kicker, Pantalla } from '../componentes/ui';

const HISTORIAL = [
  { semana: 'Semana 1', rol: 'Exploradora de datos' },
  { semana: 'Semana 3', rol: 'Exploradora de datos' },
  { semana: 'Semana 4', rol: 'Analista' },
];

export function E12Perfil() {
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <header className="banda banda--verde" style={{ gap: 10, paddingBottom: 22 }}>
          <a href="#/e1" style={{ fontSize: 14, fontWeight: 700 }}>‹ Ruta</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="avatar avatar--grande avatar--deep">CR</span>
            <div>
              <h1 className="titulo" style={{ fontSize: 26 }}>Camila Restrepo</h1>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: .85 }}>Grupo 2 · camila@universidad.edu.co</span>
            </div>
          </div>
        </header>
        <div className="contenido" style={{ paddingTop: 14, gap: 4 }}>
          <Kicker>Tu rol de expedición hoy</Kicker>
          <div style={{ padding: '4px 0 10px' }}>
            <div className="num" style={{ fontSize: 44, color: 'var(--secondary)' }}>Analista</div>
            <p className="meta" style={{ fontSize: 13, paddingTop: 4 }}>Sale de tu radar: Modelado y Datos pesan más hoy. Puede cambiar.</p>
          </div>
          <hr className="sep" />
          <div style={{ padding: '10px 0' }}>
            <Kicker>Cómo ha cambiado</Kicker>
            {HISTORIAL.map((fila) => (
              <div className="historial" key={fila.semana}><span>{fila.semana}</span><strong>{fila.rol}</strong></div>
            ))}
          </div>
          <hr className="sep" />
          <div className="xp">
            <span className="num" style={{ fontSize: 44 }}><Contador valor={340} /></span>
            <p className="meta" style={{ fontSize: 12 }}>XP · se gana con lecciones y misiones. No es nota; desbloquea retos opcionales.</p>
          </div>
          <div className="insignias" aria-label="Insignias">
            {['accent', 'mint', 'azul'].map((color) => <span key={color} className={`insignia insignia--${color}`} />)}
            {[0, 1].map((i) => <span key={i} className="insignia insignia--vacia" />)}
          </div>
        </div>
      </div>
    </Pantalla>
  );
}
