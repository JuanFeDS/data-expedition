# RFC-010 — data-expedicion: app de seguimiento, calificación y gamificación para el curso (M19)

| Campo | Valor |
|---|---|
| Estado | 📝 Borrador del 2026-10-31, revisado con Juan el mismo día (decisiones en la sección 9; preguntas abiertas en la sección 10) |
| Autor | Faro |
| Constructor | Juan + Claude, en un repo propio (`data-expedicion`, nombre elegido por Juan el 2026-10-31) |
| Misión | M19 — Profesor universitario de ciencia de datos (`MISIONES.md`) |
| Fecha | 2026-10-31 |
| Fecha límite externa | Ninguna dura. La clase empieza la primera semana de noviembre y **no depende de la app** (ver sección 5.8) |
| Insumo | [`conocimiento/pedagogia-contemporanea.md`](../conocimiento/pedagogia-contemporanea.md), secciones 8 y 9 |

> El RFC-009 está reservado para la demo y el proyecto de M18 (pausada), que no se escribió.

---

## 1. Por qué existe

Juan dará 3 cursos de ciencia de datos (intermedio a avanzado, 2 meses) con el mismo material. Decidió repensar la docencia para la era de la IA: la evaluación se rediseña antes que la clase, se permite la IA con declaración obligatoria, y cada estudiante tiene un **perfil de habilidades (radar)** que parte de un diagnóstico y evoluciona con el trabajo del curso. Todo envuelto en una **gamificación** de expedición, con lecciones cortas en el celular y misiones largas.

Ninguna herramienta que Juan conozca une esas piezas: rúbricas por niveles que alimentan un radar, nota tradicional aparte, declaración de IA por entrega, lecciones tipo Duolingo y votaciones por grupo. De ahí la app.

## 2. El problema

- Un LMS (Moodle, Canvas) califica y entrega tareas, pero no calcula un radar por dimensión ni gamifica; y todavía no se sabe si la universidad obliga a usar uno.
- Una hoja de cálculo cubre notas y radar al inicio, pero no ofrece lecciones en el celular, votaciones, XP ni vistas privadas por estudiante.
- Herramientas de juego (Kahoot, Mentimeter) no se conectan con las rúbricas ni con el radar.

## 3. Requisitos

### 3.1 Funcionales

**Núcleo (v1)**
- **F1.** Autenticación real. Roles: docente (Juan), estudiante y **observador**. Cada estudiante ve **solo lo suyo**; el docente ve todo; el observador ve **solo datos anonimizados** (sección 5.3). La vista de cada perfil se define con Juan (sección 5.10).
- **F2.** Un **curso** (plantilla reutilizable) con **ediciones** (cada vez que Juan lo dicta). Una edición copia la plantilla y tiene **grupos** (3 en la primera) que comparten un único catálogo de trabajos, rúbricas y dimensiones. Las notas, el avance y los votos son por grupo. Cambiar la plantilla no altera ediciones pasadas.
- **F3.** La app es **agnóstica al temario**: dimensiones, trabajos, rúbricas y ejercicios son **datos configurables**, no código. Borrador inicial (datos de ejemplo, no código): Datos, Análisis, Modelado, Validación, Comunicación, Producción y Dirección de IA. El plan real del curso se carga cuando la universidad lo entregue.
- **F4.** **Rúbricas por niveles** con una escala de **5 niveles** por criterio (los 3 niveles de la primera propuesta eran demasiado gruesos para alimentar el radar). Cada criterio pertenece a una dimensión. La corrección de un trabajo registra un nivel por criterio. Los 5 niveles llevan descriptor escrito. El docente puede calificar con decimales (paso de 0.5, por ejemplo 3.5).
- **F5.** **Nota tradicional de 1.0 a 5.0, con decimales,** por trabajo (3 o 4 en el curso), calculada a partir de la rúbrica con una regla visible para el estudiante. **0 significa "no presentó"** y se puede recuperar con trabajos adicionales. La nota es individual; en trabajos en equipo todos los miembros reciben la misma.
- **F6.** **Declaración de IA por entrega**: "Con IA" o "Sin IA". Cada modo tiene su propio conjunto de criterios. En "Con IA" se adjunta la bitácora (qué pidió, qué aceptó, qué descartó y por qué).
- **F7.** **Diagnóstico de la semana 1**: ejercicios por dimensión que fijan el punto de partida del radar. No cuenta para aprobar. Al final del curso se aplica una forma paralela.
- **F8.** **Radar por estudiante**: se calcula con la evidencia de cada dimensión (sección 5.4) y se compara siempre contra su propio punto de partida, no contra los demás.
- **F9.** **Vista del estudiante** (radar, notas, retroalimentación, declaraciones) y **panel del docente** (progreso por grupo, entregas por corregir, errores frecuentes por criterio).
- **F10.** Preguntas de decisión dentro de cada entrega y marca de las **revisiones al azar** semanales (2 o 3 equipos, 3 minutos): el sustituto de la defensa oral completa.

