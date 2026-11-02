import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso } from '../componentes/curso';
import { Tarjeta } from '../componentes/panel';
import { useSesion } from '../componentes/sesion';
import { Pantalla } from '../componentes/ui';
import type { Curso } from '../servicios/cursos';

const DESTINO = { estudiante: '#/e5', docente: '#/d13', observador: '#/o1' } as const;
const plural = (cantidad: number, uno: string, varios: string) => `${cantidad} ${cantidad === 1 ? uno : varios}`;

function EditorCurso({ curso, alGuardar, alCancelar }: { curso: Curso; alGuardar: (nombre: string, periodo: string) => Promise<void>; alCancelar: () => void }) {
  const [nombre, setNombre] = useState(curso.nombre);
  const [periodo, setPeriodo] = useState(curso.periodo ?? '');
  const [guardando, setGuardando] = useState(false);
  return (
    <form className="d14__formulario" onSubmit={(evento) => { evento.preventDefault(); if (!nombre.trim()) return; setGuardando(true); void alGuardar(nombre.trim(), periodo.trim()).finally(() => setGuardando(false)); }}>
      <label className="d14__etiqueta">Nombre<input className="d13__campo" value={nombre} onChange={(evento) => setNombre(evento.target.value)} /></label>
      <label className="d14__etiqueta">Periodo (opcional)<input className="d13__campo" placeholder="2026-2" value={periodo} onChange={(evento) => setPeriodo(evento.target.value)} /></label>
      <div className="d13__fila">
        <button className="acceso__boton acceso__boton--principal" disabled={guardando || !nombre.trim()}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" className="acceso__boton" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export function Cursos() {
  const { persona } = useSesion();
  const { cursos, conteos, curso, elegir, crear, actualizar, eliminar, cargando } = useCurso();
  const [nombre, setNombre] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [editando, setEditando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const rol = persona?.rol ?? 'estudiante';
  const esDocente = rol === 'docente';

  const entrar = (id: string) => {
    elegir(id);
    window.location.hash = DESTINO[rol];
  };

  const abrir = (id: string) => {
    elegir(id);
    window.location.hash = '#/curso';
  };

  const crearCurso = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nombre.trim()) return;
    const error = await crear({ nombre: nombre.trim(), periodo: periodo.trim() });
    setAviso(error);
    if (!error) { setNombre(''); setPeriodo(''); }
  };

  const guardar = async (id: string, nuevoNombre: string, nuevoPeriodo: string) => {
    const error = await actualizar(id, { nombre: nuevoNombre, periodo: nuevoPeriodo });
    setAviso(error);
    if (!error) setEditando(null);
  };

  const quitar = async (candidato: Curso) => {
    if (!window.confirm(`¿Eliminar el curso «${candidato.nombre}»? Solo se puede si no tiene personas ni trabajos.`)) return;
    setAviso(await eliminar(candidato.id));
  };

  return (
    <Pantalla rol={rol} clase="p-cursos">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Tu expedición" titulo="Cursos" subtitulo={cursos.length > 0 ? (esDocente ? 'Entra a un curso, edítalo o crea uno nuevo.' : 'Elige un curso para entrar.') : 'Aquí aparecerán tus cursos.'} objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {!cargando && cursos.length === 0 && (
            <Tarjeta kicker="Todavía nada" titulo="Aún no estás en ningún curso">
              <p className="meta">{esDocente ? 'Crea el primero aquí abajo.' : 'Tu docente debe invitarte con tu correo. Cuando lo haga, aparecerá aquí.'}</p>
            </Tarjeta>
          )}
          {cursos.length > 0 && (
            <ul className="cursos__lista">
              {cursos.map((candidato) => {
                const conteo = conteos[candidato.id];
                return (
                  <li key={candidato.id}>
                    {esDocente && editando === candidato.id ? (
                      <div className="cursos__tarjeta cursos__tarjeta--edicion">
                        <EditorCurso curso={candidato} alGuardar={(nuevoNombre, nuevoPeriodo) => guardar(candidato.id, nuevoNombre, nuevoPeriodo)} alCancelar={() => setEditando(null)} />
                      </div>
                    ) : (
                      <div className="cursos__tarjeta">
                        <button className="cursos__abrir" onClick={() => abrir(candidato.id)} aria-label={`Ver información de ${candidato.nombre}`}>
                        <span className="cursos__nombre">{candidato.nombre}</span>
                        {candidato.periodo && <small>Periodo {candidato.periodo}</small>}
                        {esDocente && <small>{plural(conteo?.estudiantes ?? 0, 'estudiante', 'estudiantes')} · {plural(conteo?.grupos ?? 0, 'grupo', 'grupos')}</small>}
                        {candidato.id === curso?.id && <small>Último que usaste</small>}
                          <span className="cursos__ver">Ver información ›</span>
                        </button>
                        <div className="cursos__acciones">
                          <button className="cursos__entrar" onClick={() => entrar(candidato.id)}>Entrar ›</button>
                          {esDocente && <button className="cursos__secundaria" onClick={() => { setAviso(null); setEditando(candidato.id); }}>Editar</button>}
                          {esDocente && <button className="cursos__peligro" onClick={() => void quitar(candidato)}>Eliminar</button>}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {esDocente && (
            <Tarjeta kicker="Nuevo" titulo="Crear un curso">
              <form className="d14__formulario" onSubmit={(evento) => void crearCurso(evento)}>
                <input className="d13__campo" placeholder="Ciencia de datos 2026-2" value={nombre} onChange={(evento) => setNombre(evento.target.value)} aria-label="Nombre del curso" />
                <input className="d13__campo" placeholder="Periodo (opcional): 2026-2" value={periodo} onChange={(evento) => setPeriodo(evento.target.value)} aria-label="Periodo" />
                <button className="acceso__boton acceso__boton--principal" disabled={!nombre.trim()}>Crear curso</button>
              </form>
            </Tarjeta>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
