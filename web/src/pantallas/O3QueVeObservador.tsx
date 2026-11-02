import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Estado, Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';

const VE = ['Resultados agregados por grupo, dimensión y trabajo', 'Cuántos entregan a tiempo y cómo se reparten las notas', 'El avance del radar promedio frente al punto de partida', 'El resumen general de cada grupo, si tiene 5 personas o más'];
const NO_VE = ['Nombres, correos ni identificadores de estudiantes', 'Bitácoras, textos de entregas, comentarios ni votos individuales', 'Datos de un grupo con menos de 5 personas', 'Cambios entre un día y otro que permitan deducir a alguien'];

export function O3QueVeObservador() {
  return (
    <Pantalla rol="observador" clase="p-o3">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Privacidad" titulo="Qué puedes ver" subtitulo="El anonimato lo garantiza la base de datos, no esta pantalla." objeto="carta" />
        <div className="contenido cuerpo-mundo panel">
          <div className="o3__columnas">
            <Tarjeta tono="menta" kicker="Sí" titulo="Lo que ves" accion={<Estado tipo="ok">Permitido</Estado>}>
              <ul className="o3__lista">{VE.map((texto) => <li key={texto}><i aria-hidden="true">✓</i>{texto}</li>)}</ul>
            </Tarjeta>
            <Tarjeta kicker="No" titulo="Lo que no ves" accion={<Estado tipo="alerta">Protegido</Estado>}>
              <ul className="o3__lista o3__lista--no">{NO_VE.map((texto) => <li key={texto}><i aria-hidden="true">✕</i>{texto}</li>)}</ul>
              <p className="meta">Ley 1581 de 2012: se guarda lo mínimo, con finalidad informada y acceso por rol.</p>
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Datos agregados', texto: 'Volver al resumen', ruta: '#/o1' }} />
    </Pantalla>
  );
}
