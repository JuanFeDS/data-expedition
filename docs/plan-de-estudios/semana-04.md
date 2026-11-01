# Semana 4 — Big Data y procesamiento distribuido

Módulo del pensum: 1 (Big Data, Hadoop, escalabilidad) y 4. Procesamiento avanzado con frameworks (Spark, procesamiento distribuido, datasets masivos).
Trabajo: **T3** Mismo análisis en Spark, con comparación (entrega al final de la S8).
Dimensiones: Producción, Datos, Análisis y Dirección de IA.
Elasticidad: **elástica**. En la ruta de nivelación se reduce a concepto y un laboratorio corto.

PySpark se ejecuta en Colab (`pip install pyspark`), así que no requiere instalación local.

---

## S7 — Big Data y Spark (virtual, sesión A)

**Objetivo:** entender por qué existe el procesamiento distribuido y escribir las primeras transformaciones en PySpark.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–15 | Retro y votación | «¿Cuándo deja de bastar pandas?» |
| 15–55 | Concepto | Las 3 V del Big Data, Hadoop y su lugar actual, escalabilidad horizontal, Spark, evaluación perezosa, transformaciones frente a acciones |
| 55–65 | Pausa | |
| 65–115 | Laboratorio guiado | PySpark DataFrames: leer, filtrar, agrupar y contar, con un dataset de millones de filas |
| 115–125 | Pausa | |
| 125–165 | Práctica por niveles | Base: repetir el laboratorio. Estándar: sumar uniones. Reto: medir el plan de ejecución |
| 165–180 | Cierre | Resumen y anuncio del T3 |

## S8 — PySpark SQL y comparación con pandas (virtual, sesión B)

**Objetivo:** resolver el mismo análisis en pandas y en Spark y explicar cuándo conviene cada uno.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–10 | Preguntas pendientes | |
| 10–70 | Trabajo del PR | En parejas o equipos, en salas. Se parte del análisis del T1 y se rehace en Spark |
| 70–80 | Pausa | |
| 80–130 | Avance individual | Spark SQL, particiones, medición de tiempos de ejecución |
| 130–140 | Pausa | |
| 140–170 | Revisión al azar | 3 min por pareja: «¿qué te sorprendió al pasar a Spark?» |
| 170–180 | Cierre | Plazo del PR y bitácora de IA |

## Rúbrica de T3 — Mismo análisis en Spark

| Criterio | Dimensión | Nivel 5 se ve así |
|---|---|---|
| Análisis correcto en Spark | Datos | El resultado coincide con el de pandas y el código es limpio |
| Comparación de rendimiento | Producción | Mide tiempos, explica el costo de cada herramienta y cuándo elegir cada una |
| Interpretación del resultado | Análisis | Las conclusiones se sostienen en los números |
| Declaración de IA | Dirección de IA | Bitácora con las correcciones hechas al código generado |

## Votación en vivo (ejemplos)

1. «¿Qué ejecuta Spark al llamar `.filter()`?» (nada, hasta que haya una acción).
2. «¿Usarías Spark para un archivo de 50 MB?»
