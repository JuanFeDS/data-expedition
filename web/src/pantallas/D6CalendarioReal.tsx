import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useConfirmar } from '../componentes/confirmar';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Estado, Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import {
  dinamicaATexto, eliminarSesion, fechaAEntrada, fechaCorta, guardarSesion, horaLocal, listarSesiones, textoADinamica,
  type Modalidad, type Sesion,
} from '../servicios/calendario';
import { formatoFecha, useServicioTrabajos, type TrabajoCurso } from '../servicios/trabajos';

interface Borrador { id?: string; codigo: string; semana: string; modalidad: Modalidad; inicia: string; tema: string; dinamica: string }
const vacio = (): Borrador => ({ codigo: '', semana: '', modalidad: 'virtual', inicia: '', tema: '', dinamica: '' });
const desdeSesion = (sesion: Sesion): Borrador => ({ id: sesion.id, codigo: sesion.codigo, semana: sesion.semana ? String(sesion.semana) : '', modalidad: sesion.modalidad, inicia: fechaAEntrada(sesion.iniciaEn), tema: sesion.tema, dinamica: dinamicaATexto(sesion.dinamica) });

function EditorSesion({ inicial, alGuardar, alCancelar }: { inicial: Borrador; alGuardar: (borrador: Borrador) => Promise<void>; alCancelar: () => void }) {
  const [borrador, setBorrador] = useState(inicial);
  const [guardando, setGuardando] = useState(false);
  const valido = borrador.codigo.trim() !== '' && borrador.tema.trim() !== '';
  return (
    <form className="d14__formulario rubrica__editor" onSubmit={(evento) => { evento.preventDefault(); if (!valido) return; setGuardando(true); void alGuardar(borrador).finally(() => setGuardando(false)); }}>
      <div className="d14__par">
        <label className="d14__etiqueta">Código<input className="d13__campo" value={borrador.codigo} onChange={(evento) => setBorrador({ ...borrador, codigo: evento.target.value })} placeholder="S8" /></label>
        <label className="d14__etiqueta">Semana<input className="d13__campo" type="number" min={1} max={52} value={borrador.semana} onChange={(evento) => setBorrador({ ...borrador, semana: evento.target.value })} /></label>
      </div>
      <div className="diag__chips" role="radiogroup" aria-label="Modalidad">
        {(['virtual', 'presencial'] as Modalidad[]).map((modalidad) => <button type="button" key={modalidad} role="radio" aria-checked={borrador.modalidad === modalidad} className="diag__chip" aria-pressed={borrador.modalidad === modalidad} onClick={() => setBorrador({ ...borrador, modalidad })}>{modalidad === 'virtual' ? 'Virtual' : 'Presencial'}</button>)}
      </div>
      <label className="d14__etiqueta">Fecha y hora<input className="d13__campo" type="datetime-local" value={borrador.inicia} onChange={(evento) => setBorrador({ ...borrador, inicia: evento.target.value })} /></label>
      <label className="d14__etiqueta">Tema<input className="d13__campo" value={borrador.tema} onChange={(evento) => setBorrador({ ...borrador, tema: evento.target.value })} placeholder="PySpark SQL y comparación con pandas" /></label>
      <label className="d14__etiqueta">Cómo corre la sesión, una dinámica por línea: minutos | dinámica | detalle
        <textarea className="d13__campo rubrica__nivel" rows={5} value={borrador.dinamica} onChange={(evento) => setBorrador({ ...borrador, dinamica: evento.target.value })} placeholder={'0–10 | Preguntas pendientes | Lo que quedó de la S7\n10–70 | Trabajo del PR | En parejas'} />
      </label>
      <div className="d13__fila">
        <button className="acceso__boton acceso__boton--principal" disabled={!valido || guardando}>{guardando ? 'Guardando…' : 'Guardar sesión'}</button>
        <button type="button" className="acceso__boton" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export function D6CalendarioReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const confirmar = useConfirmar();
  const trabajosServicio = useServicioTrabajos();
  const [sesiones, setSesiones] = useState<Sesion[] | null>(null);
  const [trabajos, setTrabajos] = useState<TrabajoCurso[]>([]);
  const [editando, setEditando] = useState<Borrador | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  const cargar = useCallback(async () => {
    if (!curso) return;
    try {
      const [lista, deTrabajos] = await Promise.all([listarSesiones(curso.id), trabajosServicio.cargarTrabajos(curso.id)]);
      setSesiones(lista);
      setTrabajos(deTrabajos);
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [curso, trabajosServicio]);

  useEffect(() => { void cargar(); }, [cargar]);

  const guardar = async (borrador: Borrador) => {
    if (!curso) return;
    const error = await guardarSesion(curso.id, {
      id: borrador.id, codigo: borrador.codigo.trim(), semana: borrador.semana ? Number(borrador.semana) : null, modalidad: borrador.modalidad,
      iniciaEn: borrador.inicia ? new Date(borrador.inicia).toISOString() : null, tema: borrador.tema.trim(), dinamica: textoADinamica(borrador.dinamica),
    });
    setAviso(error);
    if (!error) setEditando(null);
    await cargar();
  };

  const quitar = async (sesion: Sesion) => {
    const aceptado = await confirmar({ titulo: '¿Quitar la sesión?', texto: `«${sesion.codigo} · ${sesion.tema}» desaparece del calendario. Su material queda sin sesión.`, confirmar: 'Quitar sesión' });
    if (!aceptado) return;
    setAviso(await eliminarSesion(sesion.id));
    await cargar();
  };

  const ahora = Date.now();
  const virtuales = (sesiones ?? []).filter((sesion) => sesion.modalidad === 'virtual');
  const presenciales = (sesiones ?? []).filter((sesion) => sesion.modalidad === 'presencial');
  const semanas = [...new Set(virtuales.map((sesion) => sesion.semana))];

  const fila = (sesion: Sesion) => (
    <li key={sesion.id}>
      {editando?.id === sesion.id ? (
        <EditorSesion inicial={editando} alGuardar={guardar} alCancelar={() => setEditando(null)} />
      ) : (
        <>
          <span className="d13__datos"><strong>{sesion.codigo} · {sesion.tema}</strong><small>{fechaCorta(sesion.iniciaEn)}{sesion.iniciaEn ? ` · ${horaLocal(sesion.iniciaEn)}` : ''}</small></span>
          <Estado tipo={sesion.iniciaEn && new Date(sesion.iniciaEn).getTime() < ahora ? 'ok' : 'pendiente'}>{sesion.iniciaEn && new Date(sesion.iniciaEn).getTime() < ahora ? 'Dada' : 'Próxima'}</Estado>
          <button className="cursos__secundaria" onClick={() => setEditando(desdeSesion(sesion))}>Editar</button>
          <button className="d13__quitar" aria-label={`Quitar ${sesion.codigo}`} onClick={() => void quitar(sesion)}>Quitar</button>
        </>
      )}
    </li>
  );

  return (
    <Pantalla rol="docente" clase="p-d6">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Sesiones y plazos" titulo="Calendario del curso" subtitulo="Lo que cargues aquí lo ven los estudiantes." objeto="mapa" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar el calendario. <button onClick={() => void cargar()}>Reintentar</button></p>}
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          <div className="d6__columnas">
            <Tarjeta kicker={`${virtuales.length} sesiones`} titulo="Sesiones virtuales" accion={editando === null || editando.id ? <button className="acceso__boton acceso__boton--principal" onClick={() => setEditando(vacio())}>Agregar sesión</button> : null}>
              {editando && !editando.id && <EditorSesion inicial={editando} alGuardar={guardar} alCancelar={() => setEditando(null)} />}
              {semanas.map((semana) => (
                <div key={semana ?? 'sin'}>
                  <span className="cal__etiqueta">{semana ? `Semana ${semana}` : 'Sin semana'}</span>
                  <ul className="d13__personas">{virtuales.filter((sesion) => sesion.semana === semana).map(fila)}</ul>
                </div>
              ))}
              {sesiones && virtuales.length === 0 && <p className="meta">Aún no hay sesiones. Agrega la primera con el botón de arriba.</p>}
            </Tarjeta>
            <div className="d6__lado">
              <Tarjeta kicker="Plazos de los trabajos" titulo="Entregas">
                <ul className="cal__plazos">
                  {trabajos.map((trabajo) => {
                    const vence = formatoFecha(trabajo.venceEn);
                    return <li key={trabajo.id} className="cal__plazo"><b>{vence.numero || '—'}<small>{vence.dia}</small></b><div><strong>{trabajo.nombre}</strong><small>{trabajo.tema}</small></div><Estado tipo="info">Pylint {trabajo.minPylint}</Estado></li>;
                  })}
                  {trabajos.length === 0 && <li className="cal__plazo"><div><small>Los plazos salen de <a href={rutaCurso('#/d14') ?? '#/d14'}><u>Trabajos</u></a>.</small></div></li>}
                </ul>
              </Tarjeta>
              <Tarjeta kicker="Presenciales" titulo="Sesiones presenciales">
                <ul className="d13__personas">{presenciales.map(fila)}</ul>
                {presenciales.length === 0 && <p className="meta">Para agregar una, crea una sesión y elige «Presencial».</p>}
              </Tarjeta>
            </div>
          </div>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
