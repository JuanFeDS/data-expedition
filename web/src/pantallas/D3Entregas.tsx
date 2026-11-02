import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Estado, Tabla, Tarjeta, type TipoEstado } from '../componentes/panel';
import { Pantalla, Segmentado } from '../componentes/ui';
import { trabajoActual } from '../datos';
import { estudiantes, textoEntrega, type EstadoEntrega } from '../datosPlan';

const TIPO: Record<EstadoEntrega, TipoEstado> = { sin_cargar: 'alerta', cargada: 'info', aprobada: 'ok', fusionada: 'ok', fusion_propia: 'alerta' };

export function D3Entregas() {
  const [grupo, setGrupo] = useState(2);
  const lista = estudiantes.filter((estudiante) => grupo === 0 || estudiante.grupo === grupo);
  const faltan = estudiantes.filter((estudiante) => estudiante.entrega === 'sin_cargar');
  return (
    <Pantalla rol="docente" clase="p-d3">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker={`${trabajoActual.titulo} · ${trabajoActual.tema}`} titulo="Entregas" subtitulo={`Vence el ${trabajoActual.vence.largo}. Mínimo de Pylint: ${trabajoActual.minPylint}.`} objeto="cuaderno" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Todos', 'Grupo 1', 'Grupo 2', 'Grupo 3']} activa={grupo} alCambiar={setGrupo} />
          <div className="d3__columnas">
            <Tarjeta kicker={grupo === 0 ? 'Todos los grupos' : `Grupo ${grupo}`} titulo={`${lista.length} estudiantes`}>
              <Tabla
                etiqueta="Entregas del trabajo en curso"
                columnas={[{ clave: 'nombre', titulo: 'Estudiante', ancho: '1.3fr' }, { clave: 'estado', titulo: 'Estado', ancho: '1.4fr' }, { clave: 'pylint', titulo: 'Pylint', ancho: '70px' }, { clave: 'pareja', titulo: 'Pareja', ancho: '1fr' }, { clave: 'accion', titulo: '', ancho: '90px' }]}
                filas={lista.map((estudiante) => ({
                  nombre: <>{estudiante.nombre}{estudiante.tarde && <Estado tipo="tarde">Tarde</Estado>}</>,
                  estado: <Estado tipo={TIPO[estudiante.entrega]}>{textoEntrega[estudiante.entrega]}</Estado>,
                  pylint: estudiante.pylint === null ? '—' : <b className={estudiante.pylint < trabajoActual.minPylint ? 'd3__bajo' : ''}>{estudiante.pylint}</b>,
                  pareja: estudiante.pareja,
                  accion: estudiante.entrega === 'sin_cargar' ? <span className="d3__nada">Sin PR</span> : <a className="boton boton--suave" href="#/d4">Corregir</a>,
                }))}
              />
            </Tarjeta>
            <Tarjeta tono="aviso" kicker="Sin cargar" titulo={`${faltan.length} estudiantes`}>
              <ul className="d3__faltan">{faltan.map((estudiante) => <li key={estudiante.id}><span className="avatar avatar--verde">{estudiante.iniciales}</span><div><strong>{estudiante.nombre}</strong><small>Grupo {estudiante.grupo}{estudiante.tarde ? ' · última entrega tarde' : ''}</small></div></li>)}</ul>
              <a className="boton boton--accent" href="#/d5">Enviar encuesta de seguimiento</a>
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: `${faltan.length} sin cargar`, texto: 'Enviar seguimiento', ruta: '#/d5' }} />
    </Pantalla>
  );
}
