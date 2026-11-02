import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { crearServicioCursosDemo, servicioCursosSupabase, type ConteoCurso, type Curso, type DatosCurso } from '../servicios/cursos';
import { useSesion } from './sesion';

const CLAVE = 'curso-activo';
const servicioDemo = crearServicioCursosDemo();

interface ValorCurso {
  cargando: boolean;
  cursos: Curso[];
  conteos: Record<string, ConteoCurso>;
  curso: Curso | null;
  elegir: (id: string) => void;
  crear: (datos: DatosCurso) => Promise<string | null>;
  actualizar: (id: string, datos: DatosCurso) => Promise<string | null>;
  eliminar: (id: string) => Promise<string | null>;
  recargar: () => Promise<void>;
}

const SIN_CURSO: ValorCurso = { cargando: false, cursos: [], conteos: {}, curso: null, elegir: () => undefined, crear: async () => 'Sin conexión', actualizar: async () => 'Sin conexión', eliminar: async () => 'Sin conexión', recargar: async () => undefined };
const ContextoCurso = createContext<ValorCurso>(SIN_CURSO);

export const useCurso = () => useContext(ContextoCurso);

const leerGuardado = () => {
  try {
    return window.localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
};

export function CursoProvider({ children }: { children: ReactNode }) {
  const { modoDemo, persona } = useSesion();
  const servicio = modoDemo ? servicioDemo : servicioCursosSupabase;
  const hayUsuario = modoDemo || persona !== null;
  const [cargando, setCargando] = useState(true);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [conteos, setConteos] = useState<Record<string, ConteoCurso>>({});
  const [activo, setActivo] = useState<string | null>(leerGuardado);

  const recargar = useCallback(async () => {
    if (!hayUsuario) { setCursos([]); setCargando(false); return; }
    try {
      setCursos(await servicio.listar());
    } catch {
      setCursos([]);
    }
    if (persona?.rol === 'docente' || modoDemo) {
      try {
        setConteos(await servicio.contar());
      } catch {
        setConteos({});
      }
    }
    setCargando(false);
  }, [servicio, hayUsuario, persona?.rol, modoDemo]);

  useEffect(() => { void recargar(); }, [recargar]);

  const curso = useMemo(() => cursos.find((candidato) => candidato.id === activo) ?? cursos[0] ?? null, [cursos, activo]);

  const elegir = useCallback((id: string) => {
    setActivo(id);
    try {
      window.localStorage.setItem(CLAVE, id);
    } catch {
      // sin almacenamiento: el curso elegido vale solo para esta visita
    }
  }, []);

  const crear = useCallback(async (datos: DatosCurso) => {
    const error = await servicio.crear(datos);
    await recargar();
    return error;
  }, [servicio, recargar]);

  const actualizar = useCallback(async (id: string, datos: DatosCurso) => {
    const error = await servicio.actualizar(id, datos);
    await recargar();
    return error;
  }, [servicio, recargar]);

  const eliminar = useCallback(async (id: string) => {
    const error = await servicio.eliminar(id);
    await recargar();
    return error;
  }, [servicio, recargar]);

  const valor = useMemo(() => ({ cargando, cursos, conteos, curso, elegir, crear, actualizar, eliminar, recargar }), [cargando, cursos, conteos, curso, elegir, crear, actualizar, eliminar, recargar]);
  return <ContextoCurso.Provider value={valor}>{children}</ContextoCurso.Provider>;
}

export function SelectorCurso({ clase = '' }: { clase?: string }) {
  const { cursos, curso, elegir } = useCurso();
  const { persona } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const alPulsarFuera = (evento: MouseEvent) => { if (!caja.current?.contains(evento.target as Node)) setAbierto(false); };
    const alTeclear = (evento: KeyboardEvent) => { if (evento.key === 'Escape') setAbierto(false); };
    document.addEventListener('mousedown', alPulsarFuera);
    document.addEventListener('keydown', alTeclear);
    return () => { document.removeEventListener('mousedown', alPulsarFuera); document.removeEventListener('keydown', alTeclear); };
  }, [abierto]);

  if (cursos.length === 0) {
    return (
      <p className={`selector-curso selector-curso--unico ${clase}`}>
        <small>Curso</small>
        <strong>Aún no tienes cursos</strong>
        {persona?.rol === 'docente' && <a className="selector-curso__crear" href="#/cursos">Crear uno ›</a>}
      </p>
    );
  }
  if (cursos.length === 1) return <p className={`selector-curso selector-curso--unico ${clase}`}><small>Curso</small><strong>{cursos[0].nombre}</strong></p>;
  return (
    <div className={`selector-curso ${clase}`} ref={caja}>
      <small>Curso</small>
      <button className="selector-curso__boton" aria-haspopup="listbox" aria-expanded={abierto} onClick={() => setAbierto((actual) => !actual)}>
        <span>{curso?.nombre}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {abierto && (
        <ul className="selector-curso__lista" role="listbox" aria-label="Curso activo">
          {cursos.map((candidato) => (
            <li key={candidato.id} role="option" aria-selected={candidato.id === curso?.id}>
              <button onClick={() => { elegir(candidato.id); setAbierto(false); }}>
                <span>{candidato.nombre}</span>
                {candidato.id === curso?.id && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.4 6.6 11.5 12.5 4.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
