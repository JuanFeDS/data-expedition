import { valorDimension, type Evidencia } from '../dominio/radar.ts';
import type { RepositorioEvidencias } from '../puertos/repositorio-evidencias.ts';

export interface ValorRadar {
  dimensionId: string;
  valor: number;
}

export async function calcularRadar(estudianteId: string, repositorio: RepositorioEvidencias): Promise<ValorRadar[]> {
  const evidencias = await repositorio.obtenerPorEstudiante(estudianteId);
  const porDimension = new Map<string, Evidencia[]>();
  for (const { dimensionId, valor, peso } of evidencias) {
    porDimension.set(dimensionId, [...(porDimension.get(dimensionId) ?? []), { valor, peso }]);
  }
  const radar: ValorRadar[] = [];
  for (const [dimensionId, evidenciasDimension] of porDimension) {
    const valor = valorDimension(evidenciasDimension);
    if (valor !== null) {
      radar.push({ dimensionId, valor });
    }
  }
  return radar;
}
