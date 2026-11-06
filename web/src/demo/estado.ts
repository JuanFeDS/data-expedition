import { useSyncExternalStore } from 'react';
import { inicioDeRol, type Rol } from '../compartido/navegacion/navegacion';
import { RECORRIDO } from './recorrido';

interface EstadoDemo {
  rol: Rol | null;
  explorados: string[];
  vistos: Rol[];
}

const CLAVE = 'demo-exploracion';
const ROLES: Rol[] = ['estudiante', 'docente', 'observador'];
const VACIO: EstadoDemo = { rol: null, explorados: [], vistos: [] };

const leer = (): EstadoDemo => {
  try {
    const guardado = JSON.parse(window.sessionStorage.getItem(CLAVE) ?? 'null') as EstadoDemo | null;
    if (guardado && Array.isArray(guardado.vistos) && Array.isArray(guardado.explorados)) return guardado;
  } catch {
    return VACIO;
  }
  return VACIO;
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

export const irA = (ruta: string) => {
  window.location.hash = `#/${ruta}`;
};

export const useEstadoDemo = () => useSyncExternalStore(
  (oyente) => { oyentes.add(oyente); return () => oyentes.delete(oyente); },
  () => estado,
);

export const pendientesDe = (rol: Rol, explorados: string[]) => RECORRIDO[rol].filter((paso) => !explorados.includes(paso.ruta));

export const iniciarRecorrido = (rol: Rol) => {
  const propias = RECORRIDO[rol].map((paso) => paso.ruta);
  cambiar({ rol, explorados: estado.explorados.filter((ruta) => !propias.includes(ruta)), vistos: estado.vistos.includes(rol) ? estado.vistos : [...estado.vistos, rol] });
  irA(RECORRIDO[rol][0].ruta);
};

export const entrarComo = (rol: Rol) => {
  if (estado.vistos.includes(rol)) {
    cambiar({ ...estado, rol: null });
    window.location.hash = inicioDeRol[rol];
  } else iniciarRecorrido(rol);
};

export const marcarExplorado = (ruta: string) => {
  if (!estado.explorados.includes(ruta)) cambiar({ ...estado, explorados: [...estado.explorados, ruta] });
};

export const terminarRecorrido = () => cambiar({ ...estado, rol: null });

export const siguienteRolSinVer = (): Rol | null => ROLES.find((rol) => !estado.vistos.includes(rol)) ?? null;

export const reiniciarEstadoDemo = () => cambiar({ ...VACIO });
