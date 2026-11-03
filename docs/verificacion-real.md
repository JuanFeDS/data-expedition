# Verificación con sesiones reales

Las pruebas unitarias y el modo demo no detectan dos cosas: políticas RLS que bloquean una consulta legítima y diferencias entre el simulador de Supabase y el real. Este recorrido las busca. Hazlo antes de abrir la app a estudiantes.

## Preparación

- La app corre contra Supabase real (`web/.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`), sin `?demo`.
- Tres cuentas distintas, cada una en una ventana de incógnito o un perfil de navegador propio:
  - **Docente** (dueño del curso).
  - **Estudiante A** y, si se puede, **Estudiante B** (para comprobar que no ven lo del otro).
  - **Observador**.
- El curso «Prueba» con los datos de ejemplo cargados (2 trabajos, 5 criterios, 2 formularios en borrador, 3 sesiones, 2 recursos, 8 preguntas, 7 dimensiones).
- Abre la consola del navegador (F12) y la pestaña Red: cualquier respuesta 401, 403 o 400 de `supabase.co` es un hallazgo, aunque la pantalla parezca bien.

## Cómo anotar

Por cada paso, marca ✅ o ❌. Si falla, anota: pantalla, rol, qué esperabas, qué pasó y el error de la consola. Un hallazgo bien anotado se arregla en minutos.

## 1. Acceso y roles

| # | Paso | Esperado |
|---|---|---|
| 1.1 | Docente entra con Google o enlace por correo | Llega a la lista de cursos |
| 1.2 | Docente invita a Estudiante A con un código de invitación | El código se genera |
| 1.3 | Estudiante A entra y usa el código | Queda matriculado y ve el campamento |
| 1.4 | Estudiante A intenta abrir `#/c/<curso>/d1` (panel docente) | No ve nada del docente |
| 1.5 | Observador entra y usa su código | Ve solo vistas agregadas |

## 2. Docente

| # | Pantalla | Paso | Esperado |
|---|---|---|---|
| 2.1 | Panel (d1) | Abrir | Cifras y alertas sin error en la consola |
| 2.2 | Trabajos / Rúbricas / Configuración | Editar un criterio y recargar | El cambio persiste |
| 2.3 | Calendario y Material | Crear una sesión y un recurso | Aparecen y los ve el estudiante |
| 2.4 | Formularios | Pasar un formulario de borrador a abierto | El estudiante lo ve |
| 2.5 | En clase | Abrir una relámpago | Salen el enlace y el QR; el contador de respuestas sube en vivo |
| 2.6 | Asistencia | Abrir asistencia | El código rota cada 20 segundos |
| 2.7 | Equipos | Hacer el sorteo de un trabajo | Los equipos se guardan y el estudiante ve el suyo |
| 2.8 | Entregas y Corrección | Abrir una entrega, calificar con la rúbrica | La nota coincide con el cálculo visible y queda guardada |
| 2.9 | Personas y Estudiantes | Abrir la ficha de A | Ve su radar, notas y actividad |
| 2.10 | Banco de preguntas | Añadir una pregunta | Entra en la práctica del estudiante |

## 3. Estudiante

| # | Pantalla | Paso | Esperado |
|---|---|---|---|
| 3.1 | Campamento | Entrar por primera vez | Solo está abierto el campamento; el jaguar lo explica |
| 3.2 | Desbloqueo | Visitar otra sección | Se abre y el jaguar la presenta una sola vez; al recargar sigue abierta |
| 3.3 | Diagnóstico | Hacerlo completo | Se guarda y el radar muestra el punto de partida |
| 3.4 | Relámpago | Responder desde el enlace/QR | Una sola respuesta por persona; resultado correcto |
| 3.5 | Votación | Votar y ver resultados | Se ve el recuento sin poder votar dos veces |
| 3.6 | Asistir | Registrar asistencia con el código | Funciona con el código vigente y falla con uno vencido |
| 3.7 | Entregas | Cargar una entrega por PR | Queda con la declaración de IA y se ve en la lista del docente |
| 3.8 | Notas | Ver la nota que puso el docente | Coincide con la corrección y se explica la regla |
| 3.9 | Practicar | Hacer una sesión de 5 preguntas | Suma 30 XP y la racha del día |
| 3.10 | Liga y Mi ruta/equipo | Abrir | Sin errores; solo datos de su grupo |

## 4. Privacidad y RLS

Lo más importante. Con Estudiante B (o A en otro curso):

| # | Paso | Esperado |
|---|---|---|
| 4.1 | Ver las notas, entregas y radar de A | No aparecen |
| 4.2 | Pedir por la API una entrega de A (consola Red, cambiando el id) | Respuesta vacía o 403 |
| 4.3 | Observador abre la vista de un grupo con menos de 5 personas | No muestra datos individuales |
| 4.4 | Anónimo (sin sesión) intenta leer cualquier tabla | Sin datos |

## 5. Móvil

Repite 3.1, 3.4, 3.9 y 3.10 en el celular (o a 390 px de ancho). Nada se desborda y los botones se pulsan con comodidad.

## Después

- Los ❌ se arreglan por orden: primero privacidad (sección 4), luego lo que bloquea un flujo, luego lo cosmético.
- Para que un hallazgo no vuelva, pídeme que lo convierta en prueba (unitaria o SQL en `supabase/pruebas/`).
