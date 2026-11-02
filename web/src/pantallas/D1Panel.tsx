import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { BarraDato, Dato, Estado, Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import { semanaActual, trabajoActual } from '../datos';
import { dimensionesDiagnostico, estudiantes, formularios, rutaPropuesta } from '../datosPlan';

const ALERTAS = [
  { tipo: 'alerta' as const, texto: 'Paula Vargas no ha cargado el Trabajo 3 y su última entrega fue tarde', accion: 'Enviar seguimiento', ruta: '#/d5' },
  { tipo: 'alerta' as const, texto: 'Andrés Cano fusionó su propio PR: queda marcado para revisión', accion: 'Revisar', ruta: '#/d3' },
  { tipo: 'tarde' as const, texto: 'Laura Gómez cargó el Trabajo 3 pasado el plazo', accion: 'Ver entrega', ruta: '#/d3' },
  { tipo: 'info' as const, texto: 'La votación de dashboards (S9) sigue en borrador', accion: 'Abrir formulario', ruta: '#/d5' },
];

export function D1Panel() {
  const cargadas = estudiantes.filter((estudiante) => estudiante.entrega !== 'sin_cargar').length;
  const sinCargar = estudiantes.length - cargadas;
  const porFusionar = estudiantes.filter((estudiante) => estudiante.entrega === 'aprobada' || estudiante.entrega === 'cargada').length;
  const relampago = formularios.find((formulario) => formulario.tipo === 'Relámpago')!;
  return (
    <Pantalla rol="docente" clase="p-d1">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker={`Docente · semana ${semanaActual} · 3 grupos`} titulo="Panel del curso" subtitulo={`Entrega en curso: ${trabajoActual.titulo}, vence el ${trabajoActual.vence.largo}.`} objeto="mapa" />
        <div className="contenido cuerpo-mundo panel">
          <div className="d1__datos rejilla rejilla--4">
            <Tarjeta><Dato valor={`${cargadas}/${estudiantes.length}`} etiqueta="Entregas cargadas" nota={trabajoActual.titulo} /></Tarjeta>
            <Tarjeta><Dato valor={sinCargar} etiqueta="Sin cargar" nota="Con acceso a la encuesta de seguimiento" tono="alerta" /></Tarjeta>
            <Tarjeta><Dato valor={porFusionar} etiqueta="Por revisar y fusionar" nota="Tu revisión general" /></Tarjeta>
            <Tarjeta tono="oscura"><Dato valor={`${relampago.respuestas}/36`} etiqueta="Relámpago de hoy" nota="Respondieron dentro de la ventana" /></Tarjeta>
          </div>
          <div className="d1__columnas">
            <Tarjeta kicker="Requiere tu atención" titulo="Alertas" accion={<Estado tipo="alerta">{ALERTAS.length} abiertas</Estado>}>
              <ul className="d1__alertas">
                {ALERTAS.map((alerta) => (
                  <li key={alerta.texto}>
                    <Estado tipo={alerta.tipo}>{alerta.tipo === 'alerta' ? 'Urgente' : alerta.tipo === 'tarde' ? 'Tarde' : 'Aviso'}</Estado>
                    <span>{alerta.texto}</span>
                    <a className="boton boton--suave" href={alerta.ruta}>{alerta.accion}</a>
                  </li>
                ))}
              </ul>
            </Tarjeta>
            <Tarjeta kicker="Hoy · jue 26 nov" titulo="S8 · PySpark SQL" accion={<Estado tipo="tarde">6:00 p. m.</Estado>} tono="menta">
              <p className="meta">Abre la pregunta relámpago al terminar el concepto, y el pulso semanal al cierre.</p>
              <div className="acciones"><a className="boton boton--accent" href="#/d11">Abrir una relámpago</a><a className="boton" href="#/d6">Ver el calendario</a></div>
            </Tarjeta>
            <Tarjeta kicker="Diagnóstico de entrada" titulo={`Ruta propuesta: ${rutaPropuesta}`}>
              {dimensionesDiagnostico.slice(0, 4).map((dimension) => <BarraDato key={dimension.nombre} etiqueta={dimension.nombre} valor={dimension.sinIA} sufijo="" tono={dimension.sinIA < 40 ? 'alerta' : undefined} />)}
              <a className="boton boton--suave" href="#/d2">Ver diagnóstico y rutas</a>
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Hoy · S8', texto: 'Abrir una relámpago', ruta: '#/d11' }} />
    </Pantalla>
  );
}
