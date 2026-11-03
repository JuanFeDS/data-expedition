# Plan de estudios — Análisis de datos: Ciencia de Datos (nivel Avanzado)

Borrador del 2026-11-01. Parte del pensum de ESTUD-IA (8 módulos, English for Tech excluido) y de las decisiones de [RFC-010](../producto/RFC-010-app-expedicion.md). Los umbrales y fechas marcados como provisionales se calibran con la primera cohorte.

## 1. Supuestos

- 8 semanas, 2 sesiones de 3 h por semana: **16 sesiones virtuales** (S1 a S16; la semana *n* tiene las sesiones 2n−1 y 2n).
- Además hay **3 sesiones presenciales adicionales** (P1 a P3), el 14, 21 y 28 de noviembre. Quedan abiertas: el plan funciona sin ellas (sección 2).
- El calendario real de las 16 sesiones aún no existe, así que las presenciales no se atan a una semana concreta.
- Entrada con prueba técnica de más del 80 %, pero **no se sabe qué mide** (en particular, si incluye Python). Por eso el curso es dinámico: se ajusta con el diagnóstico.
- Computador por estudiante; sistema operativo por confirmar con el censo de la clase 1.
- **Entrega por PR (F21 del RFC):** cada estudiante carga el enlace del PR en la app, que queda habilitada hasta la fecha límite. El docente no recoge nada.
- **Entorno local, sin Colab:** Python 3.12, VS Code (extensiones Python, Jupyter, Black y Pylint) y Git, instalados en la clase 1.
- **Spark sin instalación:** se usa un GitHub Codespace con el entorno ya armado (Java y PySpark), para no depender de instalaciones en cada computador.
- Mismas 7 dimensiones del borrador del RFC: Datos, Análisis, Modelado, Validación, Comunicación, Producción y Dirección de IA.

## 2. Sesiones presenciales (abiertas)

| Sesión | Fecha | Estado |
|---|---|---|
| **P1** | 14 nov | Por definir |
| **P2** | 21 nov | Por definir |
| **P3** | 28 nov | Por definir |

Criterio: solo se usan para lo que vale la pena en persona. Ninguna actividad del plan depende de ellas. Las ideas candidatas están en [presenciales.md](plan-de-estudios/presenciales.md).

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

**Dentro de cualquier sesión:** una o dos **preguntas relámpago** con bonificación (sección 12.4) y, al cierre de la sesión B, una encuesta de pulso de 3 preguntas ([encuestas.md](plan-de-estudios/encuestas.md)).

## 4. Clase 1 (S1, virtual)

| Min | Bloque |
|---|---|
| 0–20 | Bienvenida: cómo funciona el curso (islas, radar, IA con declaración, entrega por PR) y por qué hay un diagnóstico |
| 20–60 | Introducción a la ciencia de datos (teoría): ciclo, roles, qué es big data, dónde entra la IA |
| 60–70 | Pausa |
| 70–110 | Entorno: cuenta de GitHub, Git, Python, VS Code con Jupyter, Black y Pylint, con lista de verificación y salas de apoyo por sistema operativo. Primer script: `import this` (el Zen de Python). Censo rápido de equipos |
| 110–120 | Pausa |
| 120–165 | **Guía de entrega por PR**: repo público, rama, commit, abrir el PR y copiar el enlace. Cada estudiante abre un **PR de prueba** (un README con su nombre y tres líneas), enlazado a un issue de su **tablero personal** en GitHub Projects |
| 165–180 | Cierre: se explica la tarea diagnóstica, el plazo y dónde se carga el enlace en la app |

El PR de prueba valida de punta a punta el flujo de F21 antes de cualquier trabajo con nota. La guía de PR queda como documento aparte para los estudiantes. Quien no termine el entorno o el PR lo resuelve en la sala de apoyo de la S2. Detalle de la dinámica en [semana-01.md](plan-de-estudios/semana-01.md).

## 5. Diagnóstico

Punto de partida del radar (F7). No cuenta para aprobar.

**Tarea (después de S1, máximo 60 min, entregada por PR):**
1. Autoinforme: confianza declarada en Python, SQL, estadística, Git, ML y uso de IA (5 min).
2. Preguntas cortas con corrección automática (15 min).
3. Mini tarea práctica en un notebook local (VS Code) con un dataset sucio: cargar, limpiar, responder dos preguntas, un gráfico y su interpretación (40 min). **IA permitida y declarada** en una bitácora de tres líneas.

**Verificación sin IA (primeros 20 min de S2):** tres o cuatro ejercicios paralelos a los de la tarea (leer código, un `groupby`, interpretar un gráfico), con cámara y pantalla compartida.

