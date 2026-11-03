import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { Selector } from '../../../compartido/ui/Selector';
import { useConfirmar } from '../../../compartido/estado/confirmar';
import { useCurso } from '../../../compartido/estado/curso';
import { Dato, Estado, Tarjeta } from '../../../compartido/ui/panel';
import { Pantalla, Segmentado } from '../../../compartido/ui/ui';
import { eliminarRecurso, guardarRecurso, listarRecursos, listarSesiones, verificarRecurso, type DatosRecurso, type Idioma, type Recurso, type Sesion } from '../../../servicios/calendario';

const FILTROS = ['Todos', 'Por verificar', 'En inglés'];
const SIN_SESION = '__ninguna';

const nuevo = (): DatosRecurso => ({ sesionId: null, titulo: '', enlace: '', tipo: '', idioma: 'ES', gratis: true, resumen: '', glosario: [] });

function EditorRecurso({ inicial, sesiones, alGuardar, alCancelar }: { inicial: DatosRecurso; sesiones: Sesion[]; alGuardar: (datos: DatosRecurso) => Promise<void>; alCancelar: () => void }) {
  const [datos, setDatos] = useState(inicial);
  const [glosario, setGlosario] = useState(inicial.glosario.join('\n'));
  const [guardando, setGuardando] = useState(false);
  const valido = datos.titulo.trim() !== '' && (datos.enlace === '' || /^https?:\/\//i.test(datos.enlace.trim()));
  return (
    <form className="d14__formulario rubrica__editor" onSubmit={(evento) => { evento.preventDefault(); if (!valido) return; setGuardando(true); void alGuardar({ ...datos, titulo: datos.titulo.trim(), enlace: datos.enlace.trim(), glosario: glosario.split('\n').map((linea) => linea.trim()).filter(Boolean) }).finally(() => setGuardando(false)); }}>
      <label className="d14__etiqueta">Título<input className="d13__campo" value={datos.titulo} onChange={(evento) => setDatos({ ...datos, titulo: evento.target.value })} /></label>
      <label className="d14__etiqueta">Enlace<input className="d13__campo" type="url" value={datos.enlace} onChange={(evento) => setDatos({ ...datos, enlace: evento.target.value })} placeholder="https://" /></label>
      <div className="d14__par">
        <label className="d14__etiqueta">Tipo<input className="d13__campo" value={datos.tipo} onChange={(evento) => setDatos({ ...datos, tipo: evento.target.value })} placeholder="Video, lectura, documentación…" /></label>
        <div className="d14__etiqueta">Sesión
          <Selector valor={datos.sesionId ?? SIN_SESION} opciones={[{ valor: SIN_SESION, etiqueta: 'Sin sesión' }, ...sesiones.map((sesion) => ({ valor: sesion.id, etiqueta: `${sesion.codigo} · ${sesion.tema}` }))]} alCambiar={(valor) => setDatos({ ...datos, sesionId: valor === SIN_SESION ? null : valor })} etiqueta="Sesión" />
        </div>
      </div>
      <div className="diag__chips" role="radiogroup" aria-label="Idioma">
        {(['ES', 'EN'] as Idioma[]).map((idioma) => <button type="button" key={idioma} role="radio" aria-checked={datos.idioma === idioma} className="diag__chip" aria-pressed={datos.idioma === idioma} onClick={() => setDatos({ ...datos, idioma })}>{idioma === 'ES' ? 'Español' : 'Inglés [EN]'}</button>)}
      </div>
      <div className="d5__opciones"><label><input type="checkbox" checked={datos.gratis} onChange={(evento) => setDatos({ ...datos, gratis: evento.target.checked })} /> Es gratis</label></div>
      {datos.idioma === 'EN' && (
        <>
          <label className="d14__etiqueta">Resumen en español<textarea className="d13__campo rubrica__nivel" rows={3} value={datos.resumen} onChange={(evento) => setDatos({ ...datos, resumen: evento.target.value })} /></label>
          <label className="d14__etiqueta">Glosario, un término por línea<textarea className="d13__campo rubrica__nivel" rows={3} value={glosario} onChange={(evento) => setGlosario(evento.target.value)} placeholder="shuffle: movimiento de datos entre particiones" /></label>
        </>
      )}
      {datos.enlace !== '' && !/^https?:\/\//i.test(datos.enlace.trim()) && <small className="acceso__error">El enlace debe empezar por http:// o https://</small>}
      <div className="d13__fila">
        <button className="acceso__boton acceso__boton--principal" disabled={!valido || guardando}>{guardando ? 'Guardando…' : 'Guardar recurso'}</button>
        <button type="button" className="acceso__boton" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export function D9MaterialReal() {
  const { curso } = useCurso();
  const confirmar = useConfirmar();
  const [recursos, setRecursos] = useState<Recurso[] | null>(null);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [filtro, setFiltro] = useState(0);
  const [editando, setEditando] = useState<DatosRecurso | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  const cargar = useCallback(async () => {
    if (!curso) return;
    try {
      const [lista, deSesiones] = await Promise.all([listarRecursos(curso.id), listarSesiones(curso.id)]);
      setRecursos(lista);
      setSesiones(deSesiones);
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [curso]);

  useEffect(() => { void cargar(); }, [cargar]);

  const guardar = async (datos: DatosRecurso) => {
    if (!curso) return;
    const error = await guardarRecurso(curso.id, datos);
    setAviso(error);
    if (!error) setEditando(null);
    await cargar();
  };

  const alternar = async (recurso: Recurso) => {
    setAviso(await verificarRecurso(recurso.id, recurso.verificadoEn === null));
    await cargar();
  };

  const quitar = async (recurso: Recurso) => {
    const aceptado = await confirmar({ titulo: '¿Quitar el recurso?', texto: `«${recurso.titulo}» se borra del material del curso.`, confirmar: 'Quitar recurso' });
    if (!aceptado) return;
    setAviso(await eliminarRecurso(recurso.id));
    await cargar();
  };

  const todos = recursos ?? [];
  const lista = todos.filter((recurso) => (filtro === 1 ? recurso.verificadoEn === null : filtro === 2 ? recurso.idioma === 'EN' : true));
  const porVerificar = todos.filter((recurso) => recurso.verificadoEn === null).length;
  const sesionDe = (recurso: Recurso) => sesiones.find((sesion) => sesion.id === recurso.sesionId)?.codigo ?? 'Sin sesión';

  return (
    <Pantalla rol="docente" clase="p-d9">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Recursos por sesión" titulo="Material" subtitulo="Cada recurso guarda su idioma y su estado de verificación." objeto="cuaderno" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar el material. <button onClick={() => void cargar()}>Reintentar</button></p>}
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          <div className="d9__datos rejilla rejilla--3">
            <Tarjeta><Dato valor={todos.length} etiqueta="Recursos" nota="En todo el curso" /></Tarjeta>
            <Tarjeta><Dato valor={porVerificar} etiqueta="Por verificar" nota="Antes de preparar la clase" tono={porVerificar > 0 ? 'alerta' : undefined} /></Tarjeta>
            <Tarjeta><Dato valor={todos.filter((recurso) => recurso.idioma === 'EN').length} etiqueta="En inglés [EN]" nota="Con resumen y glosario en español" /></Tarjeta>
          </div>
          <Segmentado opciones={FILTROS} activa={filtro} alCambiar={setFiltro} />
          <Tarjeta kicker={`${lista.length} recursos`} titulo="Lista" accion={editando === null ? <button className="acceso__boton acceso__boton--principal" onClick={() => setEditando(nuevo())}>Agregar recurso</button> : null}>
            {editando && !editando.id && <EditorRecurso inicial={editando} sesiones={sesiones} alGuardar={guardar} alCancelar={() => setEditando(null)} />}
            <ul className="d13__personas">
              {lista.map((recurso) => (
                <li key={recurso.id}>
                  {editando?.id === recurso.id ? (
                    <EditorRecurso inicial={editando} sesiones={sesiones} alGuardar={guardar} alCancelar={() => setEditando(null)} />
                  ) : (
                    <>
                      <span className={`recurso__idioma recurso__idioma--${recurso.idioma.toLowerCase()}`}>{recurso.idioma}</span>
                      <span className="d13__datos">
                        <strong>{recurso.enlace ? <a href={recurso.enlace} target="_blank" rel="noreferrer"><u>{recurso.titulo}</u></a> : recurso.titulo}</strong>
                        <small>{sesionDe(recurso)}{recurso.tipo ? ` · ${recurso.tipo}` : ''} · {recurso.gratis ? 'gratis' : 'de pago'}</small>
                      </span>
                      <button className="estado-boton" onClick={() => void alternar(recurso)} aria-label={recurso.verificadoEn ? 'Marcar como por verificar' : 'Marcar como verificado'}>
                        {recurso.verificadoEn ? <Estado tipo="ok">Verificado</Estado> : <Estado tipo="tarde">Por verificar</Estado>}
                      </button>
                      <button className="cursos__secundaria" onClick={() => setEditando({ id: recurso.id, sesionId: recurso.sesionId, titulo: recurso.titulo, enlace: recurso.enlace, tipo: recurso.tipo, idioma: recurso.idioma, gratis: recurso.gratis, resumen: recurso.resumen, glosario: recurso.glosario })}>Editar</button>
                      <button className="d13__quitar" aria-label={`Quitar ${recurso.titulo}`} onClick={() => void quitar(recurso)}>Quitar</button>
                    </>
                  )}
                </li>
              ))}
              {recursos && lista.length === 0 && <li><span className="d13__datos"><small>{todos.length === 0 ? 'Aún no hay recursos. Agrega el primero.' : 'Nada en este filtro.'}</small></span></li>}
            </ul>
          </Tarjeta>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
