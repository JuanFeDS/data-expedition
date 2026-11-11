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

**Estructura de cada encuentro (guía del profesor):** apertura y revisión del avance (15 min), microtaller o modelado (25), práctica guiada (30), pausa (10), construcción y mentoría (65), contraste y retroalimentación (25) y cierre (10). Es la misma en los diez.

**Ajustes propuestos para las semanas 1 y 2.** La guía permite adaptar el acompañamiento a las necesidades del grupo, conservando aprendizajes, comprobación y alcance viable, y documentando las equivalencias.

| Enc. | Ajuste | Por qué |
|---|---|---|
| 1 | Después del pacto, usar el diagnóstico como muestra de trabajo real (individual y privada) y dedicar el resto a explorar la fuente de datos de cada proyecto, en lugar de una lluvia de ideas general | La guía pide partir de una muestra de trabajo o una pregunta pequeña. Así el primer encuentro ya toca datos |
| 2 | Se conserva tal cual: fuga de información, partición temporal y plan de evaluación antes de entrenar | Es el núcleo conceptual de las dos semanas y donde suelen fallar los proyectos |
| 3 | Orientarlo a lo nuevo para quien viene del Intermedio: arquitectura en la nube, lakehouse, costos y Spark. El pipeline básico, con comprobaciones de calidad, se resuelve con clínicas por necesidad | El Intermedio ya cubre APIs, GitHub Actions, dbt y Great Expectations en Platzi. Quien entra por experiencia puede necesitar ese tramo |

El diagnóstico (con IA y sin IA) decide quién pasa a cada clínica, siguiendo el enfoque de curso dinámico del plan de 8 semanas.

## 4. Cómo se carga en la app (propuesta)

La edición lleva dimensiones, trabajos, criterios y sesiones propios (cada uno cuelga de la edición). Todo lo que sigue está por decidir.

**Dimensiones.** Se toman los seis criterios del apartado «Producto de portafolio y criterios de revisión» de la guía del profesor, más Dirección de IA como transversal:

| Dimensión | Qué puede demostrar el estudiante | Encuentros donde se ve |
|---|---|---|
| Pertinencia | Actor, decisión, costo de error y criterios de aceptación verificables | 1, 2, 8 |
| Arquitectura y datos | Procedencia, controles, flujo repetible y recursos proporcionados al problema | 2, 3 |
| Método | Técnica principal pertinente, referencia comparable y prevención de fuga de información | 4, 5 |
| Evaluación | Procedimiento adecuado, análisis de fallas, estabilidad y límites | 4, 6 |
| Operación | Versiones, entorno, forma de uso y criterio de monitoreo | 7 |
| Defensa | Resultados reproducibles, recomendación ejecutiva y condiciones de adopción | 8, 9, 10 |
| Dirección de IA | Uso de IA declarado y verificado | Todos |

Como cada estudiante elige una técnica principal (clasificación, series, segmentación o anomalías), las dimensiones son las mismas para todos y lo que cambia es la técnica con que las demuestran. El radar de cada persona se calcula con la evidencia que tenga.

**Evidencias con rúbrica, sin nota por defecto.** La guía dice que no se convierta en «una base nominal de calificaciones», que no se creen entregas que no se hayan acordado con el grupo y que la pauta de portafolio «no fija ponderaciones, reglas de certificación ni entregas institucionales adicionales». Por eso propongo pocas evidencias, que coinciden con hitos de la ruta oficial, revisadas con la rúbrica de 5 niveles y alimentando el radar:

| Evidencia | Encuentro | Dimensiones que alimenta |
|---|---|---|
| E1. Brief, datos y arquitectura | 3 | Pertinencia, Arquitectura y datos |
| E2. Experimento evaluado | 6 | Método, Evaluación |
| E3. Solución reproducible con memo ejecutivo | 9 | Operación, Defensa |
| E4. Demostración y defensa | 10 | Defensa, Pertinencia |

Los demás hitos se registran como puntos de control sin rúbrica. La nota de 1.0 a 5.0 del RFC (F5) solo se activaría si la universidad confirma que el curso se califica (sección 5).

**Reuso de lo que ya existe en la app.** La entrega por PR (cada proyecto vive en un repo), el diagnóstico con y sin IA, las encuestas y votaciones, las preguntas relámpago, el calendario de sesiones y el material por sesión. Lo que cambia es el contenido: islas y gemas (cinco módulos en lugar de ocho), lecciones y frases del jaguar.

**Diagnóstico.** La guía recomienda comenzar con una muestra de trabajo o una pregunta pequeña y evitar exponer dificultades en público. El diagnóstico de la app encaja si es individual y privado: una tarea breve sobre una muestra (describir un dato, una transformación y una comprobación), con la parte sin IA de la misma tarea.

## 5. Lo que falta decidir

1. Acceso y seguimiento de Platzi (sección 2).
2. Qué encuentros son presenciales, según la programación institucional.
3. Acceso a GCP para los estudiantes. La guía acepta ejecución local o en nube autorizada, nunca claves públicas.
4. Tamaño de los grupos y cuántos proyectos en equipo habrá.
5. **Si el curso se califica.** La guía sugiere que no hay base nominal de calificaciones ni ponderaciones definidas. Hay que preguntarle a la universidad antes de usar la nota de 1.0 a 5.0.
6. Si las siete dimensiones y las cuatro evidencias propuestas son las correctas.
7. Qué pasa con el curso de 8 semanas: queda congelado, sin cambios.
8. Cuánto del encuentro 3 se dedica a quien necesita el pipeline básico, según el perfil real de entrada (Intermedio aprobado frente a experiencia laboral).
