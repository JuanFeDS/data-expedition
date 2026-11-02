# Plan de acción: pantallas de la app

Borrador del 2026-11-01, **ejecutado el mismo día** (ver la bitácora al final). Objetivo de esta línea de trabajo: **diseñar y maquetar todas las pantallas** que la app necesita, en móvil y en escritorio, con datos de ejemplo. Lo funcional (Supabase, login real, API de GitHub) queda fuera y se planea aparte.

Insumos: [requisitos-app-plan-de-estudios.md](requisitos-app-plan-de-estudios.md), [plan-de-estudios.md](plan-de-estudios.md), [RFC-010](RFC-010-app-expedicion.md) y el prototipo de `web/`.

## 1. Decisiones ya tomadas (2026-11-01)

| Decisión | Resultado |
|---|---|
| Datos del prototipo | Se **alinean con el plan de estudios antes** de diseñar pantallas nuevas |
| Orden | **Estudiante primero**, luego docente, al final observador |
| Panel del docente | **Escritorio y móvil completos** |
| Gemas y álbum | Una gema por isla; el álbum vive dentro de la isla; Practicar es ilimitado y sirve para racha y XP |
| Escritorio | Capa ≥1100 px, sin scroll vertical (ajuste de escala), sin tocar el diseño móvil |

## 2. Qué hay hoy y qué falta

### Estudiante (existentes, 18 pantallas)
Acceso, Inicio, Mapa, Radar, Notas, Detalle de nota, Entregas, Nueva entrega, Lección, Resultado, Votación, Misión en equipo, Resumen, Perfil, Votación en vivo, Tutorial, Practicar, Unir conceptos.

### Pantallas nuevas y ajustes

| Código | Pantalla | Rol | Origen | Fase | Tamaño |
|---|---|---|---|---|---|
| E5 y E6 | **Entregas y Nueva entrega** con plazo, "tarde", aprobación de la pareja, quién fusionó y checks de Black y Pylint | Estudiante | A1, A2, A3 | 1 | M |
| E12 | **Perfil** con usuario de GitHub y su verificación | Estudiante | A1 | 1 | S |
| E17 | **Diagnóstico: introducción** (dos modos, con IA y sin IA, forma A y B) | Estudiante | C1 | 1 | M |
| E18 | **Diagnóstico: ejercicio** (tarea y verificación sin IA) | Estudiante | C1 | 1 | M |
| E19 | **Diagnóstico: resultado** (radar de entrada, brecha entre modos, autoinforme) | Estudiante | C1 | 1 | M |
| E20 | **Responder formulario o relámpago** (llega por QR, cuenta regresiva, un intento) | Estudiante | B1, B2 | 1 | M |
| E21 | **Resultado de relámpago** (correcta o no, explicación, XP de bonificación) | Estudiante | B2 | 1 | S |
| E22 | **Calendario** de sesiones y plazos (virtual o presencial, S1 a S16, P1 a P3) | Estudiante | D1 | 1 | M |
| E23 | **Detalle de sesión** con material complementario (idioma, gratis o no, [EN]) | Estudiante | D2, D3 | 1 | M |
| E24 | **Mi ruta y mi equipo** (nivelación, estándar o profundización; roles del integrador) | Estudiante | C2, C3 | 1 | M |
| E7, E16, E25 | **Sesión de práctica** (5 preguntas seguidas con varios formatos) y cierre | Estudiante | F11 | 1b | L |
| E9 y E13 | Votación de herramientas (S4 y S9) con resultado guardado | Estudiante | B3 | 1 | S |
| D1 | **Panel del docente** (resumen del curso, alertas) | Docente | E2 | 2 | L |
| D2 | **Diagnóstico y rutas** (distribución, umbrales, confirmar ruta) | Docente | C1, C2 | 2 | M |
| D3 | **Entregas** (estado, verificación, quién falta, acceso a encuesta) | Docente | A2, E2 | 2 | L |
| D4 | **Corrección de una entrega** (rúbrica de 5 niveles, criterios transversales) | Docente | F4, E1 | 2 | L |
| D5 | **Formularios**: lista, crear, configurar y resultados en vivo con QR | Docente | B1, B2, B3 | 2 | L |
| D6 | **Calendario y plazos** (administrar) | Docente | D1 | 2 | M |
| D7 | **Equipos** (propuesta asistida, ajustes, roles) | Docente | C3 | 2 | M |
| D8 | **Ficha de estudiante** (radar, notas, evidencias, declaraciones) | Docente | F9 | 2 | M |
| D9 | **Material** (recursos y su estado de verificación) | Docente | D2 | 2 | M |
| D10 | **Configuración del curso** (dimensiones, rúbricas, umbrales, mínimo de Pylint) | Docente | F3, A3, C2 | 2 | M |
| D11 | **Acciones rápidas en móvil** (abrir relámpago con QR, quién falta) | Docente | B2, E2 | 2 | S |
| O1 | **Resumen por grupo** (solo agregados, mínimo de 5 personas) | Observador | RFC 5.3 | 3 | M |
| O2 | **Por dimensión y trabajo** | Observador | RFC 5.3 | 3 | M |
| T1 | **Acceso por rol** (estudiante, docente, observador) y navegación por rol | Todos | F1 | 4 | M |
| T2 | **Estados vacíos, de carga y de error** en las pantallas clave | Todos | N4 | 4 | M |
| T3 | **Tema oscuro** (el RFC exige claro y oscuro; hoy no existe) | Todos | N4 | 4 | L |

