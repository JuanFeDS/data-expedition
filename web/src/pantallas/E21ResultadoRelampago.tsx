import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { Dato, Estado, Tarjeta } from '../componentes/panel';
import { Contador, Pantalla, Segmentado } from '../componentes/ui';

export function E21ResultadoRelampago() {
  const [vista, setVista] = useState(0);
  const acierta = vista === 0;
  return (
    <Pantalla clase="p-e21" tono={acierta ? 'menta' : 'claro'}>
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Pregunta relámpago · S8" titulo={acierta ? '¡Correcto!' : 'Casi'} subtitulo={acierta ? 'Respondiste dentro de la ventana.' : 'Esta no sumó bonificación, y no pasa nada.'} objeto="trofeo" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Si aciertas', 'Si fallas']} activa={vista} alCambiar={setVista} />
          <div className="rel__resultado">
            <Tarjeta kicker="Tu respuesta" titulo={acierta ? 'count()' : 'filter()'} accion={<Estado tipo={acierta ? 'ok' : 'alerta'}>{acierta ? 'Acción' : 'Transformación'}</Estado>}>
              <p className="meta">La respuesta correcta es <b>count()</b>. Una acción dispara el cálculo y devuelve un resultado; <b>filter()</b> es una transformación perezosa: solo prepara el plan y no ejecuta nada hasta que alguien pida el resultado.</p>
              <div className="rejilla">
                <Dato valor={acierta ? <>+<Contador valor={20} /></> : '0'} etiqueta="XP de bonificación" nota={acierta ? 'No es nota' : 'Sin bonificación'} />
                <Dato valor={acierta ? '38 s' : '52 s'} etiqueta="Tu tiempo" nota="Ventana de 60 s" />
              </div>
            </Tarjeta>
            <div className="rel__jaguar">
              <Jaguar pose={acierta ? 'celebra' : 'pensando'} ancho={150} />
              <p>{acierta ? 'Presente en la sesión, y con la teoría fresca.' : 'Guarda la diferencia: las acciones disparan el cálculo.'}</p>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: acierta ? 'Sigue el ritmo' : 'Repasa el tema', texto: 'Practicar Big Data', ruta: '#/e15' }} />
    </Pantalla>
  );
}
