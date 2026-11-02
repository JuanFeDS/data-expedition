import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { crearServicioCursosDemo, servicioCursosSupabase, type ConteoCurso, type Curso, type DatosCurso } from '../servicios/cursos';
import { analizarRuta, enCurso } from './navegacion';
import { useSesion } from './sesion';

const CLAVE = 'curso-reciente';
const servicioDemo = crearServicioCursosDemo();

interface ValorCurso {
  cargando: boolean;
  cursos: Curso[];
  conteos: Record<string, ConteoCurso>;
  curso: Curso | null;
  dentro: boolean;
  reciente: Curso | null;
  crear: (datos: DatosCurso) => Promise<string | null>;
  actualizar: (id: string, datos: DatosCurso) => Promise<string | null>;
  eliminar: (id: string) => Promise<string | null>;
  recargar: () => Promise<void>;
}

const SIN_CURSO: ValorCurso = {
  cargando: false, cursos: [], conteos: {}, curso: null, dentro: false, reciente: null,
  crear: async () => 'Sin conexión', actualizar: async () => 'Sin conexión', eliminar: async () => 'Sin conexión', recargar: async () => undefined,
};
const ContextoCurso = createContext<ValorCurso>(SIN_CURSO);

export const useCurso = () => useContext(ContextoCurso);

export const useRutaCurso = () => {
  const { curso, dentro } = useCurso();
  return useCallback((ruta: string | undefined) => (ruta && dentro && curso ? enCurso(ruta, curso.id) : ruta), [curso, dentro]);
};

const leerGuardado = () => {
  try {
    return window.localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
};

const guardar = (id: string) => {
  try {
    window.localStorage.setItem(CLAVE, id);
  } catch {
    // sin almacenamiento: el curso reciente vale solo para esta visita
  }
};

const leerRuta = () => window.location.hash.replace(/^#\/?/, '');

export function CursoProvider({ children }: { children: ReactNode }) {
  const { modoDemo, persona } = useSesion();
  const servicio = modoDemo ? servicioDemo : servicioCursosSupabase;
  const hayUsuario = modoDemo || persona !== null;
  const [cargando, setCargando] = useState(true);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [conteos, setConteos] = useState<Record<string, ConteoCurso>>({});
  const [ruta, setRuta] = useState(leerRuta);

  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

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

  const { cursoId } = analizarRuta(ruta);
  const porRuta = cursos.find((candidato) => candidato.id === cursoId) ?? null;
  const guardado = leerGuardado();
  const reciente = cursos.find((candidato) => candidato.id === guardado) ?? cursos[0] ?? null;
  const curso = porRuta ?? (modoDemo ? reciente : null);

  useEffect(() => { if (porRuta) guardar(porRuta.id); }, [porRuta]);

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

  const valor = useMemo(
    () => ({ cargando, cursos, conteos, curso, dentro: porRuta !== null, reciente, crear, actualizar, eliminar, recargar }),
    [cargando, cursos, conteos, curso, porRuta, reciente, crear, actualizar, eliminar, recargar],
  );
  return <ContextoCurso.Provider value={valor}>{children}</ContextoCurso.Provider>;
}
