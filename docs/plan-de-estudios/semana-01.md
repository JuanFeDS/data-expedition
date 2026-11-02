# Semana 1 — Arranque, entorno y diagnóstico

Módulo del pensum: 1. Fundamentos de ciencia de datos y Big Data (conceptos) y arranque del 2. Python.
Trabajo: PR de prueba y tarea diagnóstica (no cuentan para aprobar).
Dimensiones: todas, como punto de partida del radar.
Elasticidad: la ruta del curso se decide a partir de la verificación de la S2 (ver [plan-de-estudios.md](../plan-de-estudios.md), sección 9).

---

## S1 — Clase 1 (virtual, 180 min)

**Objetivo:** que todos salgan con el entorno funcionando, un PR de prueba abierto y claridad sobre cómo se trabaja y se evalúa el curso.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–15 | Bienvenida | Cómo funciona el curso: islas, radar frente al punto de partida, IA permitida con declaración, entrega por PR. Se aclara que el diagnóstico no cuenta para aprobar |
| 15–55 | Introducción a la ciencia de datos (teoría) | Sondeo inicial: «¿dónde cruzas datos en tu día?». Ciclo de ciencia de datos, roles, qué es Big Data, dónde entra la IA. Preguntas en el chat, una pausa de dos minutos a la mitad |
| 55–65 | Pausa | |
| 65–110 | Entorno | Lista de verificación en pantalla: cuenta de GitHub, Git, Python, VS Code con Jupyter. Salas de apoyo por sistema operativo (Windows y Mac). Quien se atasque levanta la mano y pasa a la sala. Censo en formulario: sistema operativo, memoria, navegador |
| 110–120 | Pausa | |
| 120–165 | Guía de entrega por PR | Demostración en vivo y luego en parejas: repo público, rama, commit, PR y enlace. Cada estudiante abre un PR de prueba (un README con su nombre y tres líneas). Quien termina ayuda a su pareja |
| 165–180 | Cierre | Se presenta la tarea diagnóstica, el plazo y la regla de IA (se declara, no se oculta). Se anuncia la presencial P1 del 14 de noviembre |

**Materiales:** diapositivas de la intro, lista de verificación del entorno, guía de PR (documento aparte), enlace al formulario de censo.

**Riesgo principal:** que el entorno falle a distancia. Plan de respaldo: quien no logre instalar algo lo resuelve en la sala de apoyo de la S2 o en la clínica de la P1.

**Tarea diagnóstica (máximo 60 min, entrega por PR antes de la S2):**
1. Autoinforme: confianza en Python, SQL, estadística, Git, ML y uso de IA, más sistema operativo (5 min).
2. Preguntas cortas con corrección automática (15 min).
3. Mini tarea práctica en un notebook local (VS Code) con un dataset sucio: cargar, limpiar, responder dos preguntas, un gráfico y su interpretación (40 min). IA permitida con bitácora de tres líneas.

---

## S2 — Verificación y pandas fundamentos (virtual, 180 min)

**Objetivo:** medir el nivel real sin IA, dejar a todos con el flujo de PR funcionando y empezar pandas en el nivel de cada uno.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–10 | Llegada | Se recogen los PR de la tarea y se anota quién no entregó |
| 10–30 | Verificación sin IA | Tres o cuatro ejercicios paralelos a los de la tarea: leer código, un `groupby`, interpretar un gráfico. Se hace con cámara y pantalla compartida, sin IA. Es orientativa: la verificación oficial y supervisada es la P1 |
| 30–45 | Resultados del grupo | Panel anónimo con lo que salió, votación en vivo: «¿qué te sorprendió de tu resultado?». Se explica que desde la S3 el ritmo se ajusta |
| 45–55 | Pausa | |
| 55–110 | pandas fundamentos | Laboratorio guiado: cargar, inspeccionar, filtrar, seleccionar y agrupar. Se hace en tres niveles (Base, Estándar, Reto) a elegir; quien lo necesite pasa al nivel inferior sin penalización |
| 110–120 | Pausa | |
| 120–165 | Práctica y apoyo | Práctica por niveles. En una sala aparte, apoyo de entorno y PR para quien no terminó en la S1 |
| 165–180 | Cierre | Se explica la ruta que se seguirá y el trabajo de la semana 2 |

**Materiales:** hoja de verificación, dataset de pandas en tres niveles de ejercicios, rúbrica de la tarea práctica del diagnóstico.

**Decisión después de la P1:** con los resultados de la verificación oficial y la tarea se asigna la ruta (nivelación, estándar o profundización) y el nivel de ejercicios por estudiante.

---

## Criterios de la tarea diagnóstica

| Criterio | Dimensión | Nivel 5 se ve así |
|---|---|---|
| Carga y limpieza correctas del dataset | Datos | Detecta nulos, duplicados y tipos erróneos y justifica cada decisión |
| Respuestas a las dos preguntas | Análisis | Respuestas correctas, con la operación apropiada y razonamiento claro |
| Gráfico e interpretación | Comunicación | Gráfico adecuado a la pregunta y una conclusión en palabras para un no técnico |
| Declaración de IA | Dirección de IA | Bitácora que dice qué se pidió, qué se corrigió y qué se rechazó |
