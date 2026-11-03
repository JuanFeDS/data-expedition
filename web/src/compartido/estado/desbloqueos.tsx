import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useCurso } from './curso';
import { GuiaDesbloqueo, anuncioDe } from '../navegacion/GuiaDesbloqueo';
import { registrarEvento } from '../../servicios/eventos';
import { guardarProgreso, leerProgreso } from '../../servicios/progreso';
import { rutaDeRol } from '../../servicios/ruta';
import { analizarRuta } from '../navegacion/navegacion';
import { useSesion } from './sesion';

// Cada persona desbloquea las secciones de un curso al entrar a ellas, según lo que necesite; el jaguar la
// presenta la primera vez, y una vez desbloqueada no vuelve a bloquearse.

export interface ProgresoRuta {
  total: number;
  abiertas: number;
}

interface ValorDesbloqueos {
  todo: boolean;
  desbloqueadas: Set<string>;
  ruta: ProgresoRuta | null;
  mostrarTodo: boolean;
  alternarMostrarTodo: () => void;
}

const TODO: ValorDesbloqueos = { todo: true, desbloqueadas: new Set(), ruta: null, mostrarTodo: false, alternarMostrarTodo: () => undefined };
const ContextoDesbloqueos = createContext<ValorDesbloqueos>(TODO);

export const useDesbloqueos = () => useContext(ContextoDesbloqueos);

const clave = (id: string, nombre = 'recorridas') => `${nombre}-${id}`;

const leer = (id: string, nombre = 'recorridas'): string[] => {
  try {
    const guardado = JSON.parse(window.localStorage.getItem(clave(id, nombre)) ?? '[]');
    return Array.isArray(guardado) ? guardado.filter((valor): valor is string => typeof valor === 'string') : [];
  } catch {
    return [];
  }
};

const guardar = (id: string, valores: string[], nombre = 'recorridas') => {
  try {
    window.localStorage.setItem(clave(id, nombre), JSON.stringify(valores));
  } catch {
    // sin almacenamiento: lo desbloqueado vale solo para esta visita
  }
};

const leerBandera = (id: string) => {
  try {
    return window.localStorage.getItem(clave(id, 'mostrar-todo')) === '1';
  } catch {
    return false;
  }
};

