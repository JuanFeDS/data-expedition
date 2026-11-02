# Requisitos nuevos para la app, derivados del plan de estudios

Borrador del 2026-11-01. Reúne lo que el diseño del [plan de estudios](plan-de-estudios.md) le pide a la app y que no está, o está a medias, en el [RFC-010](RFC-010-app-expedicion.md). No modifica el RFC: cuando se apruebe, estos requisitos se incorporan como F22 en adelante.

## 1. Resumen

| # | Requisito | Extiende | Prioridad |
|---|---|---|---|
| A1 | Carga del enlace de PR con plazo | F21 | Antes de la S1 |
| A2 | Verificación del PR: autor, estado, SHA, aprobación de la pareja y quién fusionó | F21 | Semana 2 |
| A3 | Resultado de las comprobaciones de calidad de código en el PR | F21 | Semana 2 |
| B1 | Módulo de formularios (encuestas, votaciones y relámpago) | F18 | Antes de la S1 |
| B2 | Preguntas relámpago con QR y bonificación | F18 | Semana 1 |
| B3 | Votación de herramientas con resultado guardado | F18 | Semana 2 |
| C1 | Diagnóstico en dos modos (con IA y sin IA) y formas A y B | F7 | Antes de la S1 |
| C2 | Rutas dinámicas y ejercicios por nivel | F7, F8 | Semana 2 |
| C3 | Formación asistida de equipos | F15 | Semana 5 |
| D1 | Calendario de sesiones y plazos | | Antes de la S1 |
| D2 | Material complementario por sesión | | Semana 1 |
| D3 | Resumen en español de recursos en inglés | | Después |
| E1 | Criterios transversales de rúbrica | F4 | Semana 2 |
| E2 | Panel del docente: diagnóstico, rutas y seguimiento | | Semana 2 |

Numeración propuesta para el RFC: **F22** es el módulo de formularios (B1 y B3) y **F23** son las preguntas relámpago (B2). Los demás requisitos no tienen número hasta que se incorporen.

Las pantallas de cada requisito están listadas en [plan-de-accion-pantallas.md](plan-de-accion-pantallas.md).

"Antes de la S1" significa que, si la app no llega, se cubre con el plan B del RFC (formulario externo y hoja de cálculo, hito H1).

## 2. Entrega por PR (extiende F21)

**Alineación con el RFC:** el plan define 7 trabajos (T1 a T7), mientras que F5 del RFC dice "3 o 4". Al incorporar estos requisitos, F5 pasa a 7 trabajos, con el último como proyecto integrador. El prototipo ya usa los 7.

**A1. Carga del enlace con plazo.**
- El docente habilita cada trabajo con una fecha y hora límite. Los estudiantes cargan el enlace del PR en la app.
- La app guarda la fecha de carga y avisa si fue tarde. El docente no recoge nada.
- El usuario de GitHub de cada estudiante se guarda en su perfil.

**A2. Verificación contra la API de GitHub.** Al cargar el enlace, la app consulta:
- repo público, autor del PR y estado;
- SHA del último commit al entregar;
- **aprobaciones**: si el compañero asignado aprobó (review en estado aprobado);
- **quién fusionó**: se espera que lo haga el docente. Si fusionó el estudiante, el PR queda marcado para revisión;
- si el docente tiene permiso de escritura en el repo (sin él no podrá fusionar).

Cada estudiante ve el resultado como una tarjeta de verificación ("autor correcto", "aprobado por tu pareja", "pendiente de revisión del docente").

**A3. Calidad de código en el PR.** La app muestra el resultado de las comprobaciones automáticas del PR (Black y Pylint, con GitHub Actions) y el puntaje de Pylint frente al mínimo del trabajo. El mínimo es un dato configurable por trabajo, porque sube a lo largo del curso. El plan entrega una plantilla de repo con el flujo de trabajo ya escrito.

**Decisión abierta:** si los PR van al repo propio del estudiante (la app solo verifica) o a un repo del curso (con bloqueo real de fusión). Ver plan de estudios, 12.3.

## 3. Formularios, votaciones y preguntas relámpago (F22 y F23)

Un solo módulo para tres usos. La propuesta completa y la lista de 12 encuestas están en [encuestas.md](plan-de-estudios/encuestas.md).

**B1. Módulo de formularios.**
- Crear un formulario en menos de un minuto: pegando las preguntas como texto o desde una plantilla guardada.
- Tipos de pregunta: opción única, opción múltiple, escala de 1 a 5, sí o no, número, texto corto y largo.
- Configuración: anónimo o identificado, apertura y cierre (manual, programado o con cuenta regresiva), un solo intento y visibilidad de resultados (nunca, en vivo o al cerrar).
- Enlace corto y código QR generados automáticamente.
- Resultados agregados en vivo y exportación a CSV.
- Todo formulario queda guardado, se duplica y se copia con la edición del curso (F2).
- En los anónimos no se guarda quién respondió. El observador solo ve agregados, con el mismo mínimo de personas del resto de la app.

**B2. Preguntas relámpago.** Es un formulario de una pregunta con:
- respuesta correcta y explicación breve;
- ventana de tiempo de 60 a 90 segundos, visible en pantalla;
- un solo intento y parámetros opcionales distintos por estudiante, para que no se copien;
- XP de bonificación solo para quien responde dentro de la ventana, por lo que **la relámpago siempre es identificada** (nunca anónima);
- botón de "abrir ahora" en el panel del docente, que muestra el QR para compartir en pantalla.