Tamaños: S = media jornada, M = una jornada, L = más de una jornada.

## 3. Fases

### Fase 0. Alinear el prototipo con el plan de estudios (previa a todo)
Hoy el prototipo tiene 3 trabajos y 8 islas por tema. El plan tiene **16 sesiones, 8 semanas y 7 trabajos (T1 a T7)**.
- **0.1** Proponer la correspondencia entre las 8 semanas del plan y las 8 islas (nombres, orden, gema) y confirmarla contigo. Propuesta inicial, por confirmar:

| Semana del plan | Foco | Isla (propuesta) | Trabajo |
|---|---|---|---|
| 1 | Introducción, entorno, diagnóstico, pandas básico | Valle de los Datos | PR de prueba y diagnóstico |
| 2 | pandas avanzado, visualización, EDA | Páramo de la Limpieza | T1 |
| 3 | Regresión, clasificación, baseline | Desierto del Modelado | T2 |
| 4 | Big Data, Hadoop y Spark | Cueva de la Escala (antes, Cueva de los Modelos) | T3 |
| 5 | Dashboards y storytelling | Glaciar de la Comunicación | T4 |
| 6 | Árboles, ensambles, pipelines y equipos | Costa de los Ensambles (antes, Costa de la Exploración) | T5 |
| 7 | Validación cruzada, SHAP y LIME | Ruinas de la Validación | T6 |
| 8 | Verificación sin IA, integrador | El Volcán | T7 |

- **0.2** Reescribir `datos.ts`: semanas, hitos (T1 a T7), fechas, frases del jaguar, gemas por isla y mínimo de Pylint por trabajo.
- **0.3** Ajustar textos y pantallas que citan datos fijos (Inicio, Mapa, Entregas, Notas, Resumen, Tutorial).
- **0.4** Decidir qué pasa con las dimensiones Producción y Dirección de IA, que el plan trata como criterios transversales y que no tienen isla.
- **Hecho cuando:** la app cuenta la misma historia que el plan, sin inconsistencias visibles.

### Fase 1. Estudiante: lo necesario para arrancar
Orden de trabajo: **1.1** Entrega por PR completa (E5, E6, E12) → **1.2** Diagnóstico (E17 a E19) → **1.3** Formularios, relámpago y votaciones (E20, E21, E9, E13) → **1.4** Calendario y detalle de sesión (E22, E23) → **1.5** Mi ruta y mi equipo (E24).
- Reutilizar lo que ya existe: tarjeta de verificación y pasos (E6), cuenta regresiva (lección), modal por isla (álbum), efectos de pulido (gemas).
- **Hecho cuando:** un estudiante recorre de punta a punta el inicio del curso (acceder, ver calendario, hacer el diagnóstico, cargar un PR, responder una relámpago) solo con pantallas.

