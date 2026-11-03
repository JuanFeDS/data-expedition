import { useState } from 'react';
import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { Jaguar } from '../../../../compartido/ui/Jaguar';
import { Dato, Estado, Tarjeta } from '../../../../compartido/ui/panel';
import { Contador, Pantalla, Segmentado } from '../../../../compartido/ui/ui';

const CASOS = [
  { titulo: '¡Correcto!', subtitulo: 'Respondiste dentro de la ventana.', respuesta: 'count()', etiqueta: 'Acción', tipo: 'ok' as const, xp: 20, tiempo: '38 s', pose: 'celebra' as const, frase: 'Presente en la sesión, y con la teoría fresca.', tono: 'menta' as const },
  { titulo: 'Casi', subtitulo: 'Esta no sumó bonificación, y no pasa nada.', respuesta: 'filter()', etiqueta: 'Transformación', tipo: 'alerta' as const, xp: 0, tiempo: '52 s', pose: 'pensando' as const, frase: 'Guarda la diferencia: las acciones disparan el cálculo.', tono: 'claro' as const },
  { titulo: 'Se cerró la ventana', subtitulo: 'Llegaste después de los 60 segundos.', respuesta: 'count()', etiqueta: 'Sin bonificación', tipo: 'tarde' as const, xp: 0, tiempo: '74 s', pose: 'saluda' as const, frase: 'Tu respuesta se guardó, pero sin XP. La próxima, al abrirse el QR.', tono: 'claro' as const },
];

export function E21ResultadoRelampago({ inicial = 0 }: { inicial?: number }) {
  const [vista, setVista] = useState(inicial);
  const caso = CASOS[vista];
  return (
    <Pantalla clase={`p-e21 p-e21--${vista}`} tono={caso.tono}>
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Pregunta relámpago · S8" titulo={caso.titulo} subtitulo={caso.subtitulo} objeto={vista === 0 ? 'trofeo' : 'linterna'} />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Si aciertas', 'Si fallas', 'Fuera de tiempo']} activa={vista} alCambiar={setVista} />
          <div className="rel__resultado" key={vista}>
            <Tarjeta kicker={vista === 0 ? 'Tu respuesta' : 'La respuesta correcta'} titulo="count()" accion={<Estado tipo={caso.tipo}>{caso.etiqueta}</Estado>}>
              {vista === 1 && <p className="rel__tuya">Tú elegiste <b>{caso.respuesta}</b>, que es una transformación.</p>}
              <p className="meta">Una acción dispara el cálculo y devuelve un resultado; <b>filter()</b> es una transformación perezosa: solo prepara el plan y no ejecuta nada hasta que alguien pida el resultado.</p>
              <div className="rejilla">
                <Dato valor={caso.xp > 0 ? <>+<Contador valor={caso.xp} /></> : '0'} etiqueta="XP de bonificación" nota={caso.xp > 0 ? 'No es nota' : 'Sin penalización'} />
                <Dato valor={caso.tiempo} etiqueta="Tu tiempo" nota="Ventana de 60 s" tono={vista === 2 ? 'alerta' : undefined} />
              </div>
            </Tarjeta>
            <div className="rel__jaguar">
              <Jaguar pose={caso.pose} ancho={150} />
              <p>{caso.frase}</p>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: vista === 0 ? 'Sigue el ritmo' : 'Repasa el tema', texto: 'Practicar Big Data', ruta: '#/e15' }} />
    </Pantalla>
  );
}
