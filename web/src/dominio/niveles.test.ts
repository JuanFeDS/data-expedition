import { describe, expect, it } from 'vitest';
import { validarNivel } from './niveles.ts';

describe('validarNivel', () => {
  it.each([1, 1.5, 3, 3.5, 5])('acepta %s', (nivel) => {
    expect(() => validarNivel(nivel)).not.toThrow();
  });

  it.each([0, 0.5, 5.5, 6, 3.3, 2.75, Number.NaN, Number.POSITIVE_INFINITY])('rechaza %s', (nivel) => {
    expect(() => validarNivel(nivel)).toThrow(RangeError);
  });
});
