import { lazy, Suspense, type ComponentType, type ReactElement } from 'react';
import { useSesion } from '../estado/sesion';

type Modulo = Record<string, unknown>;

// Una pantalla con dos versiones: la real (Supabase) y la de ejemplo (modo demo, datos ficticios).
// La de ejemplo se descarga solo cuando se usa el modo demo.
export const conModoDemo = (cargarEjemplo: () => Promise<Modulo>, nombre: string, Real: ComponentType): (() => ReactElement) => {
  const Ejemplo = lazy(() => cargarEjemplo().then((modulo) => ({ default: modulo[nombre] as ComponentType })));
  return function PantallaPorModo() {
    const { modoDemo } = useSesion();
    return modoDemo ? <Suspense fallback={null}><Ejemplo /></Suspense> : <Real />;
  };
};