El registro de quién respondió dentro de la ventana sirve también como señal de presencia en la sesión.

**B3. Votación de herramientas.** Las votaciones de la S4 (librería de visualización) y la S9 (herramienta de dashboards) usan la votación en vivo (F18). El resultado se guarda en la edición del curso, para que el material de las sesiones siguientes sepa qué herramienta ganó.

## 4. Diagnóstico y rutas

**C1. Diagnóstico en dos modos.** Sobre F7 y el modo de IA por evidencia que ya prevé el RFC:
- la tarea (con IA permitida) y la verificación sin IA se guardan como evidencias distintas por dimensión;
- la app calcula la brecha entre ambos modos;
- cada ejercicio existe en forma A y forma B, de igual dificultad, para el diagnóstico inicial y el final;
- el autoinforme se guarda para compararlo con el resultado real.

**C2. Rutas dinámicas.** Es un dato por edición, no código:
- el panel muestra el porcentaje de estudiantes en nivel 3 o más en Datos y propone la ruta (nivelación, estándar o profundización) según umbrales configurables, hoy provisionales (50 % y 80 %);
- el docente confirma o cambia la ruta;
- cada ejercicio de sesión se sirve en tres niveles (Base, Estándar, Reto), y a cada estudiante se le asigna el suyo según su radar de entrada.

**C3. Formación asistida de equipos.** A partir del radar de entrada, la app propone equipos equilibrados y el docente los ajusta. Cada equipo guarda sus roles (analista de datos, ingeniero de pipelines, modelador y narrador). La app también registra los trabajos del integrador por equipo.

## 5. Contenido del curso

**D1. Calendario de sesiones y plazos.** Un modelo de sesión con fecha, modalidad (virtual o presencial), semana y número (S1 a S16, más P1 a P3). Sobre él se cuelgan los plazos de los trabajos, las preguntas relámpago, el material y los recordatorios. Hoy el calendario real no existe, y de él depende asociar las presenciales a su semana.

**D2. Material complementario por sesión.** Cada recurso guarda: título, tipo (libro, capítulo, paper, video, documentación), idioma, si es gratuito, enlace, sesión, estado de verificación y fecha de la última verificación. Se muestra en la lección de cada sesión, con el idioma a la vista. Hay un recurso por verificar en varios lugares del plan (marcados «Pendiente»), así que el estado importa. Una comprobación periódica de enlaces rotos avisa al docente.

**D3. Resumen en español de recursos en inglés.** Para los recursos marcados [EN], un resumen breve en español y un glosario de términos, dentro de la app. Aprovecha lo que ya se estaba construyendo para promocionar la app con resúmenes en español. Va después del arranque.

## 6. Rúbricas y panel del docente

**E1. Criterios transversales de rúbrica (extiende F4).** Un criterio puede marcarse como transversal y aplicarse a todos los trabajos sin copiarlo uno por uno. El plan tiene dos:
- **Declaración de IA** (Dirección de IA): bitácora en cada entrega.
- **Calidad del código y tablero** (Producción): Black, Pylint y un issue enlazado al PR.

**E2. Panel del docente.** Una vista con:
- resultados del diagnóstico y de la verificación por dimensión, y la ruta propuesta;
- estado de cada entrega (cargada, verificada, aprobada por la pareja, pendiente de fusión);
- quién no ha cargado un trabajo, con un acceso directo a la encuesta de seguimiento;
- resultados en vivo de formularios y votaciones.

## 7. Datos nuevos (resumen)

| Entidad | Para qué |
|---|---|
| `sesiones` | Calendario, modalidad y plazos |
| `formularios`, `preguntas`, `respuestas` | Encuestas, votaciones y relámpago, con plantillas |
| `recursos` | Material complementario con su estado de verificación |
| `equipos`, `miembros_equipo` | Equipos del integrador y roles |
| `entregas` (ampliada) | Enlace del PR, SHA, aprobaciones, quién fusionó |
| `checks_pr` | Resultado de Black y Pylint por entrega |
| `rutas` | Ruta asignada por estudiante y edición |

Las políticas por fila deben cubrir las respuestas anónimas (sin identificador del estudiante) y las vistas de solo agregados del observador.

## 8. Fuera de alcance

- **Scrum:** se queda en GitHub Projects. La app no lo integra ni lo reproduce. Se puede revisar con la primera cohorte si vale la pena leer el estado de los tableros por la API de GitHub.
- Control de presencia con cámara o similares: la verificación sin IA se hace por videollamada fuera de la app.
- Lógica condicional y ramificación de preguntas en los formularios, en la primera versión.
- Alojamiento de Codespaces o de entornos de ejecución: la app solo enlaza la lección con el repo plantilla.

## 9. Preguntas abiertas

1. ¿PR en el repo propio del estudiante o en un repo del curso? (A2)
2. ¿La app comprueba que el docente tenga escritura en cada repo, o se verifica a mano en la S1?
3. ¿Qué mínimo de Pylint por trabajo? Propuesta inicial: 6, 7 y 8 de forma gradual.
4. ¿Qué cuenta como "presente" para la bonificación de las relámpago en las sesiones grabadas o vistas después?
5. ¿Cuándo se incorporan F22 y F23 al RFC-010?
