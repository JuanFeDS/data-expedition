export const NIVEL_MINIMO = 1;
export const NIVEL_MAXIMO = 5;
export const PASO_NIVEL = 0.5;

export function validarNivel(nivel: number): void {
  const enRango = Number.isFinite(nivel) && nivel >= NIVEL_MINIMO && nivel <= NIVEL_MAXIMO;
  const enPaso = Number.isInteger(nivel / PASO_NIVEL);
  if (!enRango || !enPaso) {
    throw new RangeError(
      `Nivel inválido: ${nivel}. Debe estar entre ${NIVEL_MINIMO} y ${NIVEL_MAXIMO} en pasos de ${PASO_NIVEL}`,
    );
  }
}