**Resultado:** dos valores por dimensión, con IA y sin IA. La brecha entre ambos mide dependencia de la IA y alimenta Dirección de IA. La parte práctica se califica con la rúbrica de 5 niveles; un revisor automático comprueba cifras concretas (filas tras limpiar, medias) y solo la interpretación se califica a mano.

**Forma paralela (B):** se aplica al final con el mismo formato (tarea después de S14 y verificación sin IA al inicio de S15). Cada ejercicio existe en versión A y B de la misma dificultad.

**Asignación de ruta:** el docente procesa los resultados entre S2 y S3 y asigna la ruta (sección 9). Hasta entonces, S2 usa ejercicios en tres niveles y cada estudiante elige el suyo.

## 6. Plan semana por semana

La dinámica detallada de cada sesión, con su material complementario, está en `plan-de-estudios/`, un archivo por semana: [1](plan-de-estudios/semana-01.md), [2](plan-de-estudios/semana-02.md), [3](plan-de-estudios/semana-03.md), [4](plan-de-estudios/semana-04.md), [5](plan-de-estudios/semana-05.md), [6](plan-de-estudios/semana-06.md), [7](plan-de-estudios/semana-07.md), [8](plan-de-estudios/semana-08.md). También hay un archivo de [presenciales](plan-de-estudios/presenciales.md) y otro de [encuestas](plan-de-estudios/encuestas.md).

| Sem. | Ses. | Foco | Trabajo (PR) |
|---|---|---|---|
| 1 | S1 | Introducción a la ciencia de datos, entorno, guía de PR | PR de prueba; tarea diagnóstica |
| 1 | S2 | Verificación sin IA; pandas fundamentos en tres niveles | Diagnóstico entregado |
| 2 | S3 | pandas avanzado: joins, ventanas, limpieza; NumPy | |
| 2 | S4 | Teoría de visualización y **votación**: Matplotlib y Seaborn o Plotly; EDA | **T1** EDA reproducible |
| 3 | S5 | Regresión con scikit-learn, partición train/test y métricas | |
| 3 | S6 | Clasificación, pipelines y baseline | **T2** Modelo frente a baseline |
| 4 | S7 | Big Data: Hadoop, escalabilidad y Spark (concepto); PySpark DataFrames | |
| 4 | S8 | PySpark SQL, particiones y dataset masivo; comparación con pandas | **T3** Mismo análisis en Spark |
| 5 | S9 | Teoría de dashboards y **votación**: Power BI, Looker Studio o Streamlit; laboratorio con la ganadora | |
| 5 | S10 | Storytelling con datos y diseño del dashboard | **T4** Dashboard con narrativa |
| 6 | S11 | Árboles y ensambles, ingeniería de características; planning del sprint 1 del integrador | |
| 6 | S12 | Pipelines reproducibles y flujo de trabajo en equipo con Git | **T5** Pipeline y backlog |
| 7 | S13 | Validación cruzada y ajuste de hiperparámetros | |
| 7 | S14 | Interpretación con SHAP y LIME | **T6** Modelo optimizado e interpretado; tarea forma B |
| 8 | S15 | Verificación sin IA (forma B); sprint final y ensayo | |
| 8 | S16 | Presentación del integrador y retroalimentación | **T7** Integrador |

Hilo transversal **Habilidades para el empleo**: el repo como portafolio (S1), retroalimentación entre pares (revisión de PR y revisiones al azar), roles de equipo (S11), retrospectivas por sprint (S12 en adelante) y presentación profesional (S15–S16).

## 7. Cobertura del pensum

| Módulo del pensum | Sesiones | Subtemas del pensum cubiertos |
|---|---|---|
| 1. Fundamentos de ciencia de datos y Big Data | S1, S7 | Conceptos de ciencia de datos (S1); introducción a Big Data, Hadoop y escalabilidad (S7) |
| 2. Programación en Python para ciencia de datos | S2–S4 | pandas, NumPy, Matplotlib y Seaborn (o Plotly, según la votación; ver 12.5) |
| 3. Modelado predictivo con ML | S5–S6, S11 | Regresión, clasificación, árboles y ensambles, scikit-learn, evaluación de modelos |
| 4. Procesamiento avanzado con frameworks | S7–S8 | Spark, procesamiento distribuido, datasets masivos |
| 5. Análisis avanzado y visualización interactiva | S9–S10 | Power BI, Looker Studio o Streamlit (según la votación), campos calculados o DAX, storytelling |
| 6. Gestión de proyectos de ciencia de datos | S1–S16 (hilo), S12 | Scrum transversal con GitHub Projects (12.1), pipelines de datos (S12), colaboración en equipos con Git (S12) |
| 7. Optimización y validación de modelos | S13–S14 | Hyperparameter tuning, validación cruzada, SHAP y LIME |
| 8. Proyecto integrador | S11–S16 | Diseño, desarrollo, implementación y presentación; retroalimentación |
| Habilidades para el empleo | Hilo | Trabajo en equipo y liderazgo |

