import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
