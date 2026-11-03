import { describe, expect, it } from 'vitest';
import { nivelAValorRadar, valorDimension } from './radar.ts';

describe('nivelAValorRadar', () => {
  it.each([
    [1, 0],
    [2, 25],
    [3, 50],
    [3.5, 62.5],
    [5, 100],
  ])('nivel %s -> %s', (nivel, esperado) => {
    expect(nivelAValorRadar(nivel)).toBe(esperado);
  });

  it('rechaza niveles fuera de la escala', () => {
    expect(() => nivelAValorRadar(0)).toThrow(RangeError);
  });
});

describe('valorDimension', () => {
  it('promedia ponderando por peso', () => {
    expect(valorDimension([{ valor: 50, peso: 3 }, { valor: 100, peso: 1 }])).toBe(62.5);
  });

  it('devuelve null sin evidencia', () => {
    expect(valorDimension([])).toBeNull();
  });

  it('redondea a dos decimales', () => {
    expect(valorDimension([{ valor: 100, peso: 1 }, { valor: 0, peso: 2 }])).toBe(33.33);
  });
});
