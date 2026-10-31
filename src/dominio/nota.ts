import { validarNivel } from './niveles.ts';

export interface CriterioCalificado {
  nivel: number;
  peso: number;
}

export type ResultadoEntrega = { estado: 'no_presento' } | { estado: 'calificada'; nota: number };

// Regla provisional (promedio ponderado de niveles, un decimal): Juan aún no definió cómo se pasa de rúbrica a nota.
export const DECIMALES_NOTA = 1;

export function calcularNota(criterios: CriterioCalificado[], decimales: number = DECIMALES_NOTA): number {
  const pesoTotal = criterios.reduce((suma, criterio) => suma + criterio.peso, 0);
  if (criterios.length === 0 || pesoTotal <= 0) {
    throw new RangeError('Se necesita al menos un criterio con peso positivo para calcular la nota');
  }
  criterios.forEach((criterio) => validarNivel(criterio.nivel));
  const promedio = criterios.reduce((suma, criterio) => suma + criterio.nivel * criterio.peso, 0) / pesoTotal;
  const factor = 10 ** decimales;
  return Math.round(promedio * factor) / factor;
}

export function resultadoEntrega(presento: boolean, criterios: CriterioCalificado[]): ResultadoEntrega {
  if (!presento) {
    return { estado: 'no_presento' };
  }
  return { estado: 'calificada', nota: calcularNota(criterios) };
}
