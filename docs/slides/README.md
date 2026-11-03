# Plantillas de slides

Slides en HTML con la marca de Data Expedition (colores, tipografías, jaguar y objetos de la app). Se presentan en el navegador, se versionan en el repo y se pueden exportar a PDF.

## Usar la plantilla

1. Copia `plantilla-sesion.html` con el nombre de la sesión (por ejemplo `s09-joins.html`) en esta misma carpeta.
2. Edita el texto. Cada `<section class="slide ...">` es una slide y lleva un comentario con el nombre de su layout.
3. Borra las que no uses y duplica las que necesites. El orden del archivo es el orden de la presentación.

## Controles

| Tecla | Acción |
|---|---|
| `→` `Espacio` `Enter` o clic | Siguiente |
| `←` `Retroceso` o clic en el cuarto izquierdo | Anterior |
| `F` | Pantalla completa |
| `J` | Mostrar u ocultar al jaguar en toda la presentación |
| `Inicio` / `Fin` | Primera / última |

Para exportar a PDF abre el archivo en Chrome y usa Imprimir → Guardar como PDF (una slide por página, 1920×1080, con fondos).

## Decks

- `plantilla-sesion.html`: todos los layouts con contenido de relleno.
- `s01-introduccion-ciencia-de-datos.html`: la sesión 1 (introducción, entorno y tarea diagnóstica), con el jaguar solo en portada y cierre.

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
