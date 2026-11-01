# Semana 2 — Python y datos reales

Módulo del pensum: 2. Programación en Python para ciencia de datos (pandas, NumPy, Matplotlib y Seaborn).
Trabajo: **T1** EDA reproducible (entrega al final de la S4).
Dimensiones: Datos, Análisis, Comunicación y Dirección de IA.
Elasticidad: **elástica**. La ruta sale de la verificación de la S2.

Sesiones virtuales de 180 min con bloques de 40 a 50 min y pausas de 10 min.

---

## S3 — pandas avanzado (virtual, sesión A)

**Objetivo:** que cada estudiante combine y limpie datos de varias fuentes con pandas y entienda la vectorización con NumPy.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–15 | Retro y votación | Qué salió mal con la semana anterior. Votación en vivo: «¿qué hace este `merge`?» con tres opciones |
| 15–55 | Concepto | `merge` y `join`, `groupby` con varias agregaciones, funciones de ventana, valores nulos y tipos. Vectorización con NumPy frente a bucles |
| 55–65 | Pausa | |
| 65–115 | Laboratorio guiado | Se parte de dos tablas sucias y se llega a un dataset limpio, en vivo y paso a paso |
| 115–125 | Pausa | |
| 125–165 | Práctica por niveles | Base, Estándar, Reto, en salas pequeñas con apoyo |
| 165–180 | Cierre | Resumen, recordatorio del T1 y XP de la sesión |

**Según la ruta:**
- Nivelación: se dedica a pandas básico (selección, filtros, `groupby` simple) y el laboratorio es más corto.
- Profundización: pandas avanzado y rendimiento (índices, `apply` frente a vectorizado) y los datos son más grandes.

## S4 — EDA con Matplotlib y Seaborn (virtual, sesión B)

**Objetivo:** hacer un análisis exploratorio reproducible y contar lo que se encontró.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–10 | Preguntas pendientes | |
| 10–70 | Trabajo del PR | En parejas o equipos, en salas. Dataset común con una pregunta propia por pareja |
| 70–80 | Pausa | |
| 80–130 | Avance individual | Gráficos con Matplotlib y Seaborn; qué gráfico responde qué pregunta |
| 130–140 | Pausa | |
| 140–170 | Revisión al azar | Se sortean 2 o 3 parejas; comparten pantalla 3 min y reciben dos comentarios del grupo |
| 170–180 | Cierre | Plazo del PR y la bitácora de IA |

**Materiales:** dataset del EDA, plantilla de notebook reproducible, guía rápida de gráficos.

## Rúbrica de T1 — EDA reproducible

| Criterio | Dimensión | Nivel 5 se ve así |
|---|---|---|
| Limpieza justificada y reproducible | Datos | El notebook corre de arriba abajo sin errores y cada decisión está explicada |
| Preguntas y hallazgos | Análisis | Plantea preguntas útiles y las responde con evidencia |
| Gráficos y mensaje | Comunicación | Cada gráfico tiene título, ejes y una conclusión en una frase |
| Declaración de IA | Dirección de IA | Bitácora con prompts, correcciones y verificación del resultado |

## Votación en vivo (ejemplos)

1. «¿Qué devuelve este `groupby`?» (tres opciones).
2. «¿Qué gráfico usarías para ver la relación entre dos variables numéricas?»