**Juego (v1.5)**
- **F11.** **Lecciones** de 3 a 5 minutos pensadas para el **celular** (toques, no teclear): opción múltiple, verdadero o falso con justificación a elegir, emparejar, ordenar, completar con opciones, número con teclado numérico y tocar la línea con el error. Tienen retroalimentación inmediata y tiempo límite.
- **F12.** Los ejercicios con números pueden ser **parametrizados**: cada estudiante recibe valores distintos, generados de forma determinista a partir de una semilla (estudiante + ejercicio).
- **F13.** **XP** en una capa propia. Las lecciones dan XP y un aporte pequeño y con **tope configurable** al radar, marcado como "práctica verificada ligera".
- **F14.** **Misiones**: trabajos largos (1 a 2 horas) en equipo, que son los trabajos con rúbrica de F4. El **proyecto final** es una misión en equipo con arquetipos mezclados: cada miembro responde por su rol y la bitácora muestra su contribución.
- **F15.** **Arquetipos** asignados desde el diagnóstico (por ejemplo, fortalezas y debilidades por dimensión).
- **F16.** **Votaciones y encuestas** dentro de la app. Cada grupo vota su **modo de clase**: colaborativo o competitivo. Mismas misiones, distinta puntuación: metas de grupo, o ligas pequeñas armadas por nivel del diagnóstico. El voto puede repetirse por módulo.
- **F17.** **Narrativa de expedición, ligera**: vocabulario y estética (rutas, bitácora, hallazgos, roles), sin personajes ni diálogos. Las dimensiones conservan su nombre real.

**Después (v2)**
- **F18.** Votación en vivo durante la clase (*peer instruction*) con histograma por pregunta y dimensión, e insignias.
- **F19.** Misiones de temporada para sostener la novedad hacia las semanas 3 y 4.

**Agregado el 2026-10-31**
- **F20.** **Resumen semanal por estudiante**: un reporte con análisis de su semana (radar frente a su punto de partida, notas, lecciones, qué mejoró y qué no). Se entrega **dentro de la app y también por correo**. Proveedor de envío y revisión previa del docente por definir (pregunta 17).

### 3.2 No funcionales
- **N1.** Costo cero estricto (por confirmar, pregunta 2).
- **N2.** Datos personales y notas de estudiantes: sujetos a la Ley 1581 de 2012 y a las políticas de la universidad. Se guarda lo mínimo (nombre, correo institucional, grupo), con finalidad informada, acceso por rol y nada público.
- **N3.** Ninguna clave ni solución de ejercicio en el navegador (sección 5.6).
- **N4.** Mobile-first para lecciones y votaciones; computador para misiones. Tema claro y oscuro, accesible con teclado.
- **N5.** El banco de ejercicios es un activo propio de Juan y vive fuera de la app (sección 5.5).
- **N6.** La regla para aprobar es una configuración, no código: hoy no está definida (pregunta 4).

## 4. Fuera de alcance

- Integración con el LMS de la universidad (importar o exportar). Se decide cuando se sepa si hay uno obligatorio.
- Reemplazar los canales oficiales de la universidad para reportar notas finales.
- Tabla de posiciones global (se descartó por decisión de Faro y de Juan: solo ligas por nivel, y solo si el grupo vota competir).
- Detectores de IA. La verificación de comprensión es la revisión al azar y las preguntas de decisión, no un detector.
- Chat, foro o mensajería.

## 5. Diseño propuesto

