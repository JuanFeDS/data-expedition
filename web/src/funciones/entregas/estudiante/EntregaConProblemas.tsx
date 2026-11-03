import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { Estado, Tarjeta, type TipoEstado } from '../../../compartido/ui/panel';
import { Pantalla } from '../../../compartido/ui/ui';
import { trabajoActual } from '../../../demo/datos';

const PROBLEMAS: { tipo: TipoEstado; titulo: string; detalle: string; arreglo?: string }[] = [
  { tipo: 'alerta', titulo: `Pylint 6.8, y el mínimo es ${trabajoActual.minPylint}`, detalle: 'Faltan docstrings y hay variables sin usar en 4 archivos.', arreglo: 'pylint src/ --score=y' },
  { tipo: 'alerta', titulo: 'Black encontró 3 archivos sin formato', detalle: 'El flujo de GitHub Actions falló en el paso de formato.', arreglo: 'black .' },
  { tipo: 'tarde', titulo: 'Tu pareja aún no aprueba', detalle: 'Julián Arias debe dejar al menos dos comentarios en línea y aprobar.' },
  { tipo: 'info', titulo: 'No cambia tu versión entregada', detalle: 'Si empujas commits nuevos, vuelve a verificar para guardarlos como tu versión.' },
];

export function E29EntregaConProblemas() {
  return (
    <Pantalla clase="p-e29">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Entregas', ruta: '#/e5' }} kicker={`${trabajoActual.titulo} · ${trabajoActual.tema}`} titulo="Tu entrega necesita ajustes" subtitulo="No se perdió nada: arréglalo y vuelve a verificar antes del plazo." objeto="cuaderno" />
        <div className="contenido cuerpo-mundo panel">
          <div className="fallos__columnas">
            <Tarjeta tono="aviso" kicker="Plazo" titulo={trabajoActual.vence.largo} accion={<Estado tipo="tarde">Quedan 3 días</Estado>}>
              <p className="meta">camilo-r/trabajo-3 #1 sigue abierto. La verificación de hoy encontró 4 cosas para revisar.</p>
              <a className="boton boton--accent" href="#/e6">Volver a verificar</a>
            </Tarjeta>
            <div className="fallos__lado">
              {PROBLEMAS.map((problema) => (
                <Tarjeta key={problema.titulo} kicker={problema.tipo === 'alerta' ? 'Hay que arreglarlo' : problema.tipo === 'tarde' ? 'Falta alguien más' : 'Para tener en cuenta'} titulo={problema.titulo} accion={<Estado tipo={problema.tipo}>{problema.tipo === 'alerta' ? 'Falla' : problema.tipo === 'tarde' ? 'Pendiente' : 'Aviso'}</Estado>}>
                  <p className="meta">{problema.detalle}</p>
                  {problema.arreglo && <code className="comando">{problema.arreglo}</code>}
                </Tarjeta>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Después de arreglarlo', texto: 'Volver a verificar', ruta: '#/e6' }} />
    </Pantalla>
  );
}
