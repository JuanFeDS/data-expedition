import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useCurso } from './curso';
import { GuiaDesbloqueo, anuncioDe } from './GuiaDesbloqueo';
import { Jaguar } from './Jaguar';
import { registrarEvento } from '../servicios/eventos';
import { guardarProgreso, leerProgreso } from '../servicios/progreso';
import { cargarCondiciones, rutaDeRol, seccionesAbiertas, type Condiciones } from '../servicios/ruta';
import { analizarRuta } from './navegacion';
import { sonar } from './sonidos';
import { useSesion } from './sesion';

// Las secciones de un curso se abren una a una, según lo que la persona hace (ver servicios/ruta.ts),
// y una vez abiertas no vuelven a esconderse.
const DE_CURSO = new Set(['curso', 'e3', 'e5', 'e20', 'e2', 'e15', 'e17', 'e22', 'e24', 'd2', 'd3', 'd5', 'd6', 'd7', 'd9', 'd15', 'd10', 'd11', 'd13', 'd14']);
const SONDEO_MS = 5000;

export interface ProgresoRuta {
  total: number;
  abiertas: number;
  siguiente: { nombre: string; pista: string } | null;
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

const clave = (id: string, nombre = 'desbloqueos') => `${nombre}-${id}`;

const leer = (id: string, nombre = 'desbloqueos'): string[] => {
  try {
    const guardado = JSON.parse(window.localStorage.getItem(clave(id, nombre)) ?? '[]');
    return Array.isArray(guardado) ? guardado.filter((valor): valor is string => typeof valor === 'string') : [];
  } catch {
    return [];
  }
};

const guardar = (id: string, valores: string[], nombre = 'desbloqueos') => {
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
  const { dentro, curso } = useCurso();
  const [ruta, setRuta] = useState(leerRuta);
  const [estado, setEstado] = useState<{ para: string | null; valores: string[] }>({ para: null, valores: [] });
  const [presentadas, setPresentadas] = useState<{ para: string | null; valores: string[] }>({ para: null, valores: [] });
  const [mostrarTodo, setMostrarTodo] = useState(false);
  const [condiciones, setCondiciones] = useState<{ para: string | null; valores: Condiciones | null }>({ para: null, valores: null });
  const [logro, setLogro] = useState<string | null>(null);

  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  const idPersona = persona?.id ?? null;
  const rol = persona?.rol;
  const idCurso = dentro && curso ? curso.id : null;

  useEffect(() => {
    setEstado({ para: idPersona, valores: idPersona ? leer(idPersona) : [] });
    setPresentadas({ para: idPersona, valores: idPersona ? leer(idPersona, 'presentadas') : [] });
    setMostrarTodo(idPersona ? leerBandera(idPersona) : false);
    if (!idPersona || modoDemo) return;
    void leerProgreso<{ claves?: string[] }>('desbloqueos').then((remoto) => {
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

  const evaluar = useCallback(async () => {
    if (!idPersona || !rol || !idCurso || modoDemo || pasos.length === 0) return;
    try {
      const valores = await cargarCondiciones(rol, idCurso);
      setCondiciones((actual) => (actual.para === idPersona && actual.valores && JSON.stringify(actual.valores) === JSON.stringify(valores) ? actual : { para: idPersona, valores }));
    } catch {
      // se reintenta en el siguiente sondeo
    }
  }, [idPersona, rol, idCurso, modoDemo, pasos.length]);

  useEffect(() => {
    void evaluar();
    if (!idPersona || !idCurso || modoDemo) return undefined;
    const reloj = window.setInterval(() => { if (document.visibilityState === 'visible') void evaluar(); }, SONDEO_MS);
    return () => window.clearInterval(reloj);
  }, [evaluar, ruta, idPersona, idCurso, modoDemo]);

  const codigo = analizarRuta(ruta).codigo;
  const cargadas = estado.para === idPersona;
  const presentadasListas = presentadas.para === idPersona;

  const nuevas = useMemo(() => {
    if (!persona || !dentro || pasos.length === 0 || !presentadasListas) return [];
    const valores = condiciones.para === idPersona && condiciones.valores ? condiciones.valores : null;
    return valores ? seccionesAbiertas(pasos, valores, presentadas.valores) : pasos.slice(0, 2).map((paso) => paso.codigo);
  }, [persona, dentro, pasos, presentadasListas, condiciones, idPersona, presentadas.valores]);

  useEffect(() => {
    if (!idPersona || !cargadas || nuevas.every((valor) => estado.valores.includes(valor))) return;
    const union = [...new Set([...estado.valores, ...nuevas])];
    const recienDesbloqueadas = nuevas.filter((valor) => !estado.valores.includes(valor));
    setEstado({ para: idPersona, valores: union });
    guardar(idPersona, union);
    void guardarProgreso('desbloqueos', { claves: union });
    recienDesbloqueadas.forEach((seccion) => registrarEvento('seccion_desbloqueada', { entidad: 'seccion', entidadId: seccion }));
    const conLogro = recienDesbloqueadas.filter((seccion) => rol && anuncioDe(rol, seccion) && estado.valores.length > 0);
    if (conLogro.length > 0 && rol) {
      setLogro(anuncioDe(rol, conLogro[conLogro.length - 1])?.titulo ?? null);
      sonar('foto');
    }
  }, [idPersona, cargadas, nuevas, estado.valores, rol]);

  useEffect(() => {
    if (!logro) return undefined;
    const reloj = window.setTimeout(() => setLogro(null), 5000);
    return () => window.clearTimeout(reloj);
  }, [logro]);

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
    const abiertas = pasos.filter((paso) => visibles.has(paso.codigo)).length;
    const indiceSiguiente = pasos.findIndex((paso) => !visibles.has(paso.codigo));
    const siguiente = indiceSiguiente > 0 ? { nombre: anuncioDe(rol, pasos[indiceSiguiente].codigo)?.titulo ?? pasos[indiceSiguiente].codigo, pista: pasos[indiceSiguiente - 1].pista } : null;
    return { total: pasos.length, abiertas, siguiente };
  }, [rol, pasos, visibles, modoDemo]);

  const valor = useMemo<ValorDesbloqueos>(
    () => (modoDemo ? TODO : { todo: mostrarTodo, desbloqueadas: visibles, ruta: progreso, mostrarTodo, alternarMostrarTodo }),
    [modoDemo, mostrarTodo, visibles, progreso, alternarMostrarTodo],
  );

  const anuncioActual = rol && !modoDemo && dentro && presentadasListas && DE_CURSO.has(codigo) && visibles.has(codigo) && !presentadas.valores.includes(codigo) ? anuncioDe(rol, codigo) : null;
  const pendientes = rol && !modoDemo ? estado.valores.filter((seccion) => seccion !== codigo && DE_CURSO.has(seccion) && !presentadas.valores.includes(seccion) && anuncioDe(rol, seccion)) : [];
  const pistaNueva = anuncioActual ? null : (pendientes[0] ?? null);

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

  useEffect(() => {
    if (pistaNueva) document.body.dataset.nuevo = pistaNueva;
    else delete document.body.dataset.nuevo;
    return () => { delete document.body.dataset.nuevo; };
  }, [pistaNueva]);

  return (
    <ContextoDesbloqueos.Provider value={valor}>
      {children}
      {anuncioActual && <GuiaDesbloqueo anuncio={anuncioActual} quedan={1} alAvanzar={avanzar} />}
      {logro && !anuncioActual && (
        <div className="logro" role="status">
          <Jaguar pose="celebra" ancho={56} />
          <div><small>¡Desbloqueaste!</small><strong>{logro}</strong></div>
        </div>
      )}
    </ContextoDesbloqueos.Provider>
  );
}
