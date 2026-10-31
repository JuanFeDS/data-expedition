import { Jaguar } from '../componentes/Jaguar';
import { Kicker, Pantalla } from '../componentes/ui';

const SECCIONES = [
  { kicker: 'Lo que subió', color: 'var(--primary)', lineas: [{ titulo: 'Modelado +4', detalle: 'Tu Trabajo 1 y 6 lecciones movieron esta dimensión.' }] },
  { kicker: 'A vigilar', color: 'var(--secondary)', lineas: [{ titulo: 'Validación sin cambio', detalle: 'Llevas 3 semanas en 30. Las lecciones de esta dimensión son tu mejor atajo.' }] },
  { kicker: 'Esta semana', color: 'var(--primary)', lineas: [{ titulo: '1. Entrega el Trabajo 2', detalle: 'Vence el viernes 7. Declara si usaste IA.' }, { titulo: '2. Haz 3 lecciones de Validación', detalle: 'Cuentan como práctica verificada ligera, con tope.' }] },
];

export function E11Resumen() {
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <header className="banda banda--deep resumen__banda" style={{ paddingBottom: 26 }}>
          <a href="#/home" style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint)' }}>‹ Inicio</a>
          <Kicker estilo={{ color: 'var(--mint)' }}>Semana 4 · 20 al 26 oct</Kicker>
          <h1 className="titulo" style={{ fontSize: 36, lineHeight: 1.05, maxWidth: 220 }}>Tu semana en una página</h1>
          <Jaguar pose="saluda" ancho={124} clase="resumen__guia" />
        </header>
        <div className="contenido" style={{ paddingTop: 14, gap: 4 }}>
          {SECCIONES.map((seccion) => (
            <section className="resumen__seccion" key={seccion.kicker}>
              <Kicker estilo={{ color: seccion.color }}>{seccion.kicker}</Kicker>
              {seccion.lineas.map((linea) => (
                <div className="resumen__linea" key={linea.titulo}>
                  <strong>{linea.titulo}</strong>
                  <span className="meta" style={{ fontSize: 13 }}>{linea.detalle}</span>
                </div>
              ))}
            </section>
          ))}
          <p className="meta" style={{ fontSize: 12, paddingTop: 6 }}>También lo recibes en tu correo institucional.</p>
        </div>
      </div>
    </Pantalla>
  );
}