### 5.1 Arquitectura

Hexagonal, con la misma disciplina que `faro-core` (RFC-003). Tres ideas: el dominio no conoce la base de datos ni la interfaz; todo lo que sale al exterior pasa por un puerto; y las reglas que cambian con el curso son datos.

```
data-expedicion/
├── src/
│   ├── dominio/           # entidades y reglas puras: rúbrica, nota, radar, xp, liga, arquetipo
│   ├── puertos/           # interfaces: RepositorioCurso, RepositorioEntregas,
│   │                      #   ProveedorEjercicios, Reloj, Semilla
│   ├── casos-de-uso/      # calificar-entrega, calcular-radar, aplicar-diagnostico,
│   │                      #   responder-leccion, votar-modo, formar-ligas
│   └── adaptadores/
│       ├── supabase/      # implementa los repositorios (Postgres + Auth + RLS)
│       └── banco/         # implementa ProveedorEjercicios leyendo el repo del banco
├── web/                   # interfaz (React + Vite + TypeScript), sin lógica de negocio
│   ├── estudiante/        # radar, notas, lecciones, misiones, votaciones
│   └── docente/           # corrección, paneles, configuración
├── supabase/              # migraciones y políticas de acceso (RLS)
├── test/                  # espeja src/ y web/
└── docs/                  # este RFC copiado y decisiones
```

**Regla de dependencias**: `dominio` no importa nada; `puertos` solo importa `dominio`; `casos-de-uso` solo `dominio` y `puertos`; los `adaptadores` y `web` dependen hacia adentro. Un lint de fronteras lo vigila. Las pruebas viven en `test/` espejando `src/`. El dominio se prueba sin red ni base de datos.

### 5.2 Stack (propuesta, por confirmar)

- **Supabase** (Postgres, Auth, políticas por fila): encaja con "cada estudiante ve solo lo suyo" y con el stack de referencia de Juan.
- **Frontend**: React, Vite y TypeScript, como Trazo y el formato de demos (RFC-007). Instalable como **PWA** para que las lecciones se sientan como una app en el celular.
- **Hosting estático** gratuito para el frontend (GitHub Pages o Cloudflare Pages).
- **Lógica sensible en el servidor** (corrección de lecciones, sección 5.6): funciones de Supabase.

**Región:** São Paulo. Supabase no tiene región en Colombia y Juan lo aceptó; queda por confirmar con la universidad si necesita algo adicional por la Ley 1581 (transferencia internacional, pregunta 9).

Riesgo a vigilar: el plan gratuito de Supabase **pausa proyectos inactivos** (unos 7 días). Mientras se trabaja la app no ocurrirá; para los recesos del curso se programa una consulta periódica que lo mantenga activo.

### 5.3 Modelo de datos (resumen)

- `ediciones` (periodo). La **plantilla** reutilizable es una edición con `es_plantilla = true`; dimensiones, trabajos y criterios cuelgan siempre de una edición, y crear una edición nueva es copiar las filas de la plantilla.
- `perfiles` (usuario, rol), `grupos` (de una edición), `matriculas` (perfil, edición, grupo), `equipos`, `miembros_equipo` (con el rol de expedición que tenía cada miembro al formar el equipo: es una foto, ver sección 5.4).
- `dimensiones` (configurable), `trabajos`, `criterios` (trabajo, dimensión, modo de IA, descriptores de los 5 niveles).
- `entregas` (estudiante o equipo, trabajo, modo de IA declarado, bitácora), `calificaciones` (criterio, nivel, comentario).
- `diagnosticos` y `resultados_diagnostico`, `evidencias_radar` (estudiante, dimensión, fuente, valor, fecha).
- `ejercicios` (id del banco, versión, dimensión, nivel, formato), `intentos`, `eventos_xp`.
- `votaciones`, `opciones`, `votos`, `ligas`.

**Acceso**: las tablas con datos de estudiantes llevan políticas por fila: el estudiante lee lo suyo, el equipo lee lo de su equipo, el docente lee todo, y los votos son anónimos hacia los demás estudiantes.

