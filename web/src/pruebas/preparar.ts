import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom no trae matchMedia: se simula sin preferencias activas (por ejemplo, sin «reducir movimiento»).
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (consulta: string) => ({ matches: false, media: consulta, onchange: null, addEventListener: () => undefined, removeEventListener: () => undefined, addListener: () => undefined, removeListener: () => undefined, dispatchEvent: () => false }),
  });
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
});
