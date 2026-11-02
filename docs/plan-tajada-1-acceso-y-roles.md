# Plan de la tajada 1: acceso y roles

Borrador del 2026-11-01. Es la primera parte **funcional** de la app: pasar del prototipo con datos de ejemplo a una app donde alguien entra con su correo, la base de datos sabe quién es y qué rol tiene, y cada rol ve solo lo suyo. Todo lo demás (entrega por PR, diagnóstico, radar real) se apoya en esto.

Insumos: [RFC-010](RFC-010-app-expedicion.md) (F1, 5.2, 5.3), la migración `supabase/migrations/0001_modelo_inicial.sql` y el [plan de acción de pantallas](plan-de-accion-pantallas.md).

## 1. Qué incluye

- Entrar con el correo institucional por **enlace mágico**, sin contraseña.
- Un perfil por persona con su rol (estudiante, docente u observador), guardado en la base de datos y no en el navegador.
- Cada rol cae en su pantalla de inicio y no puede abrir las de otro rol.
- Cerrar sesión, y ver y cambiar el propio nombre.
- Que el docente asigne roles y matricule a las personas en una edición del curso.
- Pruebas de que las políticas de acceso por fila funcionan de verdad.
- Despliegue en GitHub Pages con las variables de entorno.

**No incluye:** entrega por PR, diagnóstico, radar con datos reales, formularios ni correos del resumen semanal. Los datos de las pantallas siguen siendo de ejemplo hasta sus tajadas.

## 2. Lo que ya existe

| Pieza | Estado |
|---|---|
| Migración con tablas, `rol_actual()`, `es_docente()`, trigger que crea el perfil al registrarse y políticas por fila | Escrita, **nunca aplicada** a ningún proyecto |
| `asignar_rol()` (solo el docente) y funciones del observador con mínimo de personas | Escritas, sin probar contra una base real |
| Dominio hexagonal (`src/`) con nota, niveles y radar, y 30 pruebas | Hecho, sin adaptador de Supabase |
| Pantallas de acceso, perfil y tres roles con navegación | Hechas con datos de ejemplo |
| Proyecto de Supabase para esta app | **No hay.** Los 4 proyectos de la cuenta son de otras apps (3 inactivos y `nailong`, activo) |

## 3. Hallazgos que cambian el plan

1. **El enlace mágico choca con el router por `#`.** Supabase devuelve la sesión en el fragmento de la dirección (`#access_token=…`), y la app usa ese mismo fragmento para sus rutas (`#/home`). Se pisarían. Solución: usar el flujo **PKCE**, que devuelve un `?code=` en la consulta, y cambiar de ruta después de canjearlo.
2. **El correo integrado de Supabase no alcanza.** El plan gratuito limita los envíos a unos pocos por hora y por proyecto, y 36 estudiantes pidiendo su enlace a la vez los agotan. Hace falta un **servidor de correo propio (SMTP)** antes de la primera clase. Está pendiente la pregunta 17 del RFC (proveedor y revisión del docente).
3. **Nadie puede ser el primer docente.** El trigger crea a todos como estudiantes, y `asignar_rol()` exige ser docente. Hay que **promover una vez, a mano con SQL**, el correo de Juan. Y no va dentro de la migración, para no dejar un correo fijo en el repositorio.
4. **Cualquiera con un correo podría registrarse.** Hay que limitar el acceso a los correos de la universidad, o a una lista de matriculados, y decidir cuál de las dos.
5. **Pausa por inactividad.** El plan gratuito pausa los proyectos inactivos; el RFC ya lo anticipa y propone una consulta periódica durante los recesos.

## 4. Decisiones que necesito de ti

| # | Decisión | Mi recomendación |
|---|---|---|
| 1 | **Crear el proyecto de Supabase** (gratuito, región São Paulo, como dice el RFC). Crearlo es una acción de tu cuenta y puede tener costo | Aprobarlo y crearlo yo, con el nombre `data-expedicion` |
| 2 | **Quién puede entrar**: dominio de correo de la universidad, o lista de matriculados | Lista de matriculados que carga el docente: es más estricta y sirve para los grupos |
| 3 | **Servidor de correo (SMTP)** | Una cuenta de envío gratuita (por ejemplo Resend o un SMTP institucional) antes de la S1; mientras tanto, el correo integrado solo para pruebas con pocas personas |
| 4 | **Tu correo de docente** para la promoción inicial | Lo escribes tú en el SQL, no se guarda en el repositorio |
| 5 | **Demo pública**: mantener el prototipo con datos de ejemplo en juanfeds.com | Sí, detrás de `?demo`, para seguir enseñándolo sin cuenta |

## 5. Pasos, en orden

Cada paso termina con un criterio de "hecho" que se comprueba, no que se supone.

