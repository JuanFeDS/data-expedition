import { describe, expect, it } from 'vitest';
import { calcularRadar } from '../../src/casos-de-uso/calcular-radar.ts';
import type { RepositorioEvidencias } from '../../src/puertos/repositorio-evidencias.ts';

describe('calcularRadar', () => {
  it('calcula un valor por dimensión a partir de la evidencia', async () => {
    const repositorio: RepositorioEvidencias = {
      obtenerPorEstudiante: async () => [
        { dimensionId: 'datos', valor: 50, peso: 1 },
        { dimensionId: 'datos', valor: 100, peso: 1 },
        { dimensionId: 'modelado', valor: 25, peso: 2 },
      ],
    };
    expect(await calcularRadar('estudiante-1', repositorio)).toEqual([
      { dimensionId: 'datos', valor: 75 },
      { dimensionId: 'modelado', valor: 25 },
    ]);
  });

  it('no incluye dimensiones sin evidencia', async () => {
    const repositorio: RepositorioEvidencias = { obtenerPorEstudiante: async () => [] };
    expect(await calcularRadar('estudiante-1', repositorio)).toEqual([]);
  });
});
