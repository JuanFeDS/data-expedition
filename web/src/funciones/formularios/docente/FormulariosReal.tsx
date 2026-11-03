import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { ResultadosFormulario, useResultados } from '../comun/ResultadosFormulario';
import { Selector } from '../../../compartido/ui/Selector';
import { useConfirmar } from '../../../compartido/estado/confirmar';
import { useCurso, useRutaCurso } from '../../../compartido/estado/curso';
import { Estado, Tarjeta, type TipoEstado } from '../../../compartido/ui/panel';
import { Pantalla } from '../../../compartido/ui/ui';
import {
  abrirFormulario, cerrarFormulario, crearFormulario, eliminarFormulario, listarFormularios,
  type EstadoFormulario, type Formulario, type PreguntaNueva, type TipoFormulario, type TipoPregunta,
} from '../../../servicios/formularios';

const NOMBRE_TIPO: Record<TipoFormulario, string> = { relampago: 'Relámpago', votacion: 'Votación', encuesta: 'Encuesta' };
const TIPO_ESTADO: Record<EstadoFormulario, TipoEstado> = { borrador: 'info', abierto: 'ok', cerrado: 'pendiente' };
const NOMBRE_ESTADO: Record<EstadoFormulario, string> = { borrador: 'Borrador', abierto: 'Abierto', cerrado: 'Cerrado' };
const NOMBRE_PREGUNTA: Record<TipoPregunta, string> = { opcion: 'Opción múltiple', escala: 'Escala 1–5', texto: 'Texto libre' };
const LETRAS = 'ABCDEFGH';

interface BorradorPregunta { tipo: TipoPregunta; enunciado: string; opciones: string; correcta: number | null }
const preguntaVacia = (tipo: TipoPregunta = 'opcion'): BorradorPregunta => ({ tipo, enunciado: '', opciones: '', correcta: null });
const listaOpciones = (texto: string) => texto.split('\n').map((linea) => linea.trim()).filter(Boolean);