const leerRuta = () => window.location.hash.replace(/^#\/?/, '');

export function DesbloqueosProvider({ children }: { children: ReactNode }) {
  const { modoDemo, persona } = useSesion();
  const { dentro } = useCurso();
  const [ruta, setRuta] = useState(leerRuta);
  const [estado, setEstado] = useState<{ para: string | null; valores: string[] }>({ para: null, valores: [] });
  const [presentadas, setPresentadas] = useState<{ para: string | null; valores: string[] }>({ para: null, valores: [] });
  const [mostrarTodo, setMostrarTodo] = useState(false);

  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  const idPersona = persona?.id ?? null;
  const rol = persona?.rol;

  useEffect(() => {
    setEstado({ para: idPersona, valores: idPersona ? leer(idPersona) : [] });
    setPresentadas({ para: idPersona, valores: idPersona ? leer(idPersona, 'presentadas') : [] });
    setMostrarTodo(idPersona ? leerBandera(idPersona) : false);
    if (!idPersona || modoDemo) return;
    void leerProgreso<{ claves?: string[] }>('recorridas').then((remoto) => {
      const claves = remoto?.claves;
      if (!Array.isArray(claves) || claves.length === 0) return;
      setEstado((actual) => {
        if (actual.para !== idPersona) return actual;
        const union = [...new Set([...actual.valores, ...claves])];
        if (union.length === actual.valores.length) return actual;
        guardar(idPersona, union);
        return { para: idPersona, valores: union };
      });
    });
    void leerProgreso<{ claves?: string[] }>('presentadas').then((remoto) => {
      const claves = remoto?.claves;
      if (!Array.isArray(claves) || claves.length === 0) return;
      setPresentadas((actual) => {
        if (actual.para !== idPersona) return actual;
        const union = [...new Set([...actual.valores, ...claves])];
        if (union.length === actual.valores.length) return actual;
        guardar(idPersona, union, 'presentadas');
        return { para: idPersona, valores: union };
      });
    });
    void leerProgreso<{ valor?: boolean }>('mostrar_todo').then((remoto) => {
      if (typeof remoto?.valor === 'boolean') setMostrarTodo(remoto.valor);
    });
  }, [idPersona, modoDemo]);

  const pasos = useMemo(() => (rol ? rutaDeRol(rol) : []), [rol]);

  const codigo = analizarRuta(ruta).codigo;
  const cargadas = estado.para === idPersona;
  const presentadasListas = presentadas.para === idPersona;

  const nuevas = useMemo(() => {
    if (!persona || !dentro || pasos.length === 0) return [];
    return pasos.includes(codigo) ? [...new Set([pasos[0], codigo])] : [pasos[0]];
  }, [persona, dentro, pasos, codigo]);

  useEffect(() => {
    if (!idPersona || !cargadas || nuevas.every((valor) => estado.valores.includes(valor))) return;
    const union = [...new Set([...estado.valores, ...nuevas])];
    const recienDesbloqueadas = nuevas.filter((valor) => !estado.valores.includes(valor));
    setEstado({ para: idPersona, valores: union });
    guardar(idPersona, union);
    void guardarProgreso('recorridas', { claves: union });
    recienDesbloqueadas.forEach((seccion) => registrarEvento('seccion_desbloqueada', { entidad: 'seccion', entidadId: seccion }));
  }, [idPersona, cargadas, nuevas, estado.valores]);

  const visibles = useMemo(() => new Set([...(cargadas ? estado.valores : []), ...nuevas]), [cargadas, estado.valores, nuevas]);

  const alternarMostrarTodo = useCallback(() => {
    if (!idPersona) return;
    setMostrarTodo((actual) => {
      const nuevo = !actual;
      try { window.localStorage.setItem(clave(idPersona, 'mostrar-todo'), nuevo ? '1' : '0'); } catch { /* solo esta visita */ }
      void guardarProgreso('mostrar_todo', { valor: nuevo });
      return nuevo;
    });
  }, [idPersona]);

  const progreso = useMemo<ProgresoRuta | null>(() => {
    if (!rol || pasos.length === 0 || modoDemo) return null;
    return { total: pasos.length, abiertas: pasos.filter((paso) => visibles.has(paso)).length };
  }, [rol, pasos, visibles, modoDemo]);

  const valor = useMemo<ValorDesbloqueos>(
    () => (modoDemo ? TODO : { todo: mostrarTodo || pasos.length === 0, desbloqueadas: visibles, ruta: progreso, mostrarTodo, alternarMostrarTodo }),
    [modoDemo, mostrarTodo, pasos.length, visibles, progreso, alternarMostrarTodo],
  );

  const anuncioActual = rol && !modoDemo && dentro && presentadasListas && pasos.includes(codigo) && !presentadas.valores.includes(codigo) ? anuncioDe(rol, codigo) : null;

  const avanzar = useCallback(() => {
    if (!idPersona) return;
    registrarEvento('seccion_presentada', { entidad: 'seccion', entidadId: codigo });
    setPresentadas((actual) => {
      const union = [...new Set([...actual.valores, codigo])];
      guardar(idPersona, union, 'presentadas');
      void guardarProgreso('presentadas', { claves: union });
      return { para: idPersona, valores: union };
    });
  }, [idPersona, codigo]);

  return (
    <ContextoDesbloqueos.Provider value={valor}>
      {children}
      {anuncioActual && <GuiaDesbloqueo anuncio={anuncioActual} quedan={1} alAvanzar={avanzar} />}
    </ContextoDesbloqueos.Provider>
  );
}
