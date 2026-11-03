import { useEffect, type ReactNode } from 'react';
import { registrarEvento } from '../servicios/eventos';
import { analizarRuta } from './navegacion';
import { useSesion } from './sesion';

const leerRuta = () => window.location.hash.replace(/^#\/?/, '');

// Registra cada pantalla que ve una persona con sesión, con el curso en el que estaba.
export function ActividadProvider({ children }: { children: ReactNode }) {
  const { persona } = useSesion();
  const idPersona = persona?.id ?? null;

  useEffect(() => {
    if (!idPersona) return undefined;
    const registrar = () => {
      const { cursoId, codigo } = analizarRuta(leerRuta());
      registrarEvento('pantalla_vista', { edicionId: cursoId, entidad: 'pantalla', entidadId: codigo });
    };
    registrar();
    window.addEventListener('hashchange', registrar);
    return () => window.removeEventListener('hashchange', registrar);
  }, [idPersona]);

  return <>{children}</>;
}