### Fase 1b. Sesión de práctica (tipo Duolingo)
Una sesión de 5 preguntas seguidas, con los formatos que prevé el RFC (F11): opción múltiple, verdadero o falso, unir conceptos, ordenar y completar. Incluye reintento de falladas al final y cierre con XP y racha. Se diseña después de la fase 1, porque comparte componentes con el diagnóstico.

### Fase 2. Docente (escritorio y móvil completos)
Orden de trabajo: **2.1** D1 Panel y D3 Entregas → **2.2** D4 Corrección → **2.3** D5 Formularios y D11 acciones rápidas → **2.4** D2 Diagnóstico y rutas, D7 Equipos y D8 Ficha → **2.5** D6 Calendario, D9 Material y D10 Configuración.
- El docente es un rol distinto: tendrá su propia barra de navegación y su propio tono visual, pero conserva los tokens y las gemas.
- **Hecho cuando:** el docente puede revisar el estado de una cohorte, corregir una entrega y abrir una relámpago, en escritorio y en el celular.

### Fase 3. Observador
Dos pantallas de agregados, con el mínimo de personas visible ("faltan respuestas para mostrar este dato"). Sin nombres, sin bitácoras y sin votos individuales.

### Fase 4. Transversales
Acceso por rol (T1), estados vacíos, de carga y de error (T2) y tema oscuro (T3). El tema oscuro es el cambio más grande de esta fase y toca todo el CSS; se hace al final para no rehacerlo cada vez que se agregue una pantalla.

### Fase 5. Verificación y entrega
- Recorrer las pantallas en 390 px, 1100 px, 1440×900 y 1755×851, sin scroll vertical en escritorio.
- Revisar contraste, foco de teclado y `prefers-reduced-motion`.
- Agrupar la galería por rol (estudiante, docente, observador).
- Actualizar el README y el RFC (incluir F22 y F23, y el resto de los requisitos).

## 4. Criterios de "hecho" para cada pantalla
1. Funciona en móvil y en escritorio, y el escritorio no hace scroll vertical.
2. Usa datos del plan de estudios, no genéricos.
3. Tiene sus estados principales: normal, vacío y error o carga cuando aplique.
4. Animaciones con `prefers-reduced-motion` respetado.
5. Registrada en la galería (`#/todas`), con su código.
6. Verificada con captura en ambos tamaños.

## 5. Decisiones abiertas que afectan al diseño
1. **Correspondencia semanas e islas** (fase 0.1): hay que confirmarla antes de reescribir los datos.
2. **PR en repo propio o en repo del curso** (plan 12.3, pregunta 10.7): cambia el texto y las comprobaciones de la tarjeta de verificación.
3. **Calendario real de las sesiones** y qué se hace en las presenciales: afecta a E22 y D6.
4. **Producción y Dirección de IA** sin isla: dónde se muestran en el radar y en el perfil.
5. **Mínimo de Pylint por trabajo** y cómo llega el puntaje a la app (D10 y E6).
6. **Escala de los umbrales de ruta**: "nivel 3 o más" frente a radar de 0 a 100 (D2 y E24).
7. **Parejas de revisión**: falta una entidad que diga quién revisa a quién (E6 y D3).
8. **Número de estudiantes** por grupo: define el mínimo de personas del observador y el correo del resumen semanal.
9. **Fotos del álbum:** las 8 hojas se generan con IA a partir de [prompts-album-fotos.md](prompts-album-fotos.md); las fotos de hoy son provisionales.

## 6. Pendientes de limpieza en los documentos
Para dejar el plan consistente se debe corregir en `requisitos-app-plan-de-estudios.md`: definir F22 y F23 (propuesta: F22 = módulo de formularios, F23 = relámpago); aclarar que la relámpago es siempre identificada; quitar la frase conversacional de D3; reconciliar el número de trabajos (RFC: "3 o 4"; plan: 7); y añadir una tabla de pantallas que remita a este plan.

## 7. Supuestos tomados durante la ejecución

