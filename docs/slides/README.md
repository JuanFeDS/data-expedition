# Plantillas de slides

Slides en HTML con la marca de Data Expedition (colores, tipografías, jaguar y objetos de la app). Se presentan en el navegador, se versionan en el repo y se pueden exportar a PDF.

## Usar la plantilla

1. Copia `plantilla-sesion.html` con el nombre de la sesión (por ejemplo `s09-joins.html`) en esta misma carpeta.
2. Edita el texto. Cada `<section class="slide ...">` es una slide y lleva un comentario con el nombre de su layout.
3. Borra las que no uses y duplica las que necesites. El orden del archivo es el orden de la presentación.

## Controles

| Tecla | Acción |
|---|---|
| `→` `Espacio` `Enter` o clic | Revela el siguiente elemento; cuando ya salió todo, pasa a la slide siguiente |
| `←` `Retroceso` o clic en el cuarto izquierdo | Oculta el último elemento; si no hay, vuelve a la slide anterior |
| `Shift` + `→` / `←` | Salta de slide sin revelar ni ocultar elementos |
| `S` | Activa o desactiva los pasos (desactivados, todo sale de una vez) |
| `F` | Pantalla completa |
| `J` | Mostrar u ocultar al jaguar en toda la presentación |
| `Inicio` / `Fin` | Primera / última |

Para exportar a PDF abre el archivo en Chrome y usa Imprimir → Guardar como PDF (una slide por página, 1920×1080, con fondos).

## Pasos con las flechas

Cada slide se explica poco a poco: la flecha derecha va mostrando, en orden, cada punto de una lista, cada fila, banda, barra, peldaño, opción de relámpago o paso del ciclo. Unos puntos abajo al centro indican cuántos pasos tiene la slide y cuántos van.

- Los elementos salen solos en orden del documento. Para agruparlos o ordenarlos a mano, pon `data-paso="1"`, `"2"`… (varios elementos con el mismo número salen juntos; sirve también para partes de un SVG).
- `data-solo="n"` muestra un elemento solo mientras va el paso `n` (el `0` es antes del primero) y lo reemplaza al siguiente: sirve para un texto que cambia por paso, como la definición de cada dimensión del radar.
- Para que algo esté visible desde el inicio, añade la clase `sin-paso`.
- Al imprimir a PDF salen todos los elementos.

## Decks

- `plantilla-sesion.html`: todos los layouts con contenido de relleno.
- `s01-introduccion-ciencia-de-datos.html`: la sesión 1 completa (70 slides, 180 min): bienvenida, introducción, entorno, guía de PR y cierre, con pausas y actividades con reloj y el jaguar solo en portada y despedida.

## Layouts incluidos

Ciclo de pasos conectados · lista de verificación · portada · hoja de ruta · objetivo · concepto con jaguar · número grande · comparación en dos columnas · gráfico de barras · línea y dona · columnas · tres bloques · código con resultado · relámpago con QR y cuenta atrás · actividad en equipos con reloj · pulso · cierre · tarea y recursos.

Fondos disponibles (clase en `<section>`): `slide--selva`, `slide--densa`, `slide--verde`, `slide--menta`, `slide--amarilla`, `slide--campamento`; sin clase queda el fondo claro.

## Animaciones

Todas parten solas al llegar a la slide y se apagan si el sistema pide menos movimiento.

- Entrada escalonada de títulos, listas, bloques y opciones; el jaguar y los objetos entran y flotan.
- **Gráficos:** las barras crecen, la línea se dibuja punto a punto y la dona se llena.
- **Números:** `<b data-contar="54">54</b>` cuenta de 0 al valor (añade `data-sufijo="%"` si lo necesita).
- **Relojes:** `<div data-segundos="900">` hace cuenta atrás (el anillo del relámpago lleva `--dur` con la misma duración).
- El código se escribe línea a línea y el resultado aparece después.

## Gráficos nuevos

- Barras horizontales: copia una fila `.hbar` y cambia `--w` (ancho en %) y el número.
- Columnas: copia una `.columna` y cambia `--h` (alto en %) y la etiqueta.
- Línea: edita los `points` del `<polyline>` y posiciona los círculos `.punto` en los mismos puntos.
- Dona: `--p` es el porcentaje (0–100).

## QR de la relámpago

El QR real lo genera la pantalla **En clase** de la app. Pega aquí una captura o reemplaza el bloque `.qr` por una imagen.

## Layouts sin tarjetas

Para slides de concepto hay layouts que evitan la tarjeta blanca con texto:

- **Filas** (`.filas` con `.fila-g`): un objeto de la marca o un número grande, título y texto, separados por una línea.
- **Bandas a sangre** (`.bandas` con `.banda--verde|deep|acento|menta|claro`): paneles de color de lado a lado con un gráfico animado (`.glifo`) o una palabra gigante (`.gigante`).
- **Partido con visual** (`.split`): texto a un lado y un SVG animado al otro (radar, Venn, círculos anidados, diagrama de ramas).
- **Escalera** (`.escalera` con `.peldano`): peldaños que crecen para ideas que escalan.
- **Cita** (`.cita`, `.pregunta-g`): frase enorme con marcador, para una sola idea.

Las clases `a-pop`, `a-sube`, `a-crece-y`, `a-crece-x`, `a-corre` y `a-dibuja` animan elementos de un SVG o de una slide; `--i` define el orden de aparición.
