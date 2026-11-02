# Semana 4 — Big Data y procesamiento distribuido

Módulo del pensum: 1 (Big Data, Hadoop, escalabilidad) y 4. Procesamiento avanzado con frameworks (Spark, procesamiento distribuido, datasets masivos).
Trabajo: **T3** Mismo análisis en Spark, con comparación (entrega al final de la S8).
Dimensiones: Producción, Datos, Análisis y Dirección de IA.
Elasticidad: **elástica**. En la ruta de nivelación se reduce a concepto y un laboratorio corto.

**Sin instalación:** PySpark corre en un **GitHub Codespace** con Java y PySpark ya instalados (un contenedor de desarrollo incluido en el repo plantilla). Cada estudiante lo abre desde su cuenta personal, trabaja en el navegador o en su VS Code y lo detiene al terminar. La cuenta gratuita incluye 120 horas-núcleo al mes (60 h en una máquina de 2 núcleos). Respaldo: instalación local con JDK 17.

---

## S7 — Big Data y Spark (virtual, sesión A)

**Objetivo:** entender por qué existe el procesamiento distribuido y escribir las primeras transformaciones en PySpark.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–15 | Retro y votación | Planning de la semana. «¿Cuándo deja de bastar pandas?» |
| 15–55 | Concepto | Las 3 V del Big Data, Hadoop y su lugar actual, escalabilidad horizontal, Spark, evaluación perezosa, transformaciones frente a acciones. Una pregunta relámpago con bonificación |
| 55–65 | Pausa | |
| 65–115 | Laboratorio guiado | Abrir el Codespace (10 min) y escribir PySpark DataFrames: leer, filtrar, agrupar y contar, con un dataset de millones de filas |
| 115–125 | Pausa | |
| 125–165 | Práctica por niveles | Base: repetir el laboratorio. Estándar: sumar uniones. Reto: medir el plan de ejecución |
| 165–180 | Cierre | Resumen, recordatorio de detener el Codespace y anuncio del T3 |

**Material complementario**
- [EN] PySpark, primeros pasos (documentación oficial): [spark.apache.org](https://spark.apache.org/docs/latest/api/python/getting_started/index.html)
- [EN] Guía de Spark SQL y DataFrames: [spark.apache.org](https://spark.apache.org/docs/latest/sql-programming-guide.html)
- [ES] Documentación de GitHub Codespaces: [docs.github.com](https://docs.github.com/es/codespaces)
- [ES] Fundamentos de PySpark, en DataCamp (su página lo marca como gratuito; verificar al preparar la clase): [datacamp.com](https://www.datacamp.com/es/courses/foundations-of-pyspark)
- Pendiente: un video en español sobre Hadoop frente a Spark.

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
| 170–180 | Cierre | Plazo del PR y carga del enlace en la app, aprobación cruzada (sin fusionar) y encuesta de pulso |

**Material complementario**
- [EN] Guía de Spark SQL (ver S7).
- [EN] Particiones y rendimiento: pendiente de elegir una fuente gratuita y verificada.
- Pendiente: un video en español sobre Spark SQL.

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
