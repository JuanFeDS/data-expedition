import { useEffect } from 'react';

const ESCALA_MINIMA = 0.6;

export function useAjusteAltura(ruta: string) {
  useEffect(() => {
    const escritorio = window.matchMedia('(min-width: 1100px)');
    if (document.documentElement.classList.contains('modo-completo')) return undefined;

    const cuerpo = () => document.querySelector<HTMLElement>('.escenario > .pantalla > .pantalla__cuerpo');
    let marco = 0;

    const ajustar = () => {
      const elemento = cuerpo();
      if (!elemento) return;
      elemento.style.zoom = '';
      if (!escritorio.matches) return;
      let escala = 1;
      for (let intento = 0; intento < 8; intento += 1) {
        const sobra = elemento.scrollHeight - elemento.clientHeight;
        if (sobra <= 1) break;
        escala = Math.max(ESCALA_MINIMA, escala * 0.985 * (elemento.clientHeight / elemento.scrollHeight));
        elemento.style.zoom = String(escala);
        if (escala === ESCALA_MINIMA) break;
      }
    };

    const programar = () => {
      window.clearTimeout(marco);
      marco = window.setTimeout(ajustar, 30);
    };

    const observador = new MutationObserver(programar);
    const vigilar = () => {
      const elemento = cuerpo();
      if (elemento) observador.observe(elemento, { childList: true, subtree: true, characterData: true });
    };

    vigilar();
    programar();
    const pendientes = [window.setTimeout(programar, 120), window.setTimeout(programar, 600)];
    window.addEventListener('resize', programar);
    document.addEventListener('load', programar, true);
    return () => {
      window.clearTimeout(marco);
      pendientes.forEach(window.clearTimeout);
      observador.disconnect();
      window.removeEventListener('resize', programar);
      document.removeEventListener('load', programar, true);
    };
  }, [ruta]);
}