**Observador**: no tiene acceso a las tablas con datos de estudiantes. Lee solo **vistas de la base de datos que ya entregan datos anonimizados**: agregados por grupo, dimensión y trabajo, sin nombre, correo ni identificador estable. Para que un agregado no identifique a nadie, una vista **no devuelve resultados de menos de un mínimo de personas** (valor inicial propuesto: 5, configurable). No ve bitácoras, textos de entregas, comentarios ni votos individuales. El anonimato se garantiza en la base de datos, no en la interfaz.

El observador son los **monitores** y la **universidad** si lo solicita. Además de los agregados por dimensión y trabajo, ve el **resumen general de cada grupo**, sujeto al mismo mínimo de personas. Queda por revisar el riesgo de identificar a alguien por diferencia entre agregados repetidos en el tiempo, cuando se conozca el tamaño de los grupos.

### 5.4 Cálculo del radar

Dominio puro, sin base de datos. Para cada dimensión, el valor de un estudiante sale de la evidencia que le llega:

| Fuente | Aporte | Observación |
|---|---|---|
| Diagnóstico inicial | Punto de partida | No cuenta para aprobar |
| Trabajos con rúbrica | Peso alto | Evidencia fuerte, con IA declarada |
| Lecciones y práctica | Peso bajo, con tope | "Práctica verificada ligera" |
| Diagnóstico final (forma paralela) | Contraste con el inicial | Mide el cambio |

**Escala.** Cada criterio se califica en 5 niveles (F4). El valor de una dimensión en el radar es un número continuo de **0 a 100** (promedio ponderado de la evidencia, con los niveles convertidos a esa escala), no uno de 3 o 5 escalones. Así dos estudiantes del mismo "nivel" se distinguen y el movimiento del radar se nota entre trabajos. Visualmente pueden agruparse en bandas para leerlo de un vistazo. La conversión exacta se fija con la primera cohorte.

Se muestra **siempre contra su propio punto de partida**. Los pesos y el tope son configuración y se calibran con la primera cohorte. La fórmula exacta se fija en la primera versión y se documenta en el repo; no se promete en este RFC más precisión que la que la evidencia permite.

**Cálculo en el servidor.** El radar se calcula en el servidor con el mismo código del dominio (TypeScript puro, ejecutado en una función de Supabase y en las pruebas) y se guarda un valor por estudiante y dimensión. El cliente solo lo muestra.

**Conversión inicial (se calibra con la primera cohorte).** Lineal y continua: valor = (nivel − 1) / 4 × 100, de modo que 1 → 0, 3 → 50, 5 → 100 y 3.5 → 62.5. La dimensión es el promedio ponderado de sus criterios.

**Propuestas a profundizar en el desarrollo (no cerradas):**
- *Modo de IA.* Cada criterio tiene dimensión y modo (Con IA o Sin IA) y todos aportan a su dimensión. "Dirección de IA" solo se evalúa en Con IA. El radar guarda cuántas evidencias vienen de cada modo.
- *Trabajos en equipo.* La nota es igual para todos, pero el radar individual puede diferir: el aporte de cada criterio se pondera según el rol (o el arquetipo) del estudiante en el equipo. Las dimensiones de su rol pesan más. Riesgo: ponderar por arquetipo, que sale del diagnóstico, tiende a confirmar fortalezas; se prefiere el rol del equipo.
- *El rol de expedición es dinámico.* Depende de las habilidades que el estudiante va desarrollando, así que no es un dato fijo: se **deriva del radar actual** con una regla configurable en el dominio puro (`derivarRol`). Al formar un equipo se guarda el rol de cada miembro en ese momento (foto en `miembros_equipo`) y esa foto pondera el radar de ese trabajo, para que un cambio posterior de rol no recalcule trabajos pasados. El historial de roles se reconstruye desde las `evidencias_radar` (fechadas) y alimenta el resumen semanal (F20). Por decidir: si el rol de cada trabajo es automático o automático con ajuste del docente (se recomienda lo segundo). No confundir con el rol de acceso (docente, estudiante, observador), que es estático y lo asigna el docente.

### 5.5 El banco de ejercicios

Un repo aparte, de Juan y reutilizable en futuros cursos (nombre propuesto: `data-expedicion-banco`). Contiene cada ejercicio en un formato abierto (por ejemplo YAML con esquema validado):

