# Semana 7 — Optimización y validación de modelos

Módulo del pensum: 7. Optimización y validación de modelos (hyperparameter tuning, validación cruzada, interpretación con SHAP y LIME).
Trabajo: **T6** Modelo optimizado e interpretado (entrega al final de la S14) y tarea de la forma B del diagnóstico.
Dimensiones: Validación, Modelado, Comunicación, Producción y Dirección de IA.
Elasticidad: **núcleo fijo**.

---

## S13 — Validación cruzada y ajuste de hiperparámetros (virtual, sesión A)

**Objetivo:** estimar con honestidad el rendimiento de un modelo y mejorarlo sin sobreajustar.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–15 | Retro y votación | Planning del sprint. «¿Por qué un modelo que acierta el 99 % en entrenamiento puede ser malo?» |
| 15–55 | Concepto | Sobreajuste, validación cruzada, `GridSearchCV` y `RandomizedSearchCV`, fuga de datos. Una pregunta relámpago con bonificación |
| 55–65 | Pausa | |
| 65–115 | Laboratorio guiado | Se parte del modelo del T2 y del ensamble de la S11: validación cruzada, búsqueda de hiperparámetros, comparación |
| 115–125 | Pausa | |
| 125–165 | Práctica por niveles | Base: validación cruzada. Estándar: búsqueda en rejilla. Reto: comparar tres modelos con la misma métrica |
| 165–180 | Cierre | Resumen y anuncio del T6 |

**Material complementario**
- [EN] Validación cruzada en scikit-learn: [scikit-learn.org](https://scikit-learn.org/stable/modules/cross_validation.html)
- [EN] Ajuste de hiperparámetros en scikit-learn: [scikit-learn.org](https://scikit-learn.org/stable/modules/grid_search.html)
- [ES] Grid search de modelos Random Forest con out-of-bag error y early stopping (cubre el ajuste, no la validación cruzada): [py36](https://www.cienciadedatos.net/documentos/py36-grid-search-random-forest-out-of-bag-error-early-stopping)
- Pendiente: un tutorial o video en español sobre validación cruzada en Python.

## S14 — Interpretación con SHAP y LIME (virtual, sesión B)

**Objetivo:** explicar por qué el modelo predice lo que predice y comunicarlo.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–10 | Preguntas pendientes | |
| 10–70 | Trabajo del PR | En parejas o equipos, en salas: SHAP global y local sobre el modelo optimizado |
| 70–80 | Pausa | |
| 80–130 | Avance individual | LIME para casos individuales; qué decir y qué no sobre importancia de variables |
| 130–140 | Pausa | |
| 140–170 | Revisión al azar | 3 min por pareja: «¿qué variable pesa más y por qué te lo crees?» |
| 170–180 | Cierre | Plazo del PR y tarea de la forma B, con carga del enlace en la app y aprobación cruzada (sin fusionar) |

**Tarea de la forma B (máximo 60 min):** mismo formato que el diagnóstico inicial, con ejercicios paralelos. Se entrega por PR antes de la S15.

**Material complementario**
- [EN] Interpretable Machine Learning, de Christoph Molnar (gratis en línea; capítulos de SHAP y LIME): [christophm.github.io](https://christophm.github.io/interpretable-ml-book/)
- [EN] SHAP, documentación oficial: [shap.readthedocs.io](https://shap.readthedocs.io/en/latest/)
- [EN] LIME: [github.com/marcotcr/lime](https://github.com/marcotcr/lime)
- [ES] Gráficos ICE y PDP para interpretar modelos predictivos: [py16](https://www.cienciadedatos.net/documentos/py16-interpretacion-modelos-graficos-pdp-ice)
- Pendiente: un video en español sobre interpretabilidad de modelos.

## Rúbrica de T6 — Modelo optimizado e interpretado

| Criterio | Dimensión | Nivel 5 se ve así |
|---|---|---|
| Validación del modelo | Validación | Validación cruzada correcta, sin fuga, con intervalos o variabilidad reportada |
| Optimización | Modelado | Búsqueda de hiperparámetros razonable y justificada |
| Interpretación | Comunicación | Explica con SHAP o LIME en palabras sencillas y reconoce sus límites |
| Calidad del código y tablero | Producción | Pasa Black y Pylint sin errores; el PR cierra un issue del tablero |
| Declaración de IA | Dirección de IA | Bitácora con la verificación de lo que generó la IA |

## Votación en vivo (ejemplos)

1. «¿Qué indica una gran diferencia entre el puntaje de entrenamiento y el de validación?»
2. «¿Qué te dice SHAP que LIME no?»