Las decisiones abiertas de la sección 5 no se detuvieron: se eligió un valor por defecto, que vive como dato (casi siempre en `web/src/datos.ts` o `web/src/datosPlan.ts`) y se cambia en una línea. Hay que confirmarlos.

| # | Decisión abierta | Valor usado | Dónde está |
|---|---|---|---|
| 1 | Semanas frente a islas | La tabla de la fase 0.1, tal cual: Valle, Páramo, Desierto, Cueva de la Escala, Glaciar, Costa de los Ensambles, Ruinas y Volcán | `regionesCurso` en `datos.ts` |
| 2 | PR en repo propio o del curso | **Repo propio** (lo que ya dice F21) | texto de `E6` y de `D4` |
| 3 | Parejas de revisión | Un campo `pareja` por estudiante | `estudiantes` en `datosPlan.ts` |
| 4 | Puntaje de Pylint | Un número simulado por entrega, con mínimos de 6, 7 y 8 (8 desde el T3) | `trabajos` en `datos.ts` |
| 5 | Umbrales de ruta | Sobre el radar de Datos de 0 a 100: 50 y 80 | `UMBRAL_*` en `datosPlan.ts` |
| 6 | Dimensiones sin isla | Producción queda ligada a la Costa de los Ensambles y Datos a la Cueva de la Escala; **Dirección de IA** es solo transversal, sin gema | `gemasCurso` |
| 7 | Calendario real | Fechas de ejemplo (martes y jueves, 6:00 p. m.); aviso visible en las pantallas | `sesiones` en `datosPlan.ts` |
| 8 | Estudiantes | 12 de muestra en 3 grupos de 4; el observador oculta los grupos de menos de 5 personas | `estudiantes` |
| 9 | Tema oscuro | Opcional, desactivado por defecto, con interruptor en la barra lateral y en el menú | `componentes/tema.tsx` |

## 8. Bitácora de ejecución

Estado de cada pantalla al 2026-11-01. "Medida" quiere decir que se comprobó que no hay scroll vertical en escritorio (1755×851 y 1366×768) y que se vio una captura. Todas las rutas se abren con `#/<código>`.

| Fase | Pantallas | Estado |
|---|---|---|
| 0 | Datos alineados con el plan (7 trabajos, 8 semanas, 8 islas, fechas) | Hecha |
| Base | Roles, navegación por rol (barra lateral y menú móvil), componentes de panel, íconos nuevos | Hecha |
| 1 | `e17` Diagnóstico, `e18` ejercicio, `e19` resultado | Hechas y medidas |
| 1 | `e20` formulario y pulso, `e21` resultado de relámpago, `e25` votación de herramienta | Hechas y medidas |
| 1 | `e22` calendario, `e23` detalle de sesión, `e24` ruta y equipo | Hechas y medidas |
| 1 | `e5`, `e6`, `e12` con plazo, pareja, calidad de código y GitHub | Hechas y medidas |
| 1b | `e7` sesión de 5 preguntas con 5 formatos y reintento, `e16` ejercicio de unir | Hechas y medidas |
| 2 | `d1` a `d11` (panel, diagnóstico y rutas, entregas, corrección, formularios, calendario, equipos, ficha, material, configuración, en clase) | Hechas y medidas |
| 3 | `o1`, `o2`, `o3` observador | Hechas y medidas |
| 4 | `e0` con acceso por rol, `e26` estados del sistema, tema oscuro | Hechas; el tema oscuro cubre las pantallas revisadas (ver límites) |
| 5 | Verificación en 3 tamaños y capturas en móvil | Hecha, con las salvedades de abajo |

### Límites conocidos
- **Tema oscuro:** se revisó en seis pantallas. No se recorrieron las 50 una por una; los colores fijos que quedan (por ejemplo, en el radar) son los de la marca y funcionan en ambos temas.
- **Ventanas muy bajas:** a 1317×640 las pantallas densas se reducen hasta un 60 % de escala y algunas pueden quedar pequeñas.
- **Animaciones:** se comprobaron los estados finales con capturas; la secuencia en movimiento no se pudo ver desde el entorno de pruebas.
- **Todo es de muestra:** no hay datos reales, ni verificación contra GitHub, ni base de datos.
