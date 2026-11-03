import type { ComponentType, ReactElement } from 'react';
import { useSesion } from '../estado/sesion';

// Una pantalla con dos versiones: la de ejemplo (modo demo, datos ficticios) y la real (Supabase).
export const conModoDemo = (Ejemplo: ComponentType, Real: ComponentType): (() => ReactElement) => function PantallaPorModo() {
  const { modoDemo } = useSesion();
  return modoDemo ? <Ejemplo /> : <Real />;
};
