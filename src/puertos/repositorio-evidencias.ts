import type { Evidencia } from '../dominio/radar.ts';

export interface EvidenciaDeDimension extends Evidencia {
  dimensionId: string;
}

export interface RepositorioEvidencias {
  obtenerPorEstudiante(estudianteId: string): Promise<EvidenciaDeDimension[]>;
}
