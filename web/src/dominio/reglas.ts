// Reglas de negocio ajustables. Las marcadas con «SQL» también viven en una función de la base:
// si cambias una, cambia la otra (y las pruebas de supabase/pruebas/funciones_y_politicas.sql).

/** SQL: terminar_practica (migración 0013). */
export const XP_POR_SESION = 30;
export const META_XP_SEMANA = 200;
export const XP_POR_NIVEL = 500;
export const PREGUNTAS_POR_SESION = 5;

/** Resultado de Datos (0 a 100) que separa nivelación, estándar y profundización. */
export const UMBRAL_NIVELACION = 50;
export const UMBRAL_PROFUNDIZACION = 80;

/** SQL: calcular_codigo_asistencia y codigo_asistencia (migración 0015). */
export const SEGUNDOS_CODIGO_ASISTENCIA = 20;

/** Cada cuánto se refrescan las pantallas en vivo (milisegundos). */
export const REFRESCO_EN_VIVO_MS = 3000;
