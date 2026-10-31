import { describe, expect, it } from 'vitest';
import { calcularNota, resultadoEntrega } from '../../src/dominio/nota.ts';

describe('calcularNota', () => {
  it('promedia niveles ponderando por peso', () => {
    expect(calcularNota([{ nivel: 4, peso: 2 }, { nivel: 3, peso: 1 }])).toBe(3.7);
  });

  it('admite decimales por criterio', () => {
    expect(calcularNota([{ nivel: 3.5, peso: 1 }, { nivel: 4.5, peso: 1 }])).toBe(4);
  });

  it('falla sin criterios', () => {
    expect(() => calcularNota([])).toThrow(RangeError);
  });

  it('falla con un nivel fuera de escala', () => {
    expect(() => calcularNota([{ nivel: 6, peso: 1 }])).toThrow(RangeError);
  });
});

describe('resultadoEntrega', () => {
  it('"no presentó" no es una nota', () => {
    expect(resultadoEntrega(false, [])).toEqual({ estado: 'no_presento' });
  });

  it('calificada devuelve la nota', () => {
    expect(resultadoEntrega(true, [{ nivel: 5, peso: 1 }])).toEqual({ estado: 'calificada', nota: 5 });
  });
});
