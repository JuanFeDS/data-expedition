import { NIVEL_MAXIMO, NIVEL_MINIMO, validarNivel } from './niveles.ts';

export interface Evidencia {
  valor: number;
  peso: number;
}

export function nivelAValorRadar(nivel: number): number {
  validarNivel(nivel);
  return ((nivel - NIVEL_MINIMO) / (NIVEL_MAXIMO - NIVEL_MINIMO)) * 100;
}

export function valorDimension(evidencias: Evidencia[]): number | null {
  const pesoTotal = evidencias.reduce((suma, evidencia) => suma + evidencia.peso, 0);
  if (pesoTotal <= 0) {
    return null;
  }
  const ponderado = evidencias.reduce((suma, evidencia) => suma + evidencia.valor * evidencia.peso, 0);
  return Math.round((ponderado / pesoTotal) * 100) / 100;
}
