# Semana 2 — Python y datos reales

Módulo del pensum: 2. Programación en Python para ciencia de datos (pandas, NumPy, Matplotlib y Seaborn, o Plotly según la votación).
Trabajo: **T1** EDA reproducible (entrega al final de la S4).
Dimensiones: Datos, Análisis, Comunicación, Producción y Dirección de IA.
Elasticidad: **elástica**. La ruta sale de la verificación de la S2.

Sesiones virtuales de 180 min con bloques de 40 a 50 min y pausas de 10 min.

---

## S3 — pandas avanzado (virtual, sesión A)

**Objetivo:** que cada estudiante combine y limpie datos de varias fuentes con pandas, entienda la vectorización con NumPy y escriba código con nombres claros.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–15 | Retro y votación | Planning de la semana en el tablero. Votación en vivo: «¿qué hace este `merge`?» con tres opciones |
| 15–55 | Concepto | `merge` y `join`, `groupby` con varias agregaciones, funciones de ventana, valores nulos y tipos. Vectorización con NumPy frente a bucles. Convenciones de nombres y PEP 8, con Pylint. Una pregunta relámpago con bonificación |
| 55–65 | Pausa | |
| 65–115 | Laboratorio guiado | Se parte de dos tablas sucias y se llega a un dataset limpio, en vivo y paso a paso |
| 115–125 | Pausa | |
| 125–165 | Práctica por niveles | Base, Estándar, Reto, en salas pequeñas con apoyo |
| 165–180 | Cierre | Resumen, recordatorio del T1 y XP de la sesión |

**Según la ruta:**
- Nivelación: se dedica a pandas básico (selección, filtros, `groupby` simple) y el laboratorio es más corto.
- Profundización: pandas avanzado y rendimiento (índices, `apply` frente a vectorizado) y los datos son más grandes.

**Material complementario**
- [EN] Guías oficiales de pandas: [combinar tablas](https://pandas.pydata.org/docs/user_guide/merging.html), [groupby](https://pandas.pydata.org/docs/user_guide/groupby.html) y [ventanas](https://pandas.pydata.org/docs/user_guide/window.html)
- [EN] NumPy, guía rápida: [numpy.org](https://numpy.org/doc/stable/user/quickstart.html)
- [EN] PEP 8, guía de estilo: [peps.python.org/pep-0008](https://peps.python.org/pep-0008/)
- [EN] Pylint: [pylint.readthedocs.io](https://pylint.readthedocs.io/en/stable/)
- Pendiente: un video en español sobre `merge` y `groupby`.

## S4 — Visualización y EDA (virtual, sesión B)

**Objetivo:** elegir con criterio la librería de visualización del curso y hacer un EDA reproducible.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–10 | Preguntas pendientes | |
| 10–50 | Teoría de visualización con demostraciones | Qué gráfico responde qué pregunta, color, escalas y errores comunes. El mismo gráfico se muestra en Matplotlib y Seaborn y en Plotly |
| 50–60 | Votación | Los estudiantes votan la librería que se usará en el T1 y en el resto del curso. Se anuncia la ganadora |
| 60–70 | Pausa | |
| 70–120 | Trabajo del PR | En parejas o equipos, en salas. Dataset común con una pregunta propia por pareja, usando la librería ganadora |
| 120–130 | Pausa | |
| 130–160 | Revisión al azar | Se sortean 2 o 3 parejas; comparten pantalla 3 min y reciben dos comentarios del grupo |
| 160–180 | Cierre | Plazo del PR y carga del enlace en la app, aprobación cruzada de la pareja (sin fusionar) y encuesta de pulso |

Si gana Plotly, se mantiene un ejemplo corto de Matplotlib como referencia, porque el pensum nombra Matplotlib y Seaborn.

**Materiales:** dataset del EDA, plantilla de notebook reproducible, guía rápida de gráficos, el mismo gráfico preparado en las tres librerías.

**Material complementario**
- [EN] Fundamentals of Data Visualization, de Claus Wilke (gratis en línea): [clauswilke.com/dataviz](https://clauswilke.com/dataviz/)
- [EN] Tutorial de Seaborn: [seaborn.pydata.org](https://seaborn.pydata.org/tutorial.html)
- [EN] Guía rápida de Matplotlib: [matplotlib.org](https://matplotlib.org/stable/users/explain/quick_start.html)
- [EN] Plotly para Python: [plotly.com/python](https://plotly.com/python/)
- Pendiente: un video en español sobre elección de gráficos.

## Rúbrica de T1 — EDA reproducible

| Criterio | Dimensión | Nivel 5 se ve así |
|---|---|---|
| Limpieza justificada y reproducible | Datos | El notebook corre de arriba abajo sin errores y cada decisión está explicada |
| Preguntas y hallazgos | Análisis | Plantea preguntas útiles y las responde con evidencia |
| Gráficos y mensaje | Comunicación | Cada gráfico tiene título, ejes y una conclusión en una frase |
| Calidad del código y tablero | Producción | Pasa Black y Pylint sin errores; el PR cierra un issue del tablero |
| Declaración de IA | Dirección de IA | Bitácora con prompts, correcciones y verificación del resultado |

## Votación en vivo (ejemplos)

1. «¿Qué devuelve este `groupby`?» (tres opciones).
2. «¿Qué gráfico usarías para ver la relación entre dos variables numéricas?»
3. La votación de la librería de visualización (S4).