| # | Paso | Hecho cuando | Tamaño |
|---|---|---|---|
| 0 | **Proyecto de Supabase** creado (decisión 1) y sus claves guardadas en `web/.env.local` (no se sube). Solo la clave pública va al repositorio, nunca la de servicio | `.env.example` documenta las variables y el proyecto responde | S |
| 1 | **Aplicar la migración y el seed**; correr los avisos de seguridad de Supabase | Las 10 tablas existen y los avisos no marcan tablas sin RLS | S |
| 2 | **Pruebas de las políticas** con tres usuarios de prueba (estudiante, docente, observador) | Un estudiante no lee a otro; no puede cambiar su rol; el observador solo llama a las funciones agregadas; el docente lee todo | M |
| 3 | **Promoción del primer docente** con una sentencia SQL única (decisión 4) | Tu correo entra con rol `docente` | S |
| 4 | **Cliente en la web**: `@supabase/supabase-js` con flujo PKCE, un contexto de sesión (`persona`, `rol`, `cargando`) y la dirección de redirección con la base `/data-expedition/` | Entrar y recargar mantiene la sesión; el router por `#` sigue funcionando | M |
| 5 | **Pantalla de acceso real** (`e0`): correo, envío, "revisa tu correo" con reenvío tras 60 s, enlace vencido y correo no permitido | Un correo real recibe el enlace y entra | M |
| 6 | **Guardas por rol**: inicio según rol (`#/home`, `#/d1` o `#/o1`) y bloqueo con la pantalla de otro rol (`e26`) | Un estudiante que escribe `#/d1` no ve el panel del docente | M |
| 7 | **Perfil y cierre de sesión** con datos reales: nombre editable, correo y salir | Cambiar el nombre persiste y salir limpia la sesión | S |
| 8 | **Personas y matrícula** para el docente (pantalla nueva `d13`): lista de perfiles, cambiar rol y matricular en un grupo; carga de la lista de matriculados | El docente asigna a alguien como observador y esa persona ve su vista | M |
| 9 | **Despliegue**: variables en GitHub Actions, direcciones permitidas en Supabase Auth, y el modo `?demo` | La versión publicada deja entrar con un enlace real y la demo sigue accesible | S |
| 10 | **Cierre**: pruebas del dominio y del adaptador, lista de pruebas manuales por rol, y documentación | `npm run check` pasa y la lista se recorre sin fallos | S |

Tamaños: S = media jornada, M = una jornada.

## 6. Cómo encaja en la arquitectura

- **`src/puertos`** define lo que el resto necesita: `RepositorioPersonas` (leer el perfil propio, cambiar el nombre, listar y cambiar roles).
- **`src/adaptadores/supabase`** lo implementa con el cliente de Supabase. El dominio no se entera.
- **`web/`** solo consume el contexto de sesión; no contiene reglas de negocio. La regla de dependencias del lint se mantiene.
- El **rol** nunca se lee de lo que el usuario puede editar: siempre de `perfiles`, a través de `rol_actual()`.

## 7. Riesgos y qué hacer si ocurren

| Riesgo | Plan |
|---|---|
| El correo no llega o se limita | SMTP propio (decisión 3) y un código de un solo uso como respaldo |
| La migración falla al aplicarse | Se corrige en un archivo nuevo (`0002`), sin editar el ya aplicado |
| Una política deja ver datos de más | Las pruebas del paso 2 son obligatorias antes de cargar a una sola persona real |
| El proyecto se pausa en un receso | Consulta periódica programada, ya prevista en el RFC |
| La sesión no sobrevive a la redirección | Canjear el `?code=` antes de leer la ruta y limpiar la dirección después |

## 8. Qué se hace sin tu aprobación y qué no

- **Sin preguntar:** escribir el código, las pruebas y la documentación en el repositorio.
- **Con tu aprobación explícita:** crear el proyecto de Supabase, aplicar la migración, crear usuarios de prueba, promover el docente, configurar el SMTP y hacer cualquier push.

## 9. Estado de ejecución (2026-11-02)