```
id, dimension, nivel, formato, enunciado, opciones o generador, respuesta o regla de corrección,
explicación, fuentes, versión
```

La app lo lee por el puerto `ProveedorEjercicios`. Con los datos de cada cohorte se calibra qué ejercicios son demasiado fáciles o confusos. El banco **no se mezcla con el contrato ni con el código de la app**: es un activo propio.

### 5.6 Que la solución no viaje al navegador

Si la respuesta correcta está en el código del cliente, cualquiera la lee. Para las lecciones que dan XP o mueven el radar, la corrección ocurre en el servidor: el cliente envía su respuesta y recibe el resultado. Los ejercicios parametrizados se generan con una semilla determinista (estudiante + ejercicio) y también se corrigen allí. El diagnóstico y las entregas siguen la misma regla.

### 5.7 Gamificación: principios

- El juego **sirve al perfil**, no al revés: el radar es la hoja de personaje y la narrativa vive en el recorrido, no en los ejes.
- El XP no es nota. Desbloquea cosas con valor real (por confirmar, pregunta 11).
- Cooperación por defecto; la competencia es una decisión del grupo, con ligas por nivel.
- Evitar rachas punitivas y tablas globales.
- Contenido de temporada para las semanas 3 y 4.

### 5.8 Plan B: la clase no espera

La primera semana se arranca sin la app, con lo que ofrezca la universidad o con una **hoja de cálculo** (notas, rúbrica y un radar a mano o con una gráfica). La app se construye en paralelo. El hito H1 incluye una plantilla de esa hoja, con las mismas dimensiones y rúbricas, para que la migración a la app no pierda datos.

### 5.9 Alternativas descartadas

- **Solo hoja de cálculo:** no ofrece lecciones en el celular, XP ni vistas privadas. Se conserva como plan B, no como destino.
- **Plugin para Moodle o Canvas:** acopla la app a un sistema que se desconoce y limita el diseño del juego.
- **Kahoot o Mentimeter como núcleo:** no se conectan a las rúbricas ni al radar. Se pueden usar al inicio solo para votar en vivo.
- **Todo dentro del LMS de la universidad:** sin control sobre el radar, el banco ni los datos.
- **Defensa oral completa de todos:** no cabe en el tiempo de Juan; se reemplaza por preguntas de decisión y revisión al azar.

### 5.10 Vistas por perfil

**Se definen con Juan, no las fija Faro.** Este apartado queda abierto a propósito: es la parte que más se ve y la que más depende de cómo Juan imagina la clase. Antes de construir se acuerda, perfil por perfil, qué se ve, qué se puede hacer y qué nunca se muestra.

| Perfil | Ve (punto de partida) | Por definir con Juan |
|---|---|---|
| Estudiante | Su radar contra su punto de partida, sus notas, retroalimentación, declaraciones, lecciones, misiones y votaciones | Pantalla de inicio, cómo se presenta el radar, qué ve del grupo |
| Docente | Todo: progreso por grupo, entregas por corregir, errores frecuentes, configuración | Qué va en la pantalla principal, flujo de corrección |
| Observador | Solo datos anonimizados y agregados (sección 5.3) | Quién es, qué necesita ver, con qué mínimo de personas |

Método: bocetos de cada vista antes de escribir interfaz, con la skill `frontend-studio` y revisión de Juan con capturas. Se empieza por el estudiante, que usa más el celular. Las decisiones se anotan en este RFC (sección 9) o en un anexo.

## 6. Evaluación

La app se valida con uso real, no con una demostración:
- Un estudiante abre la app en el celular, ve su radar y entiende en menos de un minuto qué dimensiones subió y cuáles no.
- Corregir una entrega de un grupo con la rúbrica no lleva más tiempo que corregirla en la hoja de cálculo.
- Una lección parametrizada entrega valores distintos a dos estudiantes y la solución no aparece en el cliente.
- Al final del curso, Juan puede responder con la app: ¿qué dimensiones suben menos en cada grupo y qué errores son más frecuentes?

## 7. Hitos

> Decisión del 2026-10-31: Juan quiere **montar todo de una vez**, no por fases. Los hitos siguientes pasan a ser el **orden de construcción** y no entregas separadas. El riesgo de calendario (pregunta 13) crece: el plan B de H1 sostiene la primera semana mientras la app no está lista.

