# Plan de estudios — Análisis de datos: Ciencia de Datos (nivel Avanzado)

Borrador del 2026-11-01. Parte del pensum de ESTUD-IA (8 módulos, English for Tech excluido) y de las decisiones de [RFC-010](RFC-010-app-expedicion.md). Los umbrales y fechas marcados como provisionales se calibran con la primera cohorte.

## 1. Supuestos

- 8 semanas, 2 sesiones de 3 h por semana: **16 sesiones** (S1 a S16; la semana *n* tiene las sesiones 2n−1 y 2n).
- Modalidad 60 % virtual, 40 % presencial: **3 sesiones presenciales** y 13 virtuales.
- Entrada con prueba técnica de más del 80 %, pero **no se sabe qué mide** (en particular, si incluye Python). Por eso el curso es dinámico: se ajusta con el diagnóstico.
- Computador por estudiante; sistema operativo por confirmar (decide la herramienta de la semana 5).
- Todo se entrega por **PR a un repo público propio** (F21 del RFC). Python se trabaja en Colab (sin instalación); Git y VS Code se instalan en la clase 1.
- Mismas 7 dimensiones del borrador del RFC: Datos, Análisis, Modelado, Validación, Comunicación, Producción y Dirección de IA.

## 2. Sesiones presenciales (propuesta, por confirmar)

| Sesión | Por qué presencial |
|---|---|
| **S2** (semana 1) | La verificación sin IA se hace con supervisión real; además sirve de clínica para quien no terminó el entorno o el PR de prueba en la clase 1 virtual |
| **S11** (semana 6) | Formar equipos, repartir roles y arrancar el integrador con Scrum cara a cara |
| **S16** (semana 8) | Presentación del integrador |

## 3. Cómo corre una sesión virtual de 3 h

Bloques de 40 a 50 min con pausas de 10 min; nada de 3 h seguidas de pantalla compartida.

**Sesión A (concepto y laboratorio guiado)**
1. 15 min: retro del trabajo anterior y **votación en vivo** (F18), desde la app o un formulario.
2. 40 min: concepto.
3. 50 min: laboratorio guiado en vivo.
4. 40 min: práctica en tres niveles (Base, Estándar, Reto), en salas pequeñas con apoyo.

**Sesión B (aplicado y revisión)**
1. 10 min: preguntas pendientes.
2. 60 min: trabajo del PR en parejas o equipos, en salas.
3. 50 min: avance individual con apoyo.
4. 30 min: **revisión al azar** (F10): se sortean 2 o 3 equipos que comparten pantalla 3 min cada uno y reciben retroalimentación del grupo.

## 4. Clase 1 (S1, virtual)

| Min | Bloque |
|---|---|
| 0–20 | Bienvenida: cómo funciona el curso (islas, radar, IA con declaración, entrega por PR) y por qué hay un diagnóstico |
| 20–60 | Introducción a la ciencia de datos (teoría): ciclo, roles, qué es big data, dónde entra la IA |
| 60–70 | Pausa |
| 70–110 | Entorno: cuenta de GitHub, Git, VS Code y Colab, con lista de verificación y salas de apoyo por sistema operativo. Censo rápido de equipos (sistema operativo, memoria, navegador) |
| 110–120 | Pausa |
| 120–165 | **Guía de entrega por PR**: repo público, rama, commit, abrir el PR y copiar el enlace. Cada estudiante abre un **PR de prueba** (un README con su nombre y tres líneas) |
| 165–180 | Cierre: se explica la tarea diagnóstica y el plazo |

El PR de prueba valida de punta a punta el flujo de F21 antes de cualquier trabajo con nota. La guía de PR queda como documento aparte para los estudiantes. Al ser virtual, quien no termine el entorno o el PR lo resuelve en la clínica de la S2, que es presencial. Detalle de la dinámica en [semana-01.md](plan-de-estudios/semana-01.md).

## 5. Diagnóstico

Punto de partida del radar (F7). No cuenta para aprobar.

**Tarea (después de S1, máximo 60 min, entregada por PR):**
1. Autoinforme: confianza declarada en Python, SQL, estadística, Git, ML y uso de IA (5 min).
2. Preguntas cortas con corrección automática (15 min).
3. Mini tarea práctica en Colab con un dataset sucio: cargar, limpiar, responder dos preguntas, un gráfico y su interpretación (40 min). **IA permitida y declarada** en una bitácora de tres líneas.