function Constructor({ alCrear, alCancelar }: { alCrear: (tipo: TipoFormulario, titulo: string, anonimo: boolean, mostrar: boolean, duracion: number | null, preguntas: PreguntaNueva[]) => Promise<void>; alCancelar: () => void }) {
  const [tipo, setTipo] = useState<TipoFormulario>('relampago');
  const [titulo, setTitulo] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [mostrar, setMostrar] = useState(true);
  const [duracion, setDuracion] = useState(60);
  const [preguntas, setPreguntas] = useState<BorradorPregunta[]>([preguntaVacia()]);
  const [guardando, setGuardando] = useState(false);

  const soloUna = tipo !== 'encuesta';
  const cambiarTipo = (nuevo: TipoFormulario) => {
    setTipo(nuevo);
    if (nuevo === 'relampago') setAnonimo(false);
    if (nuevo !== 'encuesta') setPreguntas((actuales) => [{ ...actuales[0], tipo: 'opcion' }]);
  };
  const editar = (indice: number, cambios: Partial<BorradorPregunta>) => setPreguntas((actuales) => actuales.map((pregunta, posicion) => (posicion === indice ? { ...pregunta, ...cambios } : pregunta)));

  const valida = titulo.trim() !== '' && preguntas.every((pregunta) => pregunta.enunciado.trim() !== '' && (pregunta.tipo !== 'opcion' || listaOpciones(pregunta.opciones).length >= 2) && (tipo !== 'relampago' || (pregunta.correcta !== null && pregunta.correcta < listaOpciones(pregunta.opciones).length)));

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!valida) return;
    setGuardando(true);
    const nuevas: PreguntaNueva[] = preguntas.map((pregunta) => ({ tipo: pregunta.tipo, enunciado: pregunta.enunciado.trim(), opciones: pregunta.tipo === 'opcion' ? listaOpciones(pregunta.opciones) : [], correcta: tipo === 'relampago' ? pregunta.correcta : null }));
    void alCrear(tipo, titulo.trim(), anonimo, mostrar, tipo === 'relampago' ? duracion : null, nuevas).finally(() => setGuardando(false));
  };

  return (
    <Tarjeta kicker="Nuevo" titulo="Crear un formulario">
      <form className="d14__formulario" onSubmit={enviar}>
        <div className="diag__chips" role="radiogroup" aria-label="Tipo">
          {(Object.keys(NOMBRE_TIPO) as TipoFormulario[]).map((opcion) => <button type="button" key={opcion} role="radio" aria-checked={tipo === opcion} className="diag__chip" aria-pressed={tipo === opcion} onClick={() => cambiarTipo(opcion)}>{NOMBRE_TIPO[opcion]}</button>)}
        </div>
        <label className="d14__etiqueta">Título<input className="d13__campo" value={titulo} onChange={(evento) => setTitulo(evento.target.value)} placeholder={tipo === 'encuesta' ? 'Pulso semanal · semana 4' : '¿Qué es una acción en Spark?'} /></label>
        {preguntas.map((pregunta, indice) => (
          <div className="rubrica__editor" key={indice}>
            {!soloUna && (
              <div className="diag__chips" role="radiogroup" aria-label="Tipo de pregunta">
                {(Object.keys(NOMBRE_PREGUNTA) as TipoPregunta[]).map((opcion) => <button type="button" key={opcion} role="radio" aria-checked={pregunta.tipo === opcion} className="diag__chip" aria-pressed={pregunta.tipo === opcion} onClick={() => editar(indice, { tipo: opcion })}>{NOMBRE_PREGUNTA[opcion]}</button>)}
              </div>
            )}
            <label className="d14__etiqueta">Pregunta {preguntas.length > 1 ? indice + 1 : ''}<input className="d13__campo" value={pregunta.enunciado} onChange={(evento) => editar(indice, { enunciado: evento.target.value })} /></label>
            {pregunta.tipo === 'opcion' && (
              <>
                <label className="d14__etiqueta">Opciones, una por línea<textarea className="d13__campo rubrica__nivel" rows={4} value={pregunta.opciones} onChange={(evento) => editar(indice, { opciones: evento.target.value })} placeholder={'filter()\ncount()\nselect()'} /></label>
                {tipo === 'relampago' && (
                  <div className="d14__etiqueta">Respuesta correcta
                    <Selector valor={pregunta.correcta === null ? '' : String(pregunta.correcta)} opciones={listaOpciones(pregunta.opciones).map((opcion, posicion) => ({ valor: String(posicion), etiqueta: `${LETRAS[posicion]} · ${opcion}` }))} alCambiar={(valor) => editar(indice, { correcta: Number(valor) })} etiqueta="Respuesta correcta" />
                  </div>
                )}
              </>
            )}
            {!soloUna && preguntas.length > 1 && <button type="button" className="d13__quitar" onClick={() => setPreguntas((actuales) => actuales.filter((_, posicion) => posicion !== indice))}>Quitar pregunta</button>}
          </div>
        ))}
        {!soloUna && <button type="button" className="cursos__secundaria" onClick={() => setPreguntas((actuales) => [...actuales, preguntaVacia('escala')])}>Agregar pregunta</button>}
        <div className="d5__opciones">
          {tipo === 'relampago' && <label>Segundos para responder <input className="d13__campo" type="number" min={10} max={3600} value={duracion} onChange={(evento) => setDuracion(Number(evento.target.value))} /></label>}
          <label><input type="checkbox" checked={tipo === 'relampago' ? false : anonimo} disabled={tipo === 'relampago'} onChange={(evento) => setAnonimo(evento.target.checked)} /> Anónima {tipo === 'relampago' && <small>(el XP exige identificar)</small>}</label>
          <label><input type="checkbox" checked={mostrar} onChange={(evento) => setMostrar(evento.target.checked)} /> Mostrar el resultado a los estudiantes</label>
        </div>
        <div className="d13__fila">
          <button className="acceso__boton acceso__boton--principal" disabled={!valida || guardando}>{guardando ? 'Guardando…' : 'Crear formulario'}</button>
          <button type="button" className="acceso__boton" onClick={alCancelar}>Cancelar</button>
        </div>
      </form>
    </Tarjeta>
  );
}

