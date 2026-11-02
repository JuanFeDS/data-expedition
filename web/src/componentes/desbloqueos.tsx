import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useCurso } from './curso';
import { analizarRuta, type Rol } from './navegacion';
import { useSesion } from './sesion';

// Secciones de un curso que se van mostrando poco a poco y, una vez desbloqueadas, no vuelven a esconderse.
const AL_ENTRAR_A_UN_CURSO: Record<Rol, string[]> = { estudiante: ['curso', 'e5'], docente: ['curso', 'd13'], observador: [] };
const AL_VISITAR: Record<string, string> = { d13: 'd14', d14: 'd3' };
const DE_CURSO = new Set(['curso', 'e5', 'd3', 'd13', 'd14']);

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

  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  const idPersona = persona?.id ?? null;
  useEffect(() => { setEstado({ para: idPersona, valores: idPersona ? leer(idPersona) : [] }); }, [idPersona]);

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
    setEstado({ para: idPersona, valores: union });
    guardar(idPersona, union);
  }, [idPersona, cargadas, nuevas, estado.valores]);

  const valor = useMemo<ValorDesbloqueos>(
    () => (modoDemo ? TODO : { todo: false, desbloqueadas: new Set([...(cargadas ? estado.valores : []), ...nuevas]) }),
    [modoDemo, cargadas, estado.valores, nuevas],
  );
  return <ContextoDesbloqueos.Provider value={valor}>{children}</ContextoDesbloqueos.Provider>;
}
