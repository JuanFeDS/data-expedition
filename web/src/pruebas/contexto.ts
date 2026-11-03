import { vi } from 'vitest';
import { enCurso } from '../compartido/navegacion/navegacion';

// Estado de sesión y de curso para probar pantallas sin los proveedores reales.
// Cada prueba lo ajusta antes de dibujar: contexto.sesion.persona = { … }.
export const contexto = {
  sesion: { modoDemo: false, cargando: false, persona: { id: 'yo', rol: 'estudiante', nombre: 'Ana Pérez', usuario: 'ana', correo: 'ana@x.com' } as { id: string; rol: string; nombre: string | null; usuario: string | null; correo: string } | null, cerrarSesion: vi.fn() },
  curso: { curso: { id: 'c1', nombre: 'Prueba' } as { id: string; nombre: string } | null, dentro: true, reciente: { id: 'c1', nombre: 'Prueba' }, cursos: [{ id: 'c1', nombre: 'Prueba' }], conteos: {}, cargando: false },
};

export const sesionSimulada = { useSesion: () => contexto.sesion };

export const cursoSimulado = {
  useCurso: () => contexto.curso,
  useRutaCurso: () => (ruta: string | undefined) => (ruta && contexto.curso.dentro && contexto.curso.curso ? enCurso(ruta, contexto.curso.curso.id) : ruta),
};

export const confirmarSimulado = { useConfirmar: () => vi.fn(async () => true) };

export const reiniciarContexto = () => {
  contexto.sesion.modoDemo = false;
  contexto.sesion.persona = { id: 'yo', rol: 'estudiante', nombre: 'Ana Pérez', usuario: 'ana', correo: 'ana@x.com' };
  contexto.curso.dentro = true;
  contexto.curso.curso = { id: 'c1', nombre: 'Prueba' };
};