**Verificación en clase (primeros 20 min de S2, sin IA):** tres o cuatro ejercicios paralelos a los de la tarea (leer código, un `groupby`, interpretar un gráfico).

**Resultado:** dos valores por dimensión, con IA y sin IA. La brecha entre ambos mide dependencia de la IA y alimenta Dirección de IA. La parte práctica se califica con la rúbrica de 5 niveles; un revisor automático comprueba cifras concretas (filas tras limpiar, medias) y solo la interpretación se califica a mano.

**Forma paralela (B):** se aplica al final con el mismo formato (tarea después de S14 y verificación sin IA al inicio de S15). Cada ejercicio existe en versión A y B de la misma dificultad.

**Limitación:** entre el fin de S1 y S2 hay pocos días, así que S2 no puede depender de resultados ya procesados. S2 se diseña con ejercicios en tres niveles y cada estudiante elige el suyo ese día. El ajuste fino empieza en S3.

## 6. Plan semana por semana

La dinámica detallada de cada sesión está en `plan-de-estudios/`, un archivo por semana: [1](plan-de-estudios/semana-01.md), [2](plan-de-estudios/semana-02.md), [3](plan-de-estudios/semana-03.md), [4](plan-de-estudios/semana-04.md), [5](plan-de-estudios/semana-05.md), [6](plan-de-estudios/semana-06.md), [7](plan-de-estudios/semana-07.md), [8](plan-de-estudios/semana-08.md).

| Sem. | Ses. | Modalidad | Foco | Trabajo (PR) |
|---|---|---|---|---|
| 1 | S1 | Virtual | Introducción a la ciencia de datos, entorno, guía de PR | PR de prueba; tarea diagnóstica |
| 1 | S2 | Presencial | Verificación sin IA, clínica de entorno y PR; pandas fundamentos en tres niveles | Diagnóstico entregado |
| 2 | S3 | Virtual | pandas avanzado: joins, ventanas, limpieza; NumPy | |
| 2 | S4 | Virtual | EDA con Matplotlib y Seaborn | **T1** EDA reproducible |
| 3 | S5 | Virtual | Regresión con scikit-learn, partición train/test y métricas | |
| 3 | S6 | Virtual | Clasificación, pipelines y baseline | **T2** Modelo frente a baseline |
| 4 | S7 | Virtual | Big Data: Hadoop, escalabilidad y Spark (concepto); PySpark DataFrames | |
| 4 | S8 | Virtual | PySpark SQL, particiones y dataset masivo; comparación con pandas | **T3** Mismo análisis en Spark |
| 5 | S9 | Virtual | Visualización interactiva: filtros, medidas (DAX) o campos calculados | |
| 5 | S10 | Virtual | Storytelling con datos y diseño del dashboard | **T4** Dashboard con narrativa |
| 6 | S11 | Presencial | Scrum, equipos y roles; arranque del integrador (backlog y sprint 1) | |
| 6 | S12 | Virtual | Pipelines de datos reproducibles | **T5** Pipeline y backlog |
| 7 | S13 | Virtual | Validación cruzada y ajuste de hiperparámetros | |
| 7 | S14 | Virtual | Interpretación con SHAP y LIME | **T6** Modelo optimizado e interpretado; tarea forma B |
| 8 | S15 | Virtual | Verificación sin IA (forma B); sprint final y ensayo | |
| 8 | S16 | Presencial | Presentación del integrador y retroalimentación | **T7** Integrador |

Hilo transversal **Habilidades para el empleo**: el repo como portafolio (S1), retroalimentación entre pares (revisiones al azar), roles de equipo (S11), retrospectivas por sprint (S12) y presentación profesional (S15–S16).

## 7. Cobertura del pensum

| Módulo del pensum | Sesiones | Subtemas del pensum cubiertos |
|---|---|---|
| 1. Fundamentos de ciencia de datos y Big Data | S1, S7 | Conceptos de ciencia de datos (S1); introducción a Big Data, Hadoop y escalabilidad (S7) |
| 2. Programación en Python para ciencia de datos | S2–S4 | pandas, NumPy, Matplotlib y Seaborn |
| 3. Modelado predictivo con ML | S5–S6 | Regresión, clasificación, scikit-learn, evaluación de modelos |
| 4. Procesamiento avanzado con frameworks | S7–S8 | Spark, procesamiento distribuido, datasets masivos |
| 5. Análisis avanzado y visualización interactiva | S9–S10 | Power BI o Tableau, DAX o campos calculados, storytelling |
| 6. Gestión de proyectos de ciencia de datos | S11–S12 | Scrum, pipelines de datos, colaboración en equipos |
| 7. Optimización y validación de modelos | S13–S14 | Hyperparameter tuning, validación cruzada, SHAP y LIME |
| 8. Proyecto integrador | S11–S16 | Diseño, desarrollo, implementación y presentación; retroalimentación |
| Habilidades para el empleo | Hilo | Trabajo en equipo y liderazgo |

