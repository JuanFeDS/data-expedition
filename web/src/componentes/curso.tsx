import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { crearServicioCursosDemo, servicioCursosSupabase, type Curso } from '../servicios/cursos';
import { useSesion } from './sesion';

const CLAVE = 'curso-activo';
const servicioDemo = crearServicioCursosDemo();

interface ValorCurso {
  cargando: boolean;
  cursos: Curso[];
  curso: Curso | null;
  elegir: (id: string) => void;
  crear: (nombre: string) => Promise<string | null>;
  recargar: () => Promise<void>;
}

const SIN_CURSO: ValorCurso = { cargando: false, cursos: [], curso: null, elegir: () => undefined, crear: async () => 'Sin conexión', recargar: async () => undefined };
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
  const [activo, setActivo] = useState<string | null>(leerGuardado);

  const recargar = useCallback(async () => {
    if (!hayUsuario) { setCursos([]); setCargando(false); return; }
    try {
      setCursos(await servicio.listar());
    } catch {
      setCursos([]);
    }
    setCargando(false);
  }, [servicio, hayUsuario]);

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

  const crear = useCallback(async (nombre: string) => {
    const error = await servicio.crear(nombre);
    await recargar();
    return error;
  }, [servicio, recargar]);

  const valor = useMemo(() => ({ cargando, cursos, curso, elegir, crear, recargar }), [cargando, cursos, curso, elegir, crear, recargar]);
  return <ContextoCurso.Provider value={valor}>{children}</ContextoCurso.Provider>;
}

export function SelectorCurso({ clase = '' }: { clase?: string }) {
  const { cursos, curso, elegir } = useCurso();
  if (cursos.length === 0) return null;
  if (cursos.length === 1) return <p className={`selector-curso selector-curso--unico ${clase}`}><small>Curso</small><strong>{cursos[0].nombre}</strong></p>;
  return (
    <label className={`selector-curso ${clase}`}>
      <small>Curso</small>
      <select value={curso?.id ?? ''} onChange={(evento) => elegir(evento.target.value)} aria-label="Curso activo">
        {cursos.map((candidato) => <option key={candidato.id} value={candidato.id}>{candidato.nombre}</option>)}
      </select>
    </label>
  );
}
