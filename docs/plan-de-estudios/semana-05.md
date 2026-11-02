# Semana 5 — Visualización interactiva y storytelling

Módulo del pensum: 5. Análisis avanzado y visualización interactiva (Power BI o Tableau, DAX o campos calculados, storytelling con datos).
Trabajo: **T4** Dashboard con narrativa (entrega al final de la S10).
Dimensiones: Comunicación, Análisis, Datos, Producción y Dirección de IA.
Elasticidad: **núcleo fijo**.

**La herramienta se vota en la S9.** Opciones: Power BI, Looker Studio y Streamlit. Solo entran las que corren en los equipos de todo el grupo (Power BI exige Windows). Ver el cuadro de ventajas y desventajas en [plan-de-estudios.md](../plan-de-estudios.md), sección 12.5.

---

## S9 — Dashboards y votación de la herramienta (virtual, sesión A)

**Objetivo:** entender qué hace un buen dashboard, elegir la herramienta entre todos y construir una primera versión con filtros y medidas calculadas.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–15 | Retro y votación | Planning de la semana. «¿Qué gráfico engaña más?» con tres ejemplos |
| 15–55 | Teoría y demostraciones | Modelo de datos para BI, filtros y segmentadores, medidas (DAX) o campos calculados, jerarquías. La misma pregunta de negocio resuelta en Power BI, Looker Studio y Streamlit. Una pregunta relámpago con bonificación |
| 55–65 | Votación | Los estudiantes votan la herramienta y se anuncia la ganadora |
| 65–75 | Pausa | |
| 75–125 | Laboratorio guiado | Se parte de un dataset limpio y se llega a un dashboard de tres vistas con filtros, en la herramienta ganadora |
| 125–135 | Pausa | |
| 135–165 | Práctica por niveles | Base: rehacer el laboratorio. Estándar: añadir una medida calculada. Reto: una medida con contexto de tiempo |
| 165–180 | Cierre | Resumen y anuncio del T4. Se anuncian los equipos del integrador |

**Equipos del integrador:** el docente los forma con el radar de entrada, equilibrando fortalezas, y los anuncia al cierre de esta sesión.

**Material complementario**
- [ES] Aprendizaje para Power BI, en Microsoft Learn: [introducción al análisis de datos](https://learn.microsoft.com/es-es/training/paths/data-analytics-microsoft/), [modelado de datos](https://learn.microsoft.com/es-es/training/paths/model-data-power-bi/) y [objetos visuales e informes](https://learn.microsoft.com/es-es/training/paths/build-power-bi-visuals-reports/)
- [ES] Centro de asistencia de Looker Studio: [support.google.com](https://support.google.com/looker-studio?hl=es)
- [EN] Streamlit, documentación oficial: [docs.streamlit.io](https://docs.streamlit.io/)
- Pendiente: un video en español sobre DAX básico y otro sobre Streamlit.

## S10 — Storytelling con datos (virtual, sesión B)

**Objetivo:** contar una historia con el dashboard para una audiencia no técnica.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–10 | Preguntas pendientes | |
| 10–70 | Trabajo del PR | En parejas o equipos, en salas. Cada pareja define una audiencia y una decisión que el dashboard debe apoyar |
| 70–80 | Pausa | |
| 80–130 | Avance individual | Jerarquía visual, color con intención, título que dice la conclusión |
| 130–140 | Pausa | |
| 140–170 | Revisión al azar | 3 min por pareja: se presenta como si fuera a un gerente. El grupo vota si entendió el mensaje |
| 170–180 | Cierre | Plazo del PR y carga del enlace en la app, aprobación cruzada (sin fusionar) y encuesta de pulso |

**Material complementario**
- [EN] Fundamentals of Data Visualization, capítulos de comunicación y diseño de figuras (ver S4): [clauswilke.com/dataviz](https://clauswilke.com/dataviz/)
- [ES] Cómo se publica un README profesional, para el repositorio del dashboard: [docs.github.com](https://docs.github.com/es/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- Pendiente: un video en español sobre storytelling con datos.

## Rúbrica de T4 — Dashboard con narrativa

| Criterio | Dimensión | Nivel 5 se ve así |
|---|---|---|
| Mensaje y audiencia | Comunicación | La conclusión se entiende en menos de un minuto y está pensada para su audiencia |
| Elección de visuales | Comunicación | Cada gráfico responde una pregunta y no hay adornos |
| Análisis que lo sustenta | Análisis | Las medidas son correctas y la conclusión está respaldada |
| Modelo de datos | Datos | Datos limpios, relaciones claras y sin duplicados |
| Calidad del código y tablero | Producción | Si hay código, pasa Black y Pylint; el PR cierra un issue del tablero |
| Declaración de IA | Dirección de IA | Bitácora con lo que se pidió, corrigió y verificó |

## Votación en vivo (ejemplos)

1. «¿Qué cambiarías de este dashboard?» (tres opciones).
2. «¿Qué entiendes de este gráfico en 5 segundos?»
3. La votación de la herramienta de dashboards (S9).