| Paso | Estado |
|---|---|
| 0. Proyecto de Supabase | **Hecho.** `data-expedition`, referencia `ltbhlckxeeqonmphvaxm`, organización "The Scientist", región São Paulo, 0 USD al mes. Claves públicas en `web/.env.local` (ignorado por Git) y `web/.env.example` |
| 1. Migración y avisos | **Hecho.** Se aplicó `0001_modelo_inicial` sin errores: 10 tablas, todas con RLS. Seed aplicado: edición plantilla con 7 dimensiones |
| 2. Pruebas de las políticas | **Hecho.** 20 de 20 pruebas pasan (estudiante, anónimo, docente y observador), más la comprobación de que el observador solo recibe agregados. Los usuarios de prueba se borraron. El script está en `supabase/pruebas/politicas_acceso.sql` y se repite después de cada cambio de políticas |
| 3. Primer docente | **Decidido: opción 1.** Se promueve el correo de Juan con SQL justo después de su primer ingreso (aún no hay ningún usuario real) |
| 4. Cliente de Supabase | **Hecho.** `@supabase/supabase-js` con PKCE, contexto de sesión (`componentes/sesion.tsx`) y cliente (`servicios/supabase.ts`). Sin variables de entorno, o con `?demo` en la dirección, la web funciona como antes (modo demo) |
| 5. Pantalla de acceso real | **Hecha** (`e0`): validación del correo, enviando, "revisa tu correo" con reenvío tras 60 s, enlace vencido y errores traducidos. **El envío real del correo no se ha probado**: depende de la configuración de Auth y del correo (ver abajo) |
| 6. Guardas por rol | **Hecho y probado** con usuarios de prueba (ya borrados): sin sesión todo cae en el acceso; cada rol entra a su inicio; las pantallas de otro rol muestran un aviso; `#/e0` y la galería redirigen al inicio |
| 7. Perfil y cerrar sesión | **Parcial.** "Cerrar sesión" en la barra lateral y en el menú móvil, y el nombre y el correo reales en la tarjeta de usuario. Falta editar el nombre |
| 7b. Ronda de feedback (2 nov) | **Hecho en código, sin publicar:** se quitó el modo oscuro (letras casi negras), la tarjeta de usuario muestra nombre y `@usuario` con puntos suspensivos, el observador tiene tono rojo (docente azul), y el acceso tiene franja de islas, pasos y huecos para logo y letras (`docs/prompts-marca.md`). El primer ingreso pide nombre y usuario (`CompletarPerfil`). **Requiere aplicar `0002_usuario_en_perfiles.sql` antes de publicar**: sin la columna `usuario` el perfil no carga y nadie puede entrar |
| 7c. Google y lista de invitados (2 nov) | **Hecho y probado en el sitio publicado.** Botón «Continuar con Google» (cliente OAuth web, app publicada en Google Cloud), migraciones `0002` (usuario único) y `0003` (`correos_autorizados` + trigger que bloquea registros no autorizados, el rol de la fila es el que recibe la persona). Páginas públicas de privacidad y condiciones para la pantalla de consentimiento. Probado: login de docente con Google. **Falta probar** el primer ingreso de un estudiante nuevo y el mensaje de correo no autorizado. **Falta** una pantalla para cargar correos (paso 8) |
| 8. Personas y matrícula (2 nov) | **Hecho, falta probarlo con uso real.** Pantalla `d13` (Ajustes → Personas): crear la edición, invitar correos con rol y grupo, cambiar rol y grupo, crear grupos, quitar invitaciones. Migración `0004` (edición y grupo en la invitación, matrícula automática al registrarse). Pruebas de políticas ampliadas a 28 (todas en verde, más la comprobación de que un correo no invitado no se registra). Con `?demo` funciona con datos de ejemplo |
| 8 a 10 | Pendientes (personas y matrícula, despliegue con variables, cierre) |

**Lo que no puede hacer Claude y debes hacer tú en el panel de Supabase** (Authentication):
1. *URL Configuration:* Site URL `https://juanfeds.com/data-expedition/` y en Redirect URLs agregar `https://juanfeds.com/data-expedition/` y `http://localhost:5173/`.
2. *Emails / SMTP:* el correo integrado es muy limitado; configura un SMTP propio antes de la primera clase. Para probar tu propio ingreso puede bastar el integrado.
3. *Variables del repositorio en GitHub* (Settings > Secrets and variables > Actions > Variables): `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`, con los valores de `web/.env.local`. Hasta que existan, la versión publicada sigue en modo demo.

**Avisos de seguridad de Supabase tras la migración:** ninguna tabla sin RLS. Quedan 8 avisos de nivel "advertencia" por funciones `security definer` que el rol `authenticated` puede ejecutar. Son intencionales: `rol_actual`, `es_docente` y `en_edicion` los usan las políticas; `asignar_rol` y las dos funciones de resumen se validan por dentro. Un detalle menor: `edicion_de_trabajo` y `propietario_de_entrega` también quedan llamables por API y revelarían un identificador a quien ya conociera otro, así que se pueden mover a un esquema privado en la migración `0002`.

**Avisos de rendimiento (no urgentes):** 8 claves foráneas sin índice y 10 tablas con dos políticas permisivas (la de lectura y la del docente). Con unas decenas de estudiantes no se nota. Se pueden agregar los índices y unificar las políticas en `0002`.

## Tajada 2: trabajos y entregas (2 nov)

