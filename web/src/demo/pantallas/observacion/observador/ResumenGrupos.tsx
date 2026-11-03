import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { BarraDato, Dato, Estado, Tarjeta } from '../../../../compartido/ui/panel';
import { Pantalla } from '../../../../compartido/ui/ui';
import { semanaActual } from '../../../datos';
import { estudiantes } from '../../../datosPlan';

const MINIMO = 5;
const grupos = [1, 2, 3].map((numero) => ({ numero, personas: estudiantes.filter((estudiante) => estudiante.grupo === numero).length }));
const total = estudiantes.length;
const alDia = Math.round((estudiantes.filter((estudiante) => estudiante.entrega !== 'sin_cargar' && !estudiante.tarde).length / total) * 100);
const avance = Math.round(estudiantes.reduce((suma, estudiante) => suma + estudiante.datos, 0) / total);

export function O1ResumenGruposEjemplo() {
  return (
    <Pantalla rol="observador" clase="p-o1">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker={`Observación · semana ${semanaActual}`} titulo="Resumen por grupo" subtitulo="Solo datos agregados: sin nombres, correos ni textos de entregas." objeto="binoculares" />
        <div className="contenido cuerpo-mundo panel">
          <div className="o1__datos rejilla rejilla--3">
            <Tarjeta><Dato valor={`${alDia} %`} etiqueta="Entregas a tiempo" nota="Trabajo en curso, los 3 grupos" /></Tarjeta>
            <Tarjeta><Dato valor={avance} etiqueta="Radar de Datos, promedio" nota="De 0 a 100" /></Tarjeta>
            <Tarjeta tono="oscura"><Dato valor="92 %" etiqueta="Asistencia a las sesiones" nota="Relámpagos respondidos a tiempo" /></Tarjeta>
          </div>
          <div className="o1__grupos">
            {grupos.map((grupo) => (
              <Tarjeta key={grupo.numero} kicker={`Grupo ${grupo.numero}`} titulo={grupo.personas >= MINIMO ? 'Resumen' : 'Aún no se muestra'} accion={<Estado tipo={grupo.personas >= MINIMO ? 'ok' : 'tarde'}>{grupo.personas} personas</Estado>}>
                {grupo.personas >= MINIMO ? (
                  <><BarraDato etiqueta="A tiempo" valor={80} /><BarraDato etiqueta="Radar" valor={61} tono="azul" /></>
                ) : (
                  <p className="meta o1__oculto">Para proteger la identidad, el dato aparece cuando hay al menos {MINIMO} personas. Faltan {MINIMO - grupo.personas}. El total de los 3 grupos sí se muestra arriba.</p>
                )}
              </Tarjeta>
            ))}
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Qué puedes ver', texto: 'Ver las reglas', ruta: '#/o3' }} />
    </Pantalla>
  );
}

