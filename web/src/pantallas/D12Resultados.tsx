import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { BarraDato, Dato, Estado, Tabla, Tarjeta } from '../componentes/panel';
import { Pantalla, Segmentado } from '../componentes/ui';
import { conModoDemo } from '../componentes/conModoDemo';
import { D12ResultadosReal } from './D12ResultadosReal';
import { formularios, pulsoSemanal } from '../datosPlan';

export function D12ResultadosEjemplo() {
  const [vista, setVista] = useState(0);
  const cerrados = formularios.filter((formulario) => formulario.estado === 'cerrado');
  return (
    <Pantalla rol="docente" clase="p-d12">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Formularios', ruta: '#/d5' }} kicker="Histórico de la edición" titulo="Resultados" subtitulo="Lo que respondió el grupo, semana a semana." objeto="carta" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Pulso semanal', 'Votaciones', 'Relámpagos']} activa={vista} alCambiar={setVista} />
          <div className="d5__columnas" key={vista}>
            {vista === 0 && (
              <>
                <Tarjeta kicker="Anónimo · mínimo de 5 personas" titulo="Claridad y ritmo">
                  {pulsoSemanal.map((semana) => (
                    <div className="d2__fila" key={semana.semana}>
                      <BarraDato etiqueta={`S${semana.semana} claridad`} valor={semana.claridad} maximo={5} sufijo=" / 5" />
                      <BarraDato etiqueta="ritmo" valor={semana.ritmo} maximo={5} sufijo=" / 5" tono={semana.ritmo > 3.5 ? 'accent' : 'azul'} />
                    </div>
                  ))}
                  <p className="meta">Ritmo de 1 (muy lento) a 5 (muy rápido). La semana 2 fue la más rápida y la menos clara.</p>
                </Tarjeta>
                <Tarjeta tono="menta" kicker="Lectura" titulo="Qué sugiere">
                  <div className="rejilla"><Dato valor="4.0" etiqueta="Claridad promedio" nota="3 semanas" /><Dato valor="34" etiqueta="Respuestas por semana" nota="De 36 posibles" /></div>
                  <a className="boton boton--suave" href="#/d5">Crear el pulso de la semana 4</a>
                </Tarjeta>
              </>
            )}
            {vista === 1 && (
              <>
                <Tarjeta kicker="S4 · cerrada" titulo="Librería de visualización" accion={<Estado tipo="ok">Ganó Plotly</Estado>}>
                  <BarraDato etiqueta="Plotly" valor={58} />
                  <BarraDato etiqueta="Matplotlib" valor={42} tono="azul" />
                  <p className="meta">33 votos, anónimos. El resultado quedó guardado en la edición.</p>
                </Tarjeta>
                <Tarjeta kicker="S9 · borrador" titulo="Herramienta de dashboards" accion={<Estado tipo="info">Sin abrir</Estado>}>
                  <p className="meta">Power BI, Looker Studio o Streamlit. Se abre en la S9 y define el Trabajo 4.</p>
                </Tarjeta>
              </>
            )}
            {vista === 2 && (
              <Tarjeta kicker="Participación por sesión" titulo="Relámpagos" clase="d12__tabla">
                <Tabla
                  etiqueta="Relámpagos"
                  columnas={[{ clave: 'sesion', titulo: 'Sesión', ancho: '70px' }, { clave: 'tema', titulo: 'Tema', ancho: '2fr' }, { clave: 'acierto', titulo: 'Acierto', ancho: '1fr' }, { clave: 'a_tiempo', titulo: 'A tiempo', ancho: '90px' }]}
                  filas={[
                    { sesion: 'S2', tema: 'DataFrame frente a Series', acierto: <BarraDato etiqueta="" valor={82} />, a_tiempo: '35/36' },
                    { sesion: 'S4', tema: 'Cuándo usar un histograma', acierto: <BarraDato etiqueta="" valor={46} tono="alerta" />, a_tiempo: '33/36' },
                    { sesion: 'S6', tema: 'Para qué sirve un baseline', acierto: <BarraDato etiqueta="" valor={77} />, a_tiempo: '34/36' },
                    { sesion: 'S7', tema: 'Transformación o acción', acierto: <BarraDato etiqueta="" valor={58} tono="accent" />, a_tiempo: '31/36' },
                  ]}
                />
                <p className="meta">{cerrados.length} formularios cerrados en total. Exporta todo a CSV desde cada formulario.</p>
              </Tarjeta>
            )}
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Histórico', texto: 'Exportar a CSV', ruta: '#/d12' }} />
    </Pantalla>
  );
}

export const D12Resultados = conModoDemo(D12ResultadosEjemplo, D12ResultadosReal);
