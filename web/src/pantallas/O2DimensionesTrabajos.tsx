import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { BarraDato, Estado, Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import { dimensiones, trabajos } from '../datos';

const DISTRIBUCION = [
  { etiqueta: '1.0 a 2.9', valor: 8 },
  { etiqueta: '3.0 a 3.9', valor: 31 },
  { etiqueta: '4.0 a 4.5', valor: 44 },
  { etiqueta: '4.6 a 5.0', valor: 17 },
];

export function O2DimensionesTrabajos() {
  return (
    <Pantalla rol="observador" clase="p-o2">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Avance del curso" titulo="Dimensiones y trabajos" subtitulo="Cada dato necesita al menos 5 personas para mostrarse." objeto="mapa" />
        <div className="contenido cuerpo-mundo panel">
          <div className="o2__columnas">
            <Tarjeta kicker="Radar promedio, de 0 a 100" titulo="Por dimensión" accion={<Estado tipo="info">Entrada y ahora</Estado>}>
              {dimensiones.map((dimension) => (
                <div className="d2__fila" key={dimension.nombre}>
                  <BarraDato etiqueta={dimension.nombre} valor={dimension.ahora} sufijo="" />
                  <BarraDato etiqueta="entrada" valor={dimension.inicio} sufijo="" tono="azul" />
                </div>
              ))}
            </Tarjeta>
            <div className="o2__lado">
              <Tarjeta kicker="Notas, todos los grupos" titulo={`${trabajos[1].titulo}: distribución`}>
                {DISTRIBUCION.map((banda) => <BarraDato key={banda.etiqueta} etiqueta={banda.etiqueta} valor={banda.valor} tono={banda.etiqueta.startsWith('1.0') ? 'alerta' : undefined} />)}
              </Tarjeta>
              <Tarjeta kicker="Entregas por trabajo" titulo="A tiempo">
                {trabajos.slice(0, 3).map((trabajo, indice) => <BarraDato key={trabajo.codigo} etiqueta={trabajo.titulo} valor={[94, 89, 67][indice]} tono={indice === 2 ? 'accent' : undefined} />)}
                <p className="meta">El Trabajo 3 sigue abierto.</p>
              </Tarjeta>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Datos agregados', texto: 'Volver al resumen', ruta: '#/o1' }} />
    </Pantalla>
  );
}
