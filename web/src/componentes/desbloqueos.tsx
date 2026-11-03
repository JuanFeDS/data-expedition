import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useCurso } from './curso';
import { GuiaDesbloqueo, anuncioDe } from './GuiaDesbloqueo';
import { registrarEvento } from '../servicios/eventos';
import { guardarProgreso, leerProgreso } from '../servicios/progreso';
import { analizarRuta, type Rol } from './navegacion';
import { useSesion } from './sesion';

// Secciones de un curso que se van mostrando poco a poco y, una vez desbloqueadas, no vuelven a esconderse.
const AL_ENTRAR_A_UN_CURSO: Record<Rol, string[]> = { estudiante: ['curso', 'e5'], docente: ['curso', 'd13'], observador: [] };
const AL_VISITAR: Record<string, string> = { d13: 'd14', d14: 'd3', d3: 'd10', d10: 'd5', d5: 'd11', d11: 'd6', d6: 'd9', d9: 'd7', e5: 'e3', e3: 'e20', e20: 'e22', e22: 'e24' };
const DE_CURSO = new Set(['curso', 'e3', 'e5', 'e20', 'e22', 'e24', 'd3', 'd5', 'd6', 'd7', 'd9', 'd10', 'd11', 'd13', 'd14']);

interface ValorDesbloqueos {
  todo: boolean;
  desbloqueadas: Set<string>;
}

const TODO: ValorDesbloqueos = { todo: true, desbloqueadas: new Set() };
const ContextoDesbloqueos = createContext<ValorDesbloqueos>(TODO);

export const useDesbloqueos = () => useContext(ContextoDesbloqueos);

const clave = (id: string) => `desbloqueos-${id}`;

const leer = (id: string): string[] => {
  try {
    const guardado = JSON.parse(window.localStorage.getItem(clave(id)) ?? '[]');
    return Array.isArray(guardado) ? guardado.filter((valor): valor is string => typeof valor === 'string') : [];
  } catch {
    return [];
  }
};

const guardar = (id: string, valores: string[]) => {
  try {
    window.localStorage.setItem(clave(id), JSON.stringify(valores));
  } catch {
    // sin almacenamiento: lo desbloqueado vale solo para esta visita
  }
};

const leerRuta = () => window.location.hash.replace(/^#\/?/, '');

export function DesbloqueosProvider({ children }: { children: ReactNode }) {
  const { modoDemo, persona } = useSesion();
  const { dentro } = useCurso();
  const [ruta, setRuta] = useState(leerRuta);
  const [estado, setEstado] = useState<{ para: string | null; valores: string[] }>({ para: null, valores: [] });
  const [porAnunciar, setPorAnunciar] = useState<string[]>([]);

  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  const idPersona = persona?.id ?? null;
  useEffect(() => {
    setEstado({ para: idPersona, valores: idPersona ? leer(idPersona) : [] });
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
  }, [idPersona, modoDemo]);

  const codigo = analizarRuta(ruta).codigo;
  const nuevas = useMemo(() => {
    if (!persona || !dentro) return [];
    const lista = [...AL_ENTRAR_A_UN_CURSO[persona.rol]];
    if (DE_CURSO.has(codigo)) lista.push(codigo);
    if (AL_VISITAR[codigo]) lista.push(AL_VISITAR[codigo]);
    return lista;
  }, [persona, dentro, codigo]);

  const cargadas = estado.para === idPersona;
  useEffect(() => {
    if (!idPersona || !cargadas || nuevas.every((valor) => estado.valores.includes(valor))) return;
    const union = [...new Set([...estado.valores, ...nuevas])];
    const recienDesbloqueadas = nuevas.filter((valor) => !estado.valores.includes(valor));
    setPorAnunciar((actual) => [...actual, ...recienDesbloqueadas.filter((valor) => !actual.includes(valor))]);
    setEstado({ para: idPersona, valores: union });
    guardar(idPersona, union);
    void guardarProgreso('desbloqueos', { claves: union });
    recienDesbloqueadas.forEach((clave) => registrarEvento('seccion_desbloqueada', { entidad: 'seccion', entidadId: clave }));
  }, [idPersona, cargadas, nuevas, estado.valores]);

  const valor = useMemo<ValorDesbloqueos>(
    () => (modoDemo ? TODO : { todo: false, desbloqueadas: new Set([...(cargadas ? estado.valores : []), ...nuevas]) }),
    [modoDemo, cargadas, estado.valores, nuevas],
  );
  const rol = persona?.rol;
  const anunciables = rol && !modoDemo ? porAnunciar.filter((clave) => anuncioDe(rol, clave)) : [];
  const actual = rol && anunciables.length > 0 ? anuncioDe(rol, anunciables[0]) : null;

  const claveActual = anunciables[0] ?? null;
  const avanzar = useCallback(() => {
    if (claveActual) registrarEvento('seccion_presentada', { entidad: 'seccion', entidadId: claveActual });
    setPorAnunciar((lista) => lista.slice(1));
  }, [claveActual]);
  useEffect(() => {
    if (claveActual) document.body.dataset.nuevo = claveActual;
    else delete document.body.dataset.nuevo;
    return () => { delete document.body.dataset.nuevo; };
  }, [claveActual]);

  useEffect(() => {
    if (porAnunciar.length > 0 && anunciables.length === 0) setPorAnunciar([]);
  }, [porAnunciar, anunciables.length]);

  return (
    <ContextoDesbloqueos.Provider value={valor}>
      {children}
      {actual && <GuiaDesbloqueo anuncio={actual} quedan={anunciables.length} alAvanzar={avanzar} />}
    </ContextoDesbloqueos.Provider>
  );
}
