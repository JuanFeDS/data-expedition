import { useSyncExternalStore } from 'react';

type Tema = 'claro' | 'oscuro';

const CLAVE = 'tema-expedicion';

const leer = (): Tema => {
  try {
    return window.localStorage.getItem(CLAVE) === 'oscuro' ? 'oscuro' : 'claro';
  } catch {
    return 'claro';
  }
};

let actual: Tema = leer();
const oyentes = new Set<() => void>();

const aplicar = (tema: Tema) => {
  document.documentElement.dataset.tema = tema;
};
aplicar(actual);

export const alternarTema = () => {
  actual = actual === 'oscuro' ? 'claro' : 'oscuro';
  aplicar(actual);
  try {
    window.localStorage.setItem(CLAVE, actual);
  } catch {
    // sin almacenamiento: el tema vale solo para esta visita
  }
  oyentes.forEach((oyente) => oyente());
};

export const useTema = () =>
  useSyncExternalStore(
    (aviso) => {
      oyentes.add(aviso);
      return () => oyentes.delete(aviso);
    },
    () => actual,
  );

export function InterruptorTema() {
  const tema = useTema();
  return (
    <button className="interruptor-tema" role="switch" aria-checked={tema === 'oscuro'} onClick={alternarTema}>
      <span className="interruptor-tema__pista" aria-hidden="true"><i /></span>
      <span>Tema oscuro</span>
    </button>
  );
}
