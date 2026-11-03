import { useState } from 'react';
import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { BarraDato, Estado, Tabla, Tarjeta, type TipoEstado } from '../../../../compartido/ui/panel';
import { Pantalla, Segmentado } from '../../../../compartido/ui/ui';
import { formularios, type TipoFormulario } from '../../../datosPlan';

const TIPO_ESTADO: Record<string, TipoEstado> = { abierto: 'ok', cerrado: 'pendiente', borrador: 'info', programado: 'tarde' };
const TIPOS: TipoFormulario[] = ['Encuesta', 'Votación', 'Relámpago'];
const RESULTADOS = [{ opcion: 'count()', votos: 14 }, { opcion: 'filter()', votos: 4 }, { opcion: 'select()', votos: 2 }, { opcion: 'withColumn()', votos: 1 }];

export function D5FormulariosEjemplo() {
  const [vista, setVista] = useState(0);
  const [tipo, setTipo] = useState<TipoFormulario>('Relámpago');
  const [anonimo, setAnonimo] = useState(false);
  const [intento, setIntento] = useState(true);
  const [creado, setCreado] = useState(false);

  return (
    <Pantalla rol="docente" clase="p-d5">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Encuestas, votaciones y relámpago" titulo="Formularios" subtitulo="Un solo módulo para los tres usos." objeto="carta" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Mis formularios', 'Crear uno']} activa={vista} alCambiar={setVista} />
          <div className="d5__columnas">
            <Tarjeta clase={vista === 0 ? '' : 'vista--off'} kicker={`${formularios.length} formularios`} titulo="Edición actual">
              <Tabla
                etiqueta="Formularios del curso"
                columnas={[{ clave: 'nombre', titulo: 'Formulario', ancho: '2fr' }, { clave: 'tipo', titulo: 'Tipo', ancho: '110px' }, { clave: 'estado', titulo: 'Estado', ancho: '110px' }, { clave: 'resp', titulo: 'Respuestas', ancho: '90px' }]}
                filas={formularios.map((formulario) => ({
                  nombre: <>{formulario.nombre}<small className="d5__cuando">{formulario.cuando}{formulario.anonimo ? ' · anónima' : ''}</small></>,
                  tipo: formulario.tipo,
                  estado: <Estado tipo={TIPO_ESTADO[formulario.estado]}>{formulario.estado}</Estado>,
                  resp: formulario.respuestas || '—',
                }))}
              />
            </Tarjeta>
            <div className={`d5__lado ${vista === 1 ? '' : 'vista--off'}`}>
              <Tarjeta kicker="Nuevo" titulo="Crear en un minuto" accion={creado ? <Estado tipo="ok">Creado</Estado> : null}>
                <div className="campo"><label htmlFor="preguntas">Pega las preguntas, una por línea</label><textarea id="preguntas" rows={3} placeholder="¿En Spark, cuál de estas es una acción? (filter, select, count*)" /></div>
                <div className="diag__chips" role="radiogroup" aria-label="Tipo">
                  {TIPOS.map((opcion) => <button key={opcion} role="radio" aria-checked={tipo === opcion} className="diag__chip" aria-pressed={tipo === opcion} onClick={() => setTipo(opcion)}>{opcion}</button>)}
                </div>
                <div className="d5__opciones">
                  <label><input type="checkbox" checked={tipo === 'Relámpago' ? false : anonimo} disabled={tipo === 'Relámpago'} onChange={(evento) => setAnonimo(evento.target.checked)} /> Anónima {tipo === 'Relámpago' && <small>(no aplica: el XP exige identificar)</small>}</label>
                  <label><input type="checkbox" checked={intento} onChange={(evento) => setIntento(evento.target.checked)} /> Un solo intento</label>
                  <label><input type="checkbox" defaultChecked /> Mostrar el resultado al cerrar</label>
                </div>
                <div className="acciones"><button className="boton boton--accent" onClick={() => setCreado(true)}>Crear y obtener QR</button><button className="boton boton--suave">Usar una plantilla</button></div>
              </Tarjeta>
              <Tarjeta tono="oscura" kicker="En vivo · relámpago S8" titulo="21 respuestas" accion={<Estado tipo="ok">Abierto</Estado>}>
                {RESULTADOS.map((resultado) => <BarraDato key={resultado.opcion} etiqueta={resultado.opcion} valor={Math.round((resultado.votos / 21) * 100)} tono={resultado.opcion === 'count()' ? undefined : 'azul'} />)}
              </Tarjeta>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Relámpago abierto', texto: 'Ver en clase', ruta: '#/d11' }} />
    </Pantalla>
  );
}