## 8. Matriz trabajo × dimensión

Cada dimensión se evalúa al menos dos veces (pregunta 10 del RFC). Dirección de IA aparece en todos los trabajos como evidencia declarada, y Producción también, a través del criterio transversal de calidad de código y tablero (12.1 y 12.2).

| Trabajo | Datos | Análisis | Modelado | Validación | Comunicación | Producción | Dirección de IA |
|---|---|---|---|---|---|---|---|
| T1 EDA | ● | ● | | | ● | ● | ● |
| T2 Modelo vs baseline | | ● | ● | ● | | ● | ● |
| T3 Spark | ● | ● | | | | ● | ● |
| T4 Dashboard | ● | ● | | | ● | ● | ● |
| T5 Pipeline | ● | | | | | ● | ● |
| T6 Modelo interpretado | | | ● | ● | ● | ● | ● |
| T7 Integrador | ● | ● | ● | ● | ● | ● | ● |
| **Veces evaluada** | 5 | 5 | 3 | 3 | 4 | 7 | 7 |

Producción y Dirección de IA no tienen isla propia en la app (decisión pendiente de la sesión anterior); aquí viven en el hilo de calidad de código, el tablero y la bitácora de cada PR.

## 9. Curso dinámico: núcleo y semanas elásticas

- **Núcleo fijo:** semanas 3 (modelado), 5 (visualización), 7 (validación) y 8 (integrador).
- **Elásticas:** semana 2 (pandas), semana 4 (Spark) y semana 6 (ensambles y pipelines).
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

1. **Votaciones de herramientas** (S4 y S9): hay que confirmar con el censo de la S1 qué opciones corren en los equipos (Power BI exige Windows).
2. **Calendario real** de las 16 sesiones, para asociar las presenciales P1 a P3 (14, 21 y 28 de noviembre) a su semana y decidir qué se hace en ellas.
3. **Tamaño del grupo** (pregunta 17 del RFC): define el costo de calificar a mano y el tamaño de las salas.
4. **Qué mide la prueba técnica de entrada**, para ajustar los umbrales de la sección 9.
5. **Si las formas A y B del diagnóstico son realmente paralelas**: requiere probarlas con un grupo piloto o calibrarlas con la primera cohorte.
6. **Spark en Codespaces:** cada cuenta personal gratuita incluye 120 horas-núcleo al mes (60 h en una máquina de 2 núcleos), que alcanza de sobra para una semana de laboratorio. Hay que confirmar que cada estudiante use una cuenta personal y no una de organización, que no tiene cuota gratuita. Respaldo: instalación local con JDK 17.
7. **Quién fusiona los PR:** las opciones están en 12.3 y hay que elegir una.
8. **Encuestas y preguntas relámpago en la app:** requieren F22 y F23 en el RFC (ver [encuestas.md](plan-de-estudios/encuestas.md)). Mientras no existan, se usa un formulario externo.

## 11. Versiones futuras

Los niveles Junior (hojas de cálculo) e Intermedio (Business Intelligence) del pensum de la universidad pueden reutilizar este esqueleto de 8 semanas, la estructura de islas, la rúbrica de 5 niveles y el radar, con dimensiones propias por nivel (el RFC las trata como datos, F3). Solo cambian los módulos y los niveles esperados.

## 12. Hilos transversales

### 12.1 Scrum a lo largo del curso, con GitHub Projects

Scrum no tiene una sesión propia. Se practica en todas, con **GitHub Projects**, que ya vive junto a los repos y los PR: tiene vistas de tabla, tablero y hoja de ruta, campos de iteración para los sprints y enlace entre issues y PR.

**Fase individual (S1 a S10).** Cada estudiante tiene un tablero personal. Cada trabajo (T1 a T4) es un issue con su lista de tareas, y el PR lo cierra. El sprint dura una semana.

**Fase de equipo (S11 a S16).** Cada equipo tiene un tablero compartido del integrador, con sprints semanales (planning en S11, revisión y retro en S12, S14 y S16).

**Ceremonias mínimas, dentro de las sesiones existentes:**
- Planning (5 a 10 min) al inicio de la sesión A.
- Seguimiento en el issue con un comentario de dos líneas (sin nota).
- Revisión: la revisión al azar de la sesión B.
- Retro (5 min) al cierre de la sesión B: una pregunta por la encuesta de pulso.

**Criterio de rúbrica (Producción):** issues pequeños y enlazados al PR, avance visible en el tablero.

**En la app:** GitHub Projects tiene API (GraphQL), así que la app podría leer el estado de los tableros. Se recomienda no construirlo ahora: se parte del tablero de GitHub y se decide con la primera cohorte si vale la pena integrarlo.

