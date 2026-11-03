# Semana 6 — Ensambles, pipelines y arranque del integrador

Módulo del pensum: 3 (profundización: árboles y ensambles), 6. Gestión de proyectos de ciencia de datos (pipelines y colaboración en equipos; Scrum es transversal) y arranque del 8. Proyecto integrador.
Trabajo: **T5** Pipeline y backlog (entrega al final de la S12).
Dimensiones: Producción, Datos y Dirección de IA. Hilo de Habilidades para el empleo.
Elasticidad: **elástica**. Si el curso va atrasado, el pipeline se acorta y el tiempo se reserva para el integrador.

Scrum no tiene sesión propia: se practica en todas con GitHub Projects (ver [plan-de-estudios.md](../plan-de-estudios.md), sección 12.1). Aquí solo hay un planning de 25 min para el primer sprint del integrador.

---

## S11 — Árboles y ensambles; planning del sprint 1 (virtual, sesión A)

**Objetivo:** mejorar los modelos de la semana 3 con árboles y ensambles, y dejar listo el backlog del primer sprint del integrador.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–15 | Retro y votación | «¿Qué crees que mejora más un modelo: más datos o un mejor algoritmo?» |
| 15–60 | Concepto | Árboles de decisión, random forest, gradient boosting, ingeniería de características, importancia de variables. Una pregunta relámpago con bonificación |
| 60–70 | Pausa | |
| 70–120 | Laboratorio guiado | Se parte del modelo del T2 y se llega a un random forest y a un gradient boosting, con comparación |
| 120–130 | Pausa | |
| 130–155 | Práctica por niveles | Base, Estándar, Reto, en salas pequeñas |
| 155–180 | Planning del sprint 1 | Cada equipo (anunciado al cierre de la S9) define el objetivo del sprint y el backlog inicial en su tablero de GitHub Projects. Cada equipo lo presenta en una frase |

**Materiales:** plantilla de tablero del equipo, lista de roles (analista de datos, ingeniero de pipelines, modelador, narrador).

**Material complementario**
- [ES] Random Forest con Python y Scikit-learn: [py08](https://www.cienciadedatos.net/documentos/py08_random_forest_python)
- [ES] Gradient Boosting con Python y Scikit-learn: [py09](https://www.cienciadedatos.net/documentos/py09_gradient_boosting_python)
- [ES] La Guía de Scrum 2020 (versión latinoamericana): [scrumguides.org](https://www.Scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-Spanish-Latin-South-American.pdf)
- [ES] Documentación de GitHub Projects: [docs.github.com](https://docs.github.com/es/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
- [EN] Ensambles en scikit-learn: [scikit-learn.org](https://scikit-learn.org/stable/modules/ensemble.html)

## S12 — Pipelines y flujo de trabajo en equipo (virtual, sesión B)

**Objetivo:** convertir el análisis en un flujo reproducible que otro equipo pueda ejecutar, y trabajar en equipo con Git sin pisarse.

| Min | Dinámica | Detalle |
|---|---|---|
| 0–10 | Preguntas pendientes | |
| 10–50 | Concepto | Pipelines de datos (extraer, transformar, cargar), scripts frente a notebooks, configuración y semillas. Ramas, PR y conflictos en equipo. Estructura de proyecto, `pytest` básico y `pre-commit` |
| 50–60 | Pausa | |
| 60–120 | Trabajo del PR | Los equipos construyen su pipeline en salas, con el sprint 1 como guía |
| 120–130 | Pausa | |
| 130–160 | Revisión al azar | 3 min por equipo: «¿qué entra, qué sale y cómo se reproduce?» |
| 160–180 | Retro del sprint 1 | Qué salió bien, qué no, qué cambia en el sprint 2. Plazo del PR y carga del enlace en la app |

**Material complementario**
- [ES] Pro Git, capítulo 5: flujos de trabajo distribuidos: [git-scm.com/book/es/v2](https://git-scm.com/book/es/v2)
- [EN] pytest, primeros pasos: [docs.pytest.org](https://docs.pytest.org/en/stable/getting-started.html)
- [EN] pre-commit: [pre-commit.com](https://pre-commit.com/)
- [EN] Pipelines en scikit-learn: [scikit-learn.org](https://scikit-learn.org/stable/modules/compose.html)
- Pendiente: un video en español sobre estructura de un proyecto de datos.

## Rúbrica de T5 — Pipeline y backlog

| Criterio | Dimensión | Nivel 5 se ve así |
|---|---|---|
| Pipeline reproducible | Producción | Otro equipo lo ejecuta sin ayuda y obtiene el mismo resultado |
| Calidad de los datos que produce | Datos | Se validan esquema y valores, con mensajes claros cuando algo falla |
| Tablero y avance | Producción | Tareas pequeñas, estimadas, con responsable y PR enlazados |
| Declaración de IA | Dirección de IA | Bitácora del equipo, con la verificación del código generado |

## Habilidades para el empleo

Roles de equipo, comunicación en el equipo, retrospectivas y retroalimentación entre pares.