- **Capa de datos agnóstica a la conexión:** `servicios/trabajos.ts` define la interfaz (`ServicioTrabajos`) con dos implementaciones, Supabase y demo (`trabajosDemo.ts`). Las pantallas usan el hook `useServicioTrabajos()` y no saben de dónde vienen los datos. Lo mismo ya aplica a Personas (`servicios/personas.ts`).
- **Migración `0005`:** `trabajos` gana `tema`, `vence_en` y `min_pylint`; `entregas` gana `enlace_pr` (con formato de PR validado).
- **Docente:** `d14` (Ajustes → Trabajos) crea y quita trabajos de la edición; `d3` muestra las entregas reales por trabajo y quién falta.
- **Estudiante:** `e5` lista sus trabajos y entregas; `e6` guarda la entrega (enlace del PR, declaración de IA y bitácora). La verificación contra GitHub aún no existe: en modo real solo se valida el formato y el docente revisa.
- **Modo real:** las pantallas no conectadas muestran «Esta sección aún no está conectada». Los inicios reales son `e5` (estudiante), `d13` (docente) y `o1` (observador).
- Un estudiante solo ve los trabajos si está **matriculado** (se asigna un grupo en Personas); las reglas de acceso se probaron en la base (un no matriculado ve 0 trabajos y no puede entregar).
- **Siguiente:** calificar con rúbrica (`d4`) y ver la nota (`e3`/`e4`), el radar, y las pantallas de inicio.

## Modelo por cursos (2 nov)

- **Curso = una cohorte** (la tabla `ediciones`, que en la app se llama «curso»). El **rol sigue siendo global**; si luego hace falta ser docente en un curso y estudiante en otro, el rol pasa a la matrícula.
- **Migración `0006`:** tabla `invitaciones` (correo, curso, grupo, rol). Una persona puede estar invitada a varios cursos. `correos_autorizados` queda solo para cuentas sin curso (por ejemplo el docente). El registro se autoriza si el correo está en cualquiera de las dos, y al registrarse la persona queda matriculada en todos sus cursos.
- **Selector de curso** en la barra lateral y en el menú móvil (`componentes/curso.tsx`); Personas, Trabajos y Entregas leen el curso activo.
- **Estudiante u observador sin curso:** ve una sola pantalla de bienvenida («Casi listo…»), sin menú ni pestañas, con «Ya me invitaron, actualizar» y «Cerrar sesión». También está en la galería como `e33`.
- Pruebas de políticas: 30 en verde, más la comprobación de que un correo no autorizado no se registra.

## El curso va en la dirección (2 nov)

- Ya no existe un «curso activo» global ni un selector fijo. Las pantallas de curso se abren con el curso en la dirección: `#/c/<curso>/<pantalla>` (información, entregas, personas, trabajos).
- Fuera de un curso (Inicio, Cursos, perfil) la barra lateral solo muestra lo general. Dentro de un curso, un bloque con el nombre del curso agrupa sus secciones.
- Los enlaces antiguos sin curso (`#/e5`, `#/d13`…) se redirigen al último curso usado, o a Cursos si no hay ninguno. Un curso que no existe o al que no perteneces también lleva a Cursos.
- El modelo de datos no cambió: las matrículas siguen decidiendo qué cursos ve cada persona.

## Escala tipográfica única (2 nov)

- Una sola escala con 8 tamaños (`--fs-xs` 12, `--fs-sm` 13, `--fs-md` 14, `--fs-lg` 16, `--fs-xl` 20, `--fs-2xl` 24, `--fs-3xl` 32, `--fs-4xl` 44) y dos fuentes (Bricolage Grotesque para títulos, Manrope para texto). Antes había 38 tamaños distintos. Quedan como excepción 4 cifras decorativas grandes (76 a 120 px).
- Se quitó el zoom automático de escritorio: cada pantalla se reducía por separado entre 100 % y 60 % para evitar el scroll, y por eso el mismo texto se veía de tamaños distintos según la página. Ahora todas usan el mismo tamaño y hay scroll vertical solo cuando el contenido no cabe.
- Regla para lo nuevo: usar siempre `var(--fs-…)`, nunca un número de píxeles suelto.

## Sin grupos de curso; confirmaciones diseñadas (2 nov)

- Los grupos ya no son una división fija del curso: la interfaz dejó de mostrarlos (invitaciones, Personas, CSV, detalle del curso, home y entregas). Las tablas `grupos` y `matriculas.grupo_id` siguen en la base sin uso. **Pendiente de diseño:** equipos o parejas **por trabajo**, para las entregas por equipo y la revisión en parejas (¿los arma el docente, se sortean o los forman los estudiantes?).
- Las confirmaciones usan un cuadro propio (`componentes/confirmar.tsx`, con `useConfirmar()`), no el `confirm` del navegador. Se usa para cerrar sesión, quitar a alguien de un curso y eliminar un curso.
