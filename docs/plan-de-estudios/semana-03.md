# Semana 3 — Modelado predictivo

Módulo del pensum: 3. Modelado predictivo con Machine Learning (regresión, clasificación, scikit-learn, evaluación de modelos).
Trabajo: **T2** Modelo frente a baseline (entrega al final de la S6).
Dimensiones: Modelado, Validación, Análisis y Dirección de IA.
Elasticidad: **núcleo fijo**. Solo se añade un bloque de estadística si la regla de Validación lo pide.

---

## S5 — Regresión y evaluación básica (virtual, sesión A)

**Objetivo:** entrenar un primer modelo, separar datos de entrenamiento y prueba, y leer las métricas.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–15 | Retro y votación | «¿Qué crees que predice mejor, la media o una recta?» |
| 15–55 | Concepto | Qué es predecir, regresión lineal, partición train/test, error cuadrático medio y R². Por qué un modelo sin baseline no dice nada |
| 55–65 | Pausa | |
| 65–115 | Laboratorio guiado | Un dataset de precios: baseline de la media, regresión lineal, métricas |
| 115–125 | Pausa | |
| 125–165 | Práctica por niveles | Base: seguir el laboratorio con otro dataset. Estándar: añadir variables. Reto: comparar dos modelos |
| 165–180 | Cierre | Resumen y pregunta para la S6 |

**Bloque opcional (si Validación sale baja en el diagnóstico):** 25 min de estadística, con distribuciones, sesgo y varianza, entre el concepto y la pausa.

## S6 — Clasificación, pipelines y baseline (virtual, sesión B)

**Objetivo:** construir un clasificador reproducible y compararlo con un baseline.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–10 | Preguntas pendientes | |
| 10–70 | Trabajo del PR | En parejas o equipos, en salas. Clasificación con regresión logística y un árbol de decisión |
| 70–80 | Pausa | |
| 80–130 | Avance individual | Pipelines de scikit-learn, matriz de confusión, precisión y recall |
| 130–140 | Pausa | |
| 140–170 | Revisión al azar | 3 min por pareja: «¿qué baseline usaste y qué tanto lo supera tu modelo?» |
| 170–180 | Cierre | Plazo del PR y bitácora de IA |

## Rúbrica de T2 — Modelo frente a baseline

| Criterio | Dimensión | Nivel 5 se ve así |
|---|---|---|
| Elección y entrenamiento del modelo | Modelado | Modelo adecuado al problema, con pipeline y sin fuga de datos |
| Comparación con baseline | Validación | Baseline claro, métricas apropiadas y lectura honesta de cuánto mejora |
| Lectura de resultados | Análisis | Explica en palabras qué errores comete el modelo y por qué |
| Declaración de IA | Dirección de IA | Bitácora que muestra qué se verificó del código generado |

## Votación en vivo (ejemplos)

1. «Un modelo acierta el 95 %. ¿Qué te falta saber?» (el desbalance de clases).
2. «¿Qué métrica te importa más al detectar fraude?»
