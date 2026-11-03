import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Estado, Tabla, Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import { conModoDemo } from '../componentes/conModoDemo';
import { E23SesionReal } from './E23SesionReal';
import { recursos } from '../datosPlan';

const DINAMICA = [
  { min: '0–10', dinamica: 'Preguntas pendientes', detalle: 'Lo que quedó de la S7' },
  { min: '10–70', dinamica: 'Trabajo del PR', detalle: 'En parejas, en salas: del análisis del T1 en pandas al mismo análisis en Spark' },
  { min: '70–80', dinamica: 'Pausa', detalle: '' },
  { min: '80–150', dinamica: 'PySpark SQL', detalle: 'Vistas, uniones y particiones, con un dataset de millones de filas' },
  { min: '150–165', dinamica: 'Pregunta relámpago', detalle: 'Un solo intento, 60 segundos, con bonificación' },
  { min: '165–180', dinamica: 'Cierre', detalle: 'Pulso semanal y recordatorio de detener el Codespace' },
];

export function E23DetalleSesionEjemplo() {
  const material = recursos.filter((recurso) => recurso.sesion === 'S7' || recurso.sesion === 'S8');
  return (
    <Pantalla clase="p-e23">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Calendario', ruta: '#/e22' }} kicker="S8 · jue 26 nov · 6:00 p. m. · virtual" titulo="PySpark SQL y comparación con pandas" subtitulo="Entrega el Trabajo 3 el viernes 27." objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          <div className="ses__columnas">
            <Tarjeta kicker="Cómo corre la sesión" titulo="3 horas">
              <Tabla etiqueta="Dinámica de la sesión" columnas={[{ clave: 'min', titulo: 'Min', ancho: '70px' }, { clave: 'dinamica', titulo: 'Dinámica', ancho: '170px' }, { clave: 'detalle', titulo: 'Detalle' }]} filas={DINAMICA} />
            </Tarjeta>
            <Tarjeta kicker="Semana 4" titulo="Material complementario" accion={<Estado tipo="info">{material.length} recursos</Estado>}>
              <ul className="ses__recursos">
                {material.map((recurso) => (
                  <li key={recurso.id} className="recurso">
                    <div className="recurso__cab">
                      <span className={`recurso__idioma recurso__idioma--${recurso.idioma.toLowerCase()}`}>{recurso.idioma}</span>
                      <div><strong>{recurso.titulo}</strong><small>{recurso.tipo}{recurso.gratis ? ' · gratis' : ' · puede ser de pago'}</small></div>
                      {recurso.verificado ? <Estado tipo="ok">Verificado</Estado> : <Estado tipo="tarde">Por verificar</Estado>}
                    </div>
                    {recurso.idioma === 'EN' && recurso.resumen && (
                      <details className="recurso__resumen">
                        <summary>Resumen en español</summary>
                        <p>{recurso.resumen}</p>
                        {recurso.glosario && <ul>{recurso.glosario.map((termino) => <li key={termino}>{termino}</li>)}</ul>}
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Después de la sesión', texto: 'Practicar este tema', ruta: '#/e15' }} />
    </Pantalla>
  );
}

export const E23DetalleSesion = conModoDemo(E23DetalleSesionEjemplo, E23SesionReal);
