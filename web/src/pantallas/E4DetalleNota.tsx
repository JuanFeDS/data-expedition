import { Contador, Kicker, Niveles, Pantalla, Pill, TabBar } from '../componentes/ui';
import { criteriosTrabajo1 } from '../datos';

export function E4DetalleNota() {
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <header className="banda banda--azul" style={{ paddingBottom: 20, gap: 4 }}>
          <a href="#/e3" style={{ fontSize: 14, fontWeight: 700 }}>‹ Notas</a>
          <Kicker>Trabajo 1 · calificado el 21 oct</Kicker>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            <span className="num" style={{ fontSize: 88 }}><Contador valor={4.2} decimales={1} /></span>
            <div style={{ paddingBottom: 14, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
              <Pill variante="accent">Con IA declarada</Pill>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: .9 }}>Bitácora entregada</span>
            </div>
          </div>
        </header>
        <div className="contenido" style={{ paddingTop: 14 }}>
          <Kicker>Cómo se calculó</Kicker>
          {criteriosTrabajo1.map((criterio) => (
            <div className="criterio" key={criterio.nombre}>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14, display: 'block' }}>{criterio.nombre}</strong>
                <span className="meta" style={{ fontSize: 11 }}>{criterio.dimension} · peso {criterio.peso}</span>
              </div>
              <Niveles nivel={criterio.nivel} />
              <span className="criterio__valor">{criterio.nivel}</span>
            </div>
          ))}
          <p className="meta" style={{ fontSize: 12, padding: '8px 0' }}>Regla: promedio de los niveles ponderado por el peso de cada criterio.</p>
          <Kicker>Retroalimentación</Kicker>
          <p style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', paddingTop: 4 }}>Muy buenas preguntas de análisis. Para el próximo trabajo, deja corriendo el cuaderno de principio a fin antes de entregar.</p>
        </div>
      </div>
      <TabBar activa="Notas" />
    </Pantalla>
  );
}
