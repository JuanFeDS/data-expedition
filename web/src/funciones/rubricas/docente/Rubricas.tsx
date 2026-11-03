import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { useConfirmar } from '../../../compartido/estado/confirmar';
import { useCurso, useRutaCurso } from '../../../compartido/estado/curso';
import { Tarjeta } from '../../../compartido/ui/panel';
import { Selector } from '../../../compartido/ui/Selector';
import { Pantalla, Segmentado } from '../../../compartido/ui/ui';
import { useServicioRubricas, type Criterio, type DatosCriterio, type Dimension } from '../../../servicios/rubricas';
import { useServicioTrabajos, type ModoIa, type TrabajoCurso } from '../../../servicios/trabajos';

const MODOS: ModoIa[] = ['sin_ia', 'con_ia'];
const VACIOS: DatosCriterio['descriptores'] = ['', '', '', '', ''];

const nuevoCriterio = (trabajoId: string, dimensionId: string, modoIa: ModoIa): DatosCriterio => ({ trabajoId, dimensionId, modoIa, nombre: '', peso: 1, descriptores: [...VACIOS] as DatosCriterio['descriptores'] });

function EditorCriterio({ inicial, dimensiones, alGuardar, alCancelar }: { inicial: DatosCriterio; dimensiones: Dimension[]; alGuardar: (criterio: DatosCriterio) => Promise<void>; alCancelar: () => void }) {
  const [criterio, setCriterio] = useState(inicial);
  const [guardando, setGuardando] = useState(false);
  const valido = criterio.nombre.trim() !== '' && criterio.peso > 0 && criterio.descriptores.every((texto) => texto.trim() !== '');
  const cambiarDescriptor = (indice: number, texto: string) => setCriterio((actual) => ({ ...actual, descriptores: actual.descriptores.map((valor, posicion) => (posicion === indice ? texto : valor)) as DatosCriterio['descriptores'] }));

  return (
    <form className="d14__formulario rubrica__editor" onSubmit={(evento) => { evento.preventDefault(); if (!valido) return; setGuardando(true); void alGuardar({ ...criterio, nombre: criterio.nombre.trim() }).finally(() => setGuardando(false)); }}>
      <label className="d14__etiqueta">Nombre del criterio<input className="d13__campo" value={criterio.nombre} onChange={(evento) => setCriterio({ ...criterio, nombre: evento.target.value })} placeholder="Transformaciones con PySpark" /></label>
      <div className="d14__par">
        <div className="d14__etiqueta">Dimensión<Selector valor={criterio.dimensionId} opciones={dimensiones.map((dimension) => ({ valor: dimension.id, etiqueta: dimension.nombre }))} alCambiar={(dimensionId) => setCriterio({ ...criterio, dimensionId })} etiqueta="Dimensión" /></div>
        <label className="d14__etiqueta">Peso<input className="d13__campo" type="number" min={0.5} step={0.5} value={criterio.peso} onChange={(evento) => setCriterio({ ...criterio, peso: Number(evento.target.value) })} /></label>
      </div>
      {criterio.descriptores.map((texto, indice) => (
        <label className="d14__etiqueta" key={indice}>Nivel {indice + 1}
          <textarea className="d13__campo rubrica__nivel" rows={2} value={texto} onChange={(evento) => cambiarDescriptor(indice, evento.target.value)} placeholder={indice === 0 ? 'Qué se ve cuando todavía no lo logra' : indice === 4 ? 'Qué se ve cuando lo domina' : ''} />
        </label>
      ))}
      <div className="d13__fila">
        <button className="acceso__boton acceso__boton--principal" disabled={!valido || guardando}>{guardando ? 'Guardando…' : 'Guardar criterio'}</button>
        <button type="button" className="acceso__boton" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export function D10Rubricas() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const confirmar = useConfirmar();
  const rubricas = useServicioRubricas();
  const trabajosServicio = useServicioTrabajos();
  const [dimensiones, setDimensiones] = useState<Dimension[]>([]);
  const [trabajos, setTrabajos] = useState<TrabajoCurso[]>([]);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [trabajoId, setTrabajoId] = useState<string>('');
  const [modo, setModo] = useState(0);
  const [editando, setEditando] = useState<string | 'nuevo' | null>(null);
  const [nombreDimension, setNombreDimension] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  const cargarCurso = useCallback(async () => {
    if (!curso) return;
    try {
      const [dims, lista] = await Promise.all([rubricas.dimensiones(curso.id), trabajosServicio.cargarTrabajos(curso.id)]);
      setDimensiones(dims);
      setTrabajos(lista);
      setTrabajoId((actual) => (lista.some((trabajo) => trabajo.id === actual) ? actual : (lista[0]?.id ?? '')));
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [curso, rubricas, trabajosServicio]);

  const cargarCriterios = useCallback(async () => {
    if (!trabajoId) { setCriterios([]); return; }
    try {
      setCriterios(await rubricas.criterios(trabajoId));
    } catch {
      setFallo(true);
    }
  }, [trabajoId, rubricas]);

  useEffect(() => { void cargarCurso(); }, [cargarCurso]);
  useEffect(() => { void cargarCriterios(); }, [cargarCriterios]);

  const modoIa = MODOS[modo];
  const delModo = criterios.filter((criterio) => criterio.modoIa === modoIa);
  const pesoTotal = delModo.reduce((suma, criterio) => suma + criterio.peso, 0);
  const nombreDimension_ = (id: string) => dimensiones.find((dimension) => dimension.id === id)?.nombre ?? '—';

  const agregarDimension = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!curso || !nombreDimension.trim()) return;
    const error = await rubricas.crearDimension(curso.id, nombreDimension.trim(), '', (dimensiones.at(-1)?.orden ?? 0) + 1);
    setAviso(error);
    if (!error) setNombreDimension('');
    await cargarCurso();
  };

  const quitarDimension = async (dimension: Dimension) => {
    const aceptado = await confirmar({ titulo: '¿Quitar la dimensión?', texto: `«${dimension.nombre}» dejará de estar disponible. Solo se puede si ningún criterio ni evidencia la usa.`, confirmar: 'Quitar dimensión' });
    if (!aceptado) return;
    setAviso(await rubricas.eliminarDimension(dimension.id));
    await cargarCurso();
  };

  const traerPlantilla = async () => {
    if (!curso) return;
    setAviso(await rubricas.cargarPlantilla(curso.id));
    await cargarCurso();
  };

  const guardar = async (criterio: DatosCriterio) => {
    const error = await rubricas.guardarCriterio(criterio);
    setAviso(error);
    if (!error) setEditando(null);
    await cargarCriterios();
  };

  const quitarCriterio = async (criterio: Criterio) => {
    const aceptado = await confirmar({ titulo: '¿Quitar el criterio?', texto: `«${criterio.nombre}» se borra de esta rúbrica. Solo se puede si aún no hay calificaciones con él.`, confirmar: 'Quitar criterio' });
    if (!aceptado) return;
    setAviso(await rubricas.eliminarCriterio(criterio.id));
    await cargarCriterios();
  };

  return (
    <Pantalla rol="docente" clase="p-d10">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker={curso?.nombre ?? 'Curso'} titulo="Rúbricas" subtitulo="Las dimensiones del radar y los criterios con que calificas cada trabajo." objeto="compas" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar las rúbricas. <button onClick={() => void cargarCurso()}>Reintentar</button></p>}
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          <div className="d13__columnas">
            <Tarjeta kicker="Radar" titulo="Dimensiones">
              <ul className="d13__personas">
                {dimensiones.map((dimension) => (
                  <li key={dimension.id}>
                    <span className="d13__datos"><strong>{dimension.nombre}</strong></span>
                    <button className="d13__quitar" aria-label={`Quitar ${dimension.nombre}`} onClick={() => void quitarDimension(dimension)}>Quitar</button>
                  </li>
                ))}
                {dimensiones.length === 0 && <li><span className="d13__datos"><small>Este curso aún no tiene dimensiones.</small></span></li>}
              </ul>
              {dimensiones.length === 0 && <button className="acceso__boton acceso__boton--principal" onClick={() => void traerPlantilla()}>Cargar las dimensiones de la plantilla</button>}
              <form className="d13__fila rubrica__nueva" onSubmit={(evento) => void agregarDimension(evento)}>
                <input className="d13__campo" placeholder="Nueva dimensión" value={nombreDimension} onChange={(evento) => setNombreDimension(evento.target.value)} aria-label="Nombre de la dimensión" />
                <button className="acceso__boton" disabled={!nombreDimension.trim()}>Agregar</button>
              </form>
            </Tarjeta>
            <Tarjeta kicker="Por trabajo" titulo="Rúbrica">
              {trabajos.length === 0 ? (
                <p className="meta">Primero publica los trabajos en <a href={rutaCurso('#/d14')}><u>Trabajos</u></a>.</p>
              ) : (
                <>
                  <Selector valor={trabajoId} opciones={trabajos.map((trabajo) => ({ valor: trabajo.id, etiqueta: trabajo.nombre }))} alCambiar={(id) => { setTrabajoId(id); setEditando(null); }} etiqueta="Trabajo" />
                  <Segmentado opciones={['Sin IA', 'Con IA']} activa={modo} alCambiar={(valor) => { setModo(valor); setEditando(null); }} />
                  <p className="meta">Criterios que se usan cuando la entrega se declara <b>{modo === 0 ? 'sin IA' : 'con IA'}</b>. Peso total: <b>{pesoTotal}</b>.</p>
                  <ul className="d13__personas">
                    {delModo.map((criterio) => (
                      <li key={criterio.id}>
                        {editando === criterio.id ? (
                          <EditorCriterio inicial={criterio} dimensiones={dimensiones} alGuardar={guardar} alCancelar={() => setEditando(null)} />
                        ) : (
                          <>
                            <span className="d13__datos"><strong>{criterio.nombre}</strong><small>{nombreDimension_(criterio.dimensionId)} · peso {criterio.peso}</small></span>
                            <button className="cursos__secundaria" onClick={() => setEditando(criterio.id)}>Editar</button>
                            <button className="d13__quitar" aria-label={`Quitar ${criterio.nombre}`} onClick={() => void quitarCriterio(criterio)}>Quitar</button>
                          </>
                        )}
                      </li>
                    ))}
                    {delModo.length === 0 && editando !== 'nuevo' && <li><span className="d13__datos"><small>Aún no hay criterios para este caso.</small></span></li>}
                  </ul>
                  {editando === 'nuevo' ? (
                    dimensiones.length > 0 && <EditorCriterio inicial={nuevoCriterio(trabajoId, dimensiones[0].id, modoIa)} dimensiones={dimensiones} alGuardar={guardar} alCancelar={() => setEditando(null)} />
                  ) : (
                    <button className="acceso__boton acceso__boton--principal" disabled={dimensiones.length === 0} onClick={() => setEditando('nuevo')}>Agregar criterio</button>
                  )}
                  {dimensiones.length === 0 && <small className="d13__nota">Necesitas al menos una dimensión para crear criterios.</small>}
                </>
              )}
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
