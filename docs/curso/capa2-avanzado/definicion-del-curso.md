# Análisis de datos nivel Avanzado (EstudIA, Capa 2): definición del curso

Borrador del 2026-11-11. Es la versión oficial del curso, según la carpeta «KickOff Profesores EstudIA» de Drive. Se carga en la app como una **edición aparte**; el plan de 8 semanas ([plan-de-estudios.md](../plan-de-estudios.md)) queda como está.

## 1. Datos oficiales

| Dato | Valor |
|---|---|
| Nombre | Análisis de datos nivel Avanzado: Arquitectura, aprendizaje automático y experimentación |
| Duración | 5 semanas, 2 encuentros por semana: **10 encuentros de 180 min** |
| Horas | 30 h sincrónicas + 12 h asincrónicas (Platzi) = 42 h |
| Modalidad | El descriptor dice híbrida (la programación institucional define cuáles son presenciales); la guía de proyectos dice virtual |
| Entrada | Autonomía técnica alta: aprobó el nivel intermedio o tiene experiencia verificable; domina modelado de datos, flujos de transformación y estadística aplicada |
| Eje | **El proyecto.** Cada estudiante o equipo desarrolla el suyo; los hitos orientan y no son entregas obligatorias por encuentro |
| Producto | Solución analítica con arquitectura documentada, tratamiento reproducible de datos, una técnica avanzada principal, evaluación crítica y una recomendación organizacional |

Fuentes: descriptor del nivel, ruta de hitos, guía del profesor y matriz de contenidos asincrónicos (`C2_Datos_Platzi.xlsx`, pestaña «Data Avanzado»).

## 2. Módulos y componente asincrónico (Platzi)

Los cinco módulos de Platzi se hacen **uno por semana**, en paralelo a las sesiones. Son 12 h en total.

| Módulo | Semana | Contenido asincrónico |
|---|---|---|
| M1. Arquitectura de datos moderna en la nube | 1 | Lakehouse frente a almacén y lago; BigQuery, Cloud Storage, Dataflow y Pub/Sub; PySpark; particionamiento y clustering; batch frente a tiempo real; estimación de costos en GCP |
| M2. ML avanzado y MLOps | 2 | Ingeniería de características; Random Forest y XGBoost; matriz de confusión, ROC-AUC, validación cruzada y SHAP; ciclo de vida del modelo; MLflow o Weights & Biases; FastAPI y Docker; drift y reproducibilidad |
| M3. Series de tiempo | 3 | Tendencia, estacionalidad y ruido; Prophet con festivos colombianos; Isolation Forest y métodos estadísticos; pronósticos con intervalos |
| M4. Segmentación y experimentación | 4 | K-means, DBSCAN y silhouette; experimentos A/B (tamaño de muestra y aleatorización); cohortes (retención, LTV y churn); diferencias en diferencias y variables instrumentales básicas |
| M5. Liderazgo analítico y solución de impacto | 5 | Del problema de negocio a la pregunta analítica; priorización y memos ejecutivos; ética, sesgo y auditoría; solución de extremo a extremo en GCP con dashboard en Looker Studio |

**Cómo se articula con las sesiones (guía del profesor):**
- Las sesiones no repiten lo de Platzi: parten de lo que el estudiante ya vio o va a ver, y se dedican a aplicarlo en su proyecto.
- Antes de cada sesión se indica qué parte del módulo revisar y con qué propósito; durante, el contenido es punto de partida de un caso o demostración; después, se asigna una transferencia al proyecto.
- Un módulo puede necesitar anticiparse o retomarse fuera de su semana. Anticipar una técnica en vivo no suma horas asincrónicas ni supone que el estudiante ya la vio.
- Las clínicas y los ejemplos de la guía son desarrollo pedagógico del programa, no contenido literal de Platzi.

**Lo que los documentos no dicen** (hay que preguntarlo a la universidad):
- Cómo accede cada estudiante a Platzi (cuentas o licencias) y si el docente ve su avance.
- Si completar Platzi cuenta para aprobar o certificar.
- Qué se hace con quien no avanza en la parte asincrónica.

## 3. Los 10 encuentros

Tomado de la ruta de hitos. La columna Platzi indica los módulos que respaldan cada encuentro.