## 8. Matriz trabajo × dimensión

Cada dimensión se evalúa al menos dos veces (pregunta 10 del RFC). Dirección de IA aparece en todos los trabajos como evidencia declarada, no como un ítem aparte.

| Trabajo | Datos | Análisis | Modelado | Validación | Comunicación | Producción | Dirección de IA |
|---|---|---|---|---|---|---|---|
| T1 EDA | ● | ● | | | ● | | ● |
| T2 Modelo vs baseline | | ● | ● | ● | | | ● |
| T3 Spark | ● | ● | | | | ● | ● |
| T4 Dashboard | ● | ● | | | ● | | ● |
| T5 Pipeline | ● | | | | | ● | ● |
| T6 Modelo interpretado | | | ● | ● | ● | | ● |
| T7 Integrador | ● | ● | ● | ● | ● | ● | ● |
| **Veces evaluada** | 5 | 5 | 3 | 3 | 4 | 3 | 7 |

Producción y Dirección de IA no tienen isla propia en la app (decisión pendiente de la sesión anterior); aquí viven en S7–S8 y S11–S12 y en la bitácora de cada PR.

## 9. Curso dinámico: núcleo y semanas elásticas

- **Núcleo fijo:** semanas 3 (modelado), 5 (visualización), 7 (validación) y 8 (integrador).
- **Elásticas:** semana 2 (pandas), semana 4 (Spark) y semana 6 (pipelines y Scrum).
- **Por estudiante:** cada sesión A trae ejercicios en tres niveles (Base, Estándar, Reto), asignados según el radar de entrada.

**Reglas de ajuste (provisionales; se miden tras la verificación de S2).** Se usa el porcentaje de estudiantes en nivel 3 o más de 5 en la dimensión Datos, en la verificación sin IA:

| Resultado | Ruta | Qué cambia |
|---|---|---|
| Menos del 50 % | Nivelación | S3 se dedica a pandas básico y S4 a un EDA guiado. Spark (S7–S8) se reduce a concepto más un laboratorio corto |
| 50 % a 80 % | Estándar | Se sigue el plan tal cual |
| Más del 80 % | Profundización | S3–S4 se resuelven en una sola semana de pandas avanzado y rendimiento; el tiempo ganado va a Spark y al integrador |

Reglas por dimensión:
- Si menos del 50 % llega a nivel 3 en **Validación** (base de estadística), se añade un bloque de estadística (distribuciones, sesgo y varianza) en S5.
- Si la brecha media entre con IA y sin IA supera 1 nivel en una dimensión, se añade práctica sin IA en esa dimensión durante la primera media hora de cada sesión B.

## 10. Decisiones abiertas

1. **Herramienta de la semana 5.** Power BI Desktop si todo el grupo tiene Windows; si no, Tableau Public (campos calculados, sin DAX). Se decide con el censo de equipos de la S1.
2. **Fechas exactas** de las tres sesiones presenciales y confirmación de las propuestas.
3. **Tamaño del grupo** (pregunta 17 del RFC): define el costo de calificar a mano y el tamaño de las salas.
4. **Qué mide la prueba técnica de entrada**, para ajustar los umbrales de la sección 9.
5. **Si las formas A y B del diagnóstico son realmente paralelas**: requiere probarlas con un grupo piloto o calibrarlas con la primera cohorte.
6. **Entorno de Python:** Colab como principal; decidir si se pide también instalación local.

## 11. Versiones futuras

Los niveles Junior (hojas de cálculo) e Intermedio (Business Intelligence) del pensum de la universidad pueden reutilizar este esqueleto de 8 semanas, la estructura de islas, la rúbrica de 5 niveles y el radar, con dimensiones propias por nivel (el RFC las trata como datos, F3). Solo cambian los módulos y los niveles esperados.
