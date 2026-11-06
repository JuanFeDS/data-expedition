import { useSyncExternalStore } from 'react';
import { inicioDeRol, type Rol } from '../compartido/navegacion/navegacion';
import { RECORRIDO } from './recorrido';

interface EstadoDemo {
  rol: Rol | null;
  paso: number;
  vistos: Rol[];
}

const CLAVE = 'demo-recorrido';
const ROLES: Rol[] = ['estudiante', 'docente', 'observador'];

const leer = (): EstadoDemo => {
  try {
    const guardado = JSON.parse(window.sessionStorage.getItem(CLAVE) ?? 'null') as EstadoDemo | null;
    if (guardado && Array.isArray(guardado.vistos)) return guardado;
  } catch {
    return { rol: null, paso: 0, vistos: [] };
  }
  return { rol: null, paso: 0, vistos: [] };
};

let estado = leer();
const oyentes = new Set<() => void>();

const cambiar = (siguiente: EstadoDemo) => {
  estado = siguiente;
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // sin almacenamiento el recorrido igual funciona durante la visita
  }
  oyentes.forEach((oyente) => oyente());
};

const irA = (ruta: string) => {
  window.location.hash = `#/${ruta}`;
};

export const useEstadoDemo = () => useSyncExternalStore(
  (oyente) => { oyentes.add(oyente); return () => oyentes.delete(oyente); },
  () => estado,
);

export const iniciarRecorrido = (rol: Rol) => {
  cambiar({ rol, paso: 0, vistos: estado.vistos.includes(rol) ? estado.vistos : [...estado.vistos, rol] });
  irA(RECORRIDO[rol][0].ruta);
};

export const entrarComo = (rol: Rol) => {
  if (estado.vistos.includes(rol)) {
    cambiar({ ...estado, rol: null });
    window.location.hash = inicioDeRol[rol];
  } else iniciarRecorrido(rol);
};

export const irAlPaso = (paso: number) => {
  if (estado.rol === null) return;
  const pasos = RECORRIDO[estado.rol];
  const destino = Math.max(0, Math.min(pasos.length - 1, paso));
  cambiar({ ...estado, paso: destino });
  irA(pasos[destino].ruta);
};

export const terminarRecorrido = () => cambiar({ ...estado, rol: null });

export const siguienteRolSinVer = (): Rol | null => ROLES.find((rol) => !estado.vistos.includes(rol)) ?? null;

export const reiniciarEstadoDemo = () => cambiar({ rol: null, paso: 0, vistos: [] });
