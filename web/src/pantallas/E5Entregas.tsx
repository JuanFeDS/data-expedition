import { useState } from 'react';
import { Cabecera, Kicker, Pantalla, Pill, Segmentado, TabBar } from '../componentes/ui';

export function E5Entregas() {
  const [vista, setVista] = useState(0);
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <Cabecera titulo="Entregas" />
        <div className="contenido" style={{ gap: 4 }}>
          <Segmentado opciones={['Pendientes', 'Entregadas']} activa={vista} alCambiar={setVista} />
          {vista === 0 ? (
            <>
              <div className="fila" style={{ padding: '16px 0' }}>
                <div className="fila__texto">
                  <Kicker>Vence el viernes 7</Kicker>
                  <span className="fila__titulo">Trabajo 2</span>
                  <span className="meta" style={{ fontSize: 12 }}>Modelo predictivo · borrador guardado hace 2 h</span>
                  <div className="chips"><Pill variante="accent" pequena>Borrador</Pill></div>
                </div>
                <a href="#/e6"><Pill boton>Continuar</Pill></a>
              </div>
              <div className="fila" style={{ padding: '16px 0' }}>
                <div className="fila__texto">
                  <Kicker>Se abre el 14 de noviembre</Kicker>
                  <span className="fila__titulo">Trabajo 3</span>
                  <span className="meta" style={{ fontSize: 12 }}>Comunicación y producción · se abre al entregar el 2</span>
                </div>
              </div>
              <div className="aviso">
                <Kicker estilo={{ color: 'var(--ink)' }}>Revisión al azar · semana 5</Kicker>
                <p>Cada semana se sortean 2 o 3 equipos para explicar una decisión en 3 minutos. Ten lista tu bitácora.</p>
              </div>
            </>
          ) : (
            <div className="fila" style={{ padding: '16px 0' }}>
              <div className="fila__texto">
                <Kicker>Entregado el 18 oct</Kicker>
                <span className="fila__titulo">Trabajo 1</span>
                <span className="meta" style={{ fontSize: 12 }}>Calificado: 4.2</span>
                <div className="chips"><Pill variante="suave" pequena>Con IA</Pill></div>
              </div>
              <a href="#/e4"><Pill variante="suave" boton>Ver nota</Pill></a>
            </div>
          )}
        </div>
      </div>
      <TabBar activa="Entregas" />
    </Pantalla>
  );
}