- **H0.** Datos de la universidad: contrato y propiedad del material, LMS, tamaño de los grupos, fecha de inicio, guía del curso, regla para aprobar.
- **H1.** Plan B: plantilla de hoja de cálculo con dimensiones, rúbricas, notas y radar. Lista para la primera semana.
- **H1b.** Vistas de cada perfil definidas con Juan (sección 5.10), con bocetos aprobados.
- **H2.** Esqueleto del repo con la arquitectura (sección 5.1), lint de fronteras, autenticación, modelo de datos y políticas de acceso.
- **H3.** Rúbricas, notas, declaración de IA, diagnóstico y radar (F1 a F10). Cierra la v1.
- **H4.** Vista del estudiante y panel del docente, probados con un grupo real.
- **H5.** Repo del banco con el formato, el esquema y los primeros ejercicios; lecciones, XP y arquetipos (v1.5).
- **H6.** Misiones, equipos, proyecto final y votación del modo de clase.
- **H7.** Votación en vivo, insignias y misiones de temporada (v2).

## 8. Criterios de aceptación (con esto revisa Faro, sobre el artefacto)

**v1 (H3 y H4)**
1. Autenticación real; un estudiante no puede leer los datos de otro (probado con dos cuentas). El observador no puede leer ninguna tabla con datos de estudiantes, solo las vistas anonimizadas, y estas no devuelven resultados por debajo del mínimo de personas (probado con una cuenta de observador).
2. Existen los 3 grupos con un único catálogo de trabajos, rúbricas y dimensiones.
3. Las dimensiones se editan como datos, sin cambiar código.
4. Corregir una entrega registra un nivel por criterio y calcula la nota de 1 a 5 con la regla visible.
5. Cada entrega lleva su declaración "Con IA" o "Sin IA", con criterios distintos y la bitácora cuando aplica.
6. El diagnóstico fija el punto de partida y el radar se muestra contra él.
7. El panel del docente muestra el avance por grupo, las entregas pendientes y los errores frecuentes por criterio.
8. El dominio (radar, nota, reglas) se prueba sin red ni base de datos; las pruebas viven en `test/` y el lint de fronteras pasa.
9. Los datos personales cumplen N2 y ningún dato de estudiantes es público.

**v1.5 (H5 y H6)**
10. Una lección se completa en el celular con toques, con retroalimentación inmediata y tiempo límite.
11. Dos estudiantes reciben valores distintos en un ejercicio parametrizado, y la solución no está en el código del cliente.
12. Las lecciones dan XP y un aporte al radar que nunca supera el tope configurado.
13. El grupo vota su modo (colaborativo o competitivo) y las ligas se arman por nivel del diagnóstico.
14. El banco de ejercicios vive en un repo aparte, en formato abierto y validado por un esquema.
15. Ninguna clave aparece en el repo, el historial ni el navegador.

## 9. Decisiones previas

Tomadas por Juan el 2026-10-31 (detalle en `conocimiento/pedagogia-contemporanea.md`, secciones 8 y 9):
- Radar y notas son dos calificaciones separadas; las notas son 3 o 4 trabajos de 1 a 5, con rúbricas por niveles.
- IA permitida con declaración obligatoria; los dos modos tienen el mismo tope de nota y evalúan habilidades distintas; declarar falsamente es un 0 como advertencia.
- Sin defensa oral completa por falta de tiempo.
- La gamificación es el eje; narrativa de expedición ligera; dimensiones con su nombre real.
- Cada grupo vota el modo colaborativo o competitivo.
- Lecciones tipo Duolingo en el celular y misiones grandes en computador; el banco de ejercicios es un activo propio y el material es de Juan.

Tomadas por Juan después del borrador (2026-10-31):
- La app se llama `data-expedicion`.
- Se agrega el rol de **observador**, que ve solo datos anonimizados.
- La escala de 3 niveles es muy corta: se agranda (propuesta de Faro: 5 niveles por criterio y radar de 0 a 100; Juan confirma en la pregunta 15).
- La vista de cada perfil se define junto con Juan (sección 5.10).

