import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { Contador, Kicker, Niveles, Pantalla, Pill } from '../componentes/ui';
import { criteriosTrabajo1 } from '../datos';

export function E4DetalleNota() {
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Notas', ruta: '#/e3' }} kicker="Trabajo 1 · semana 3 · 21 oct" titulo="Tu nota" objeto="trofeo">
          <div className="cifra-mundo">
            <span className="num"><Contador valor={4.2} decimales={1} /></span>
            <small><Pill variante="accent" pequena>Con IA declarada</Pill><br />Bitácora entregada</small>
          </div>
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo" style={{ gap: 0 }}>
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
          <p className="meta" style={{ fontSize: 12, padding: '8px 0 12px' }}>Regla: promedio de los niveles ponderado por el peso de cada criterio.</p>
          <div className="retro">
            <Jaguar pose="saluda" ancho={84} clase="retro__guia" />
            <div>
              <Kicker>Retroalimentación</Kicker>
              <p>Muy buenas preguntas de análisis. Para el próximo trabajo, deja corriendo el cuaderno de principio a fin antes de entregar.</p>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Sigue la ruta', texto: 'Ir al Trabajo 2', ruta: '#/e6' }} />
    </Pantalla>
  );
}