export function D5FormulariosReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const confirmar = useConfirmar();
  const [formularios, setFormularios] = useState<Formulario[] | null>(null);
  const [creando, setCreando] = useState(false);
  const [vistoId, setVistoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);
  const visto = formularios?.find((formulario) => formulario.id === vistoId) ?? null;
  const { resultados, fallo: falloResultados } = useResultados(vistoId, visto?.estado === 'abierto');

  const cargar = useCallback(async () => {
    if (!curso) return;
    try {
      setFormularios(await listarFormularios(curso.id));
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [curso]);

  useEffect(() => { void cargar(); }, [cargar]);

  const crear = async (tipo: TipoFormulario, titulo: string, anonimo: boolean, mostrarResultado: boolean, duracionSegundos: number | null, preguntas: PreguntaNueva[]) => {
    if (!curso) return;
    const error = await crearFormulario(curso.id, { tipo, titulo, anonimo, mostrarResultado, duracionSegundos, preguntas });
    setAviso(error);
    if (!error) setCreando(false);
    await cargar();
  };

  const abrir = async (formulario: Formulario) => {
    if (!curso) return;
    setAviso(await abrirFormulario(curso.id, formulario.id));
    await cargar();
  };

  const cerrar = async (formulario: Formulario) => {
    if (!curso) return;
    setAviso(await cerrarFormulario(curso.id, formulario.id));
    await cargar();
  };

  const eliminar = async (formulario: Formulario) => {
    const aceptado = await confirmar({ titulo: '¿Eliminar el formulario?', texto: `«${formulario.titulo}» y sus ${formulario.participantes} respuestas se borran para siempre.`, confirmar: 'Eliminar formulario' });
    if (!aceptado) return;
    setAviso(await eliminarFormulario(formulario.id));
    if (vistoId === formulario.id) setVistoId(null);
    await cargar();
  };

  return (
    <Pantalla rol="docente" clase="p-d5">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Encuestas, votaciones y relámpagos" titulo="Formularios" subtitulo="Un solo módulo para los tres usos." objeto="carta" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar los formularios. <button onClick={() => void cargar()}>Reintentar</button></p>}
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          <div className="d5__columnas">
            <div className="d5__lado">
              {creando ? (
                <Constructor alCrear={crear} alCancelar={() => setCreando(false)} />
              ) : (
                <Tarjeta kicker={`${formularios?.length ?? 0} formularios`} titulo="Del curso" accion={<button className="acceso__boton acceso__boton--principal" onClick={() => setCreando(true)}>Crear</button>}>
                  <ul className="d13__personas">
                    {formularios?.map((formulario) => (
                      <li key={formulario.id}>
                        <span className="d13__datos">
                          <strong>{formulario.titulo}</strong>
                          <small>{NOMBRE_TIPO[formulario.tipo]}{formulario.anonimo ? ' · anónima' : ''} · {formulario.participantes} {formulario.participantes === 1 ? 'respuesta' : 'respuestas'}</small>
                        </span>
                        <Estado tipo={TIPO_ESTADO[formulario.estado]}>{NOMBRE_ESTADO[formulario.estado]}</Estado>
                        {formulario.estado === 'abierto' ? <button className="cursos__secundaria" onClick={() => void cerrar(formulario)}>Cerrar</button> : <button className="cursos__secundaria" onClick={() => void abrir(formulario)}>{formulario.estado === 'cerrado' ? 'Reabrir' : 'Abrir'}</button>}
                        <button className="cursos__secundaria" onClick={() => setVistoId(formulario.id === vistoId ? null : formulario.id)}>{formulario.id === vistoId ? 'Ocultar' : 'Resultados'}</button>
                        <button className="d13__quitar" aria-label={`Eliminar ${formulario.titulo}`} onClick={() => void eliminar(formulario)}>Eliminar</button>
                      </li>
                    ))}
                    {formularios?.length === 0 && <li><span className="d13__datos"><small>Aún no hay formularios. Crea el primero con el botón Crear.</small></span></li>}
                  </ul>
                </Tarjeta>
              )}
            </div>
            {visto && (
              <div className="d5__lado">
                <Tarjeta tono="oscura" kicker={visto.estado === 'abierto' ? 'En vivo' : 'Resultados'} titulo={visto.titulo} accion={<Estado tipo={TIPO_ESTADO[visto.estado]}>{NOMBRE_ESTADO[visto.estado]}</Estado>}>
                  <ResultadosFormulario resultados={resultados} fallo={falloResultados} />
                </Tarjeta>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Abrir y proyectar', texto: 'Ir a En clase', ruta: rutaCurso('#/d11') ?? '#/d11' }} />
    </Pantalla>
  );
}
