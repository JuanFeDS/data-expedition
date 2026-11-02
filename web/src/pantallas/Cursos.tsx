import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso } from '../componentes/curso';
import { Tarjeta } from '../componentes/panel';
import { useSesion } from '../componentes/sesion';
import { Pantalla } from '../componentes/ui';

const DESTINO = { estudiante: '#/e5', docente: '#/d13', observador: '#/o1' } as const;

export function Cursos() {
  const { persona } = useSesion();
  const { cursos, conteos, curso, elegir, crear, cargando } = useCurso();
  const [nombre, setNombre] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const rol = persona?.rol ?? 'estudiante';

  const entrar = (id: string) => {
    elegir(id);
    window.location.hash = DESTINO[rol];
  };

  const crearCurso = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nombre.trim()) return;
    const error = await crear(nombre.trim());
    setAviso(error);
    if (!error) setNombre('');
  };

  return (
    <Pantalla rol={rol} clase="p-cursos">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Tu expedición" titulo="Cursos" subtitulo={cursos.length > 0 ? 'Elige un curso para entrar.' : 'Aquí aparecerán tus cursos.'} objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {!cargando && cursos.length === 0 && (
            <Tarjeta kicker="Todavía nada" titulo="Aún no estás en ningún curso">
              <p className="meta">{rol === 'docente' ? 'Crea el primero aquí abajo.' : 'Tu docente debe invitarte con tu correo. Cuando lo haga, aparecerá aquí.'}</p>
            </Tarjeta>
          )}
          {cursos.length > 0 && (
            <ul className="cursos__lista">
              {cursos.map((candidato) => (
                <li key={candidato.id}>
                  <button className="cursos__tarjeta" onClick={() => entrar(candidato.id)}>
                    <span className="cursos__nombre">{candidato.nombre}</span>
                    {rol === 'docente' && <small>{(conteos[candidato.id]?.estudiantes ?? 0)} {(conteos[candidato.id]?.estudiantes ?? 0) === 1 ? 'estudiante' : 'estudiantes'} · {(conteos[candidato.id]?.grupos ?? 0)} {(conteos[candidato.id]?.grupos ?? 0) === 1 ? 'grupo' : 'grupos'}</small>}
                    {candidato.id === curso?.id && <small>Último que usaste</small>}
                    <span className="cursos__entrar">Entrar ›</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {rol === 'docente' && (
            <Tarjeta kicker="Nuevo" titulo="Crear un curso">
              <form className="d13__fila" onSubmit={(evento) => void crearCurso(evento)}>
                <input className="d13__campo" placeholder="Ciencia de datos 2026-2" value={nombre} onChange={(evento) => setNombre(evento.target.value)} aria-label="Nombre del curso" />
                <button className="acceso__boton acceso__boton--principal" disabled={!nombre.trim()}>Crear</button>
              </form>
            </Tarjeta>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