| Enc. | Semana | Foco | Hito observable | Platzi |
|---|---|---|---|---|
| 1 | 1 | Inducción, pacto pedagógico y oportunidades de impacto | Mapa de oportunidades con una o dos hipótesis priorizadas | M5 |
| 2 | 1 | Brief, criterios de éxito y contrato de datos | Brief aprobado, mapa de fuentes, diccionario preliminar y plan de evaluación | M1, M5 |
| 3 | 2 | Arquitectura y pipeline reproducible | Diagrama de arquitectura, primer pipeline ejecutable y controles de calidad | M1 |
| 4 | 2 | Modelado y primera línea base verificable | Flujo de extremo a extremo y comparación con la línea base | M2, M3, M4 |
| 5 | 3 | Profundización (clasificación, series o segmentación, una técnica a fondo) | Primer experimento avanzado comparado con la línea base | M2, M3, M4 |
| 6 | 3 | Evaluación robusta, explicabilidad y sesgos | Informe de evaluación, limitaciones e incertidumbre | M2 a M5 |
| 7 | 4 | Versionado, MLOps y operación demostrable | Pipeline repetible, versiones y criterios de monitoreo | M1, M2 |
| 8 | 4 | Decisión de negocio y trade-offs de arquitectura | Recomendación ejecutiva (memo de una página) | M1, M4, M5 |
| 9 | 5 | Auditoría, documentación y ensayo de portafolio | Versión candidata, README y demo ensayada | M1 a M5 |
| 10 | 5 | Demostración, defensa y proyección profesional | Proyecto demostrable y sustentado, con backlog de mejoras | M5 |

El encuentro 1 incluye un pacto pedagógico de 20 minutos (participación, autoría, datos, IA y colaboración).

## 4. Cómo se carga en la app (propuesta)

La edición lleva dimensiones, trabajos, criterios y sesiones propios (cada uno cuelga de la edición). Todo lo que sigue está por decidir.

**Dimensiones** (salen del perfil de salida del curso):

| Dimensión | Qué evalúa | Módulo |
|---|---|---|
| Arquitectura y pipelines | Diseñar y justificar la arquitectura, con costos, y un pipeline reproducible | M1 |
| Modelado y evaluación | Técnica avanzada con línea base, sin fuga de información, con evaluación robusta | M2 |
| Series de tiempo y anomalías | Descomposición, pronóstico con incertidumbre y detección de anomalías | M3 |
| Experimentación y segmentación | Diseño de experimentos, cohortes y agrupamiento con criterio estadístico | M4 |
| Liderazgo analítico | Traducir un problema en una decisión, comunicarla, ética y sesgo | M5 |
| Dirección de IA | Uso de IA declarado y verificado (transversal) | Todos |

Como cada estudiante elige una técnica principal, no todos alimentan todas las dimensiones; el radar de cada persona se calcula con la evidencia que tenga.

**Trabajos con nota.** El curso dice que los hitos no son entregas por encuentro, así que propongo pocas evidencias con rúbrica y dejar el resto como seguimiento:

| Evidencia | Encuentro | Qué se califica |
|---|---|---|
| E1. Brief, datos y arquitectura | 3 | Pregunta y decisión, contrato de datos, arquitectura y primer pipeline |
| E2. Experimento evaluado | 6 | Línea base, técnica avanzada, evaluación, incertidumbre y limitaciones |
| E3. Solución reproducible con memo ejecutivo | 9 | Reproducibilidad, documentación y recomendación |
| E4. Demostración y defensa | 10 | Sustentación de valor, decisiones técnicas y límites |

Los demás hitos se registran como puntos de control sin nota.

**Reuso de lo que ya existe en la app.** La entrega por PR (cada proyecto vive en un repo), el diagnóstico con y sin IA, las encuestas y votaciones, las preguntas relámpago, el calendario de sesiones y el material por sesión. Lo que cambia es el contenido: islas y gemas (cinco módulos en lugar de ocho), lecciones y frases del jaguar.

**Diagnóstico.** La guía recomienda comenzar con una muestra de trabajo o una pregunta pequeña y evitar exponer dificultades en público. El diagnóstico de la app encaja si es individual y privado: una tarea breve sobre una muestra (describir un dato, una transformación y una comprobación), con la parte sin IA de la misma tarea.

## 5. Lo que falta decidir

1. Acceso y seguimiento de Platzi (sección 2).
2. Qué encuentros son presenciales, según la programación institucional.
3. Acceso a GCP para los estudiantes. La guía acepta ejecución local o en nube autorizada, nunca claves públicas.
4. Tamaño de los grupos y cuántos proyectos en equipo habrá.
5. Si las dimensiones propuestas sirven, y si los cuatro trabajos con nota son los correctos.
6. Qué pasa con el curso de 8 semanas: queda congelado, sin cambios.
