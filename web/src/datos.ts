export interface DimensionRadar {
  nombre: string;
  inicio: number;
  ahora: number;
}

export const dimensiones: DimensionRadar[] = [
  { nombre: 'Datos', inicio: 40, ahora: 62 },
  { nombre: 'Análisis', inicio: 35, ahora: 55 },
  { nombre: 'Modelado', inicio: 25, ahora: 48 },
  { nombre: 'Validación', inicio: 30, ahora: 30 },
  { nombre: 'Comunicación', inicio: 55, ahora: 70 },
  { nombre: 'Producción', inicio: 20, ahora: 34 },
  { nombre: 'Dirección de IA', inicio: 45, ahora: 66 },
];

export interface CriterioNota {
  nombre: string;
  dimension: string;
  nivel: number;
  peso: number;
}

export const criteriosTrabajo1: CriterioNota[] = [
  { nombre: 'Limpieza de datos', dimension: 'Datos', nivel: 4.5, peso: 2 },
  { nombre: 'Preguntas de análisis', dimension: 'Análisis', nivel: 5, peso: 2 },
  { nombre: 'Visualización', dimension: 'Comunicación', nivel: 4, peso: 1 },
  { nombre: 'Reproducibilidad', dimension: 'Producción', nivel: 3.5, peso: 1 },
  { nombre: 'Bitácora de IA', dimension: 'Dirección de IA', nivel: 4, peso: 1 },
];