### 12.2 Buenas prácticas de código

| Práctica | Cuándo entra | Herramienta |
|---|---|---|
| Zen de Python y formato automático | S1 | `import this`, Black al guardar |
| Convenciones de nombres y PEP 8 | S3 | Pylint (nombres descriptivos, sin variables de una letra) |
| Revisión automática en el PR | S4 en adelante | GitHub Actions con `black --check` y Pylint |
| Docstrings y funciones cortas | S6 | Pylint, revisión entre pares |
| Estructura de proyecto y pruebas básicas | S12 | módulos con responsabilidad clara, `pytest` en las funciones de limpieza |
| Ganchos antes del commit | S12 | `pre-commit` |

El puntaje mínimo de Pylint sube de manera gradual (por ejemplo 6, 7 y 8) en vez de exigirse desde el inicio. Black y Pylint se aplican a archivos `.py`; si un trabajo es un notebook, las funciones se piden en un módulo aparte. El resultado de las comprobaciones queda visible en el PR y puede alimentar el criterio de Producción.

### 12.3 Revisión de los PR en pareja

- La pareja **revisa y aprueba** el PR del otro, con al menos dos comentarios en línea (uno de lo que funciona y otro de mejora). **No lo fusiona.**
- El docente hace la revisión general, deja sus comentarios y **fusiona**.
- Cada estudiante agrega al docente como colaborador de su repo, con permiso de escritura, para que pueda fusionar.
- Un repo propio le da al estudiante permisos para fusionar, así que la regla se sostiene por acuerdo, no por bloqueo técnico. La API de GitHub permite que la app compruebe quién aprobó y quién fusionó cada PR, y marque los que no cumplan.
- **Alternativa con bloqueo real:** que los PR vayan a un repo del curso (cada estudiante desde su fork). Es más estricto, pero deja de ser el "repo público propio" de F21 y mezcla los trabajos en un solo repo. Es una decisión abierta (10.7).
- Las aprobaciones de quien no tiene escritura en el repo no cuentan para una protección de rama, así que sirven como evidencia visible, no como control.

### 12.4 Preguntas relámpago con bonificación

- Una o dos por sesión, ligadas a lo que se está explicando en ese momento.
- Un enlace corto y un **código QR** en la pantalla compartida abren la pregunta. Hay una ventana de 60 a 90 segundos, un solo intento y corrección inmediata con una explicación breve.
- La bonificación de XP es para quien responde dentro de la ventana, es decir, quien está en clase.
- Para que no se copien, las preguntas son de aplicación (por ejemplo, leer una línea de código) y pueden llevar parámetros distintos por estudiante.
- En la app es una pieza nueva (F23, ver [encuestas.md](plan-de-estudios/encuestas.md)). Mientras tanto, se hace con un formulario con cierre manual.

### 12.5 Votación de herramientas

**Visualización (S4).** La teoría general de visualización va primero, con el mismo gráfico mostrado en **Matplotlib y Seaborn** y en **Plotly**. Al final votan los estudiantes, y la ganadora es la librería del T1 y de las sesiones siguientes. El pensum nombra Matplotlib y Seaborn, así que si gana Plotly se mantiene un ejemplo corto de Matplotlib como referencia.

**Dashboards (S9).** Misma lógica con **Power BI**, **Looker Studio** y **Streamlit**: la misma pregunta de negocio resuelta de las tres formas en la teoría, y votación.

| Opción | A favor | En contra |
|---|---|---|
| Power BI | Es la del pensum, con DAX | Solo Windows, el archivo es binario (no encaja bien en un PR) |
| Looker Studio | Web, gratis, conecta con Google Sheets y BigQuery | No tiene repositorio; el PR sería una captura o un enlace |
| Streamlit | Es código Python, reproducible, encaja con el PR | No cubre DAX; hay que alojarlo para compartirlo |

Solo entran a la votación las opciones que corren en los equipos de todo el grupo. La votación se hace con la votación en vivo de la app (F18) o con un formulario.

### 12.6 Material complementario

Cada sesión lista su material: libros, capítulos, papers o videos, **gratuitos y en español siempre que sea posible**. Los recursos en inglés se marcan con **[EN]**.

**Nota para la app:** para los recursos en inglés, la app podría ofrecer un resumen en español y un glosario, como parte de lo que ya se estaba construyendo para eso.

**Estado de verificación:** los enlaces a Pro Git, la Guía de Scrum, cienciadedatos.net, Microsoft Learn, Molnar, Wilke y los datos de Codespaces se comprobaron el 2026-11-01. Los enlaces a la documentación oficial de las librerías son las direcciones habituales y hay que revisarlos al preparar cada clase. Donde dice «Pendiente» falta encontrar y verificar un recurso, sobre todo videos en español.