Revisión con Juan (2026-10-31, segunda ronda):
- **Nota:** de 1.0 a 5.0 con decimales, también por criterio. **0 = no presentó**, recuperable con trabajos adicionales.
- **Declaración falsa de IA:** se anula la entrega y se abre una reposición con tope de nota (sustituye al "0 como advertencia").
- **Descriptores:** los 5 niveles llevan descriptor.
- **Nota en equipo:** individual; en trabajos en equipo es la misma para cada miembro. El radar individual puede variar (propuesta en la sección 5.4, se profundiza al desarrollar).
- **Radar:** se calcula en el servidor.
- **Observador:** monitores o la universidad; ve también el resumen general del grupo.
- **Alojamiento:** São Paulo.
- **Alcance:** se monta todo de una vez (sección 7).
- **Agnóstica al temario:** la app se reutilizará en todas las clases de Juan; el temario entra por configuración (F2, F3). Stack (Supabase en São Paulo, React, Vite, TypeScript) y costo cero estricto confirmados.
- **Diagnóstico de la semana 1:** un trabajo con rúbrica calificado a mano (la versión con preguntas corregidas en el servidor llega con el banco).
- **Resumen semanal por estudiante** con reporte y análisis (F20), dentro de la app y por correo.

## 10. Preguntas abiertas

> Cerradas el 2026-10-31: 1 (alcance: todo), 9 (se acepta São Paulo; falta lo que exija la universidad), 13 (Juan cree que se logra), 14 (monitores o universidad) y 15 (5 niveles con decimales y radar de 0 a 100).

1. **Alcance de la v1:** ¿es el de la sección 3.1 (F1 a F10)? Lo propuso Faro y Juan no lo confirmó.
2. **Costo:** ¿costo cero estricto, como en Faro, o se acepta pagar algo?
3. **Stack:** ¿Supabase, React y TypeScript, como en la sección 5.2?
4. **Regla para aprobar:** ¿un piso en las dimensiones de bases, solo las notas de los trabajos, o ambas?
5. **LMS:** ¿la universidad obliga a usar uno?
6. **Tamaño de los grupos:** define si las revisiones al azar alcanzan.
7. **Fecha de inicio** y **guía del curso**: la universidad las entrega.
8. **Contrato:** Juan dijo que el material es suyo; confirmar que el contrato firmado lo dice, también para el banco de ejercicios y el código de la app.
9. **Ley 1581 y alojamiento de datos:** ¿la universidad exige que los datos se alojen en Colombia o pide una autorización específica? Si sí, cambia el proveedor.
10. **Dimensiones definitivas** del radar y la matriz trabajo por dimensión (cada dimensión evaluada al menos dos veces).
11. **Qué desbloquea el XP:** ¿repetir un trabajo, elegir el tema del proyecto final, retos opcionales, insignias?
12. **Nombre del banco:** la app ya es `data-expedicion`; falta confirmar `data-expedicion-banco`.
13. **Tiempo:** ¿cuánto de la app es realista construir antes de la semana 3, con 30 a 36 horas semanales de preparación del curso?
14. **Observador:** ¿quién es (coordinación, otro docente, la universidad, un tutor)? ¿Qué necesita ver? ¿Sirve un mínimo de 5 personas por agregado?
15. **Escala:** ¿5 niveles por criterio y radar de 0 a 100, como en las secciones 3.1 y 5.4, o prefieres otra escala? Con 5 niveles hay que escribir más descriptores por rúbrica.
16. **Vistas:** ¿empezamos por la del estudiante en el celular?
17. **Resumen semanal (F20):** canal decidido: app y correo. **Se decide cuando se sepa el número de estudiantes.** Opciones vistas: script propio con SMTP (Gmail o cuenta institucional, enviando resumen corto con enlace a la app), proveedor transaccional gratuito, o servidor propio (descartado). Diseño provisional: puerto `EnviadorReportes` con adaptador SMTP y tarea semanal programada. Falta: el proveedor de envío (el de Supabase es muy limitado; uno externo saca datos del estudiante de la app y puede quedar fuera de Colombia), qué incluye el análisis y si lo revisas antes de enviarlo.
18. ~~**Alcance "todo":**~~ Cerrada: incluye la v2 (F18 y F19), según "montaremos todo de una vez".
