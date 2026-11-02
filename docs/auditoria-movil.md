# Auditoría del diseño móvil (2 nov 2026)

Alcance: 56 vistas (todas las pantallas de estudiante, docente y observador, más el menú abierto en tres roles), en modo `?demo`, con emulación de celular a 375×812 y 360×640. Se midió: objetivos táctiles menores de 40 px, texto menor de 12 px, scroll vertical, desbordes horizontales y alto del dock. Se revisaron capturas de unas 20 pantallas clave.

## Lo que está bien

- Cero desbordes horizontales (salvo el jaguar y el mapa del acceso, que se recortan a propósito).
- La acción principal está abajo, al alcance del pulgar.
- El menú abre como hoja inferior con filas grandes (unos 52 px).

## Prioridad 1: afecta a casi todas las pantallas

1. **Cabeceras demasiado grandes.** Título, subtítulo e ilustración ocupan 255–300 px de 812 (35–45 % a 640 px de alto). El contenido útil empieza bajo el pliegue. Caso grave: el relámpago (`e20`), donde la pregunta sale cortada y el botón Responder queda lejos. También en `d1`, `d3`, `d13`, `o1`.
2. **Dock fijo de 92 px** en 44 pantallas. Tapa el final del contenido (en `d1` la lista de alertas se corta justo encima) y consume el 11 % de la pantalla (14 % a 640 px). En varias pantallas el botón es solo "Volver al panel".
3. **Menú.** Una lista única de 10–11 filas sin los grupos (Curso, Clase, Ajustes) que sí existen en escritorio. En 812 px se ven 8 de 10 filas, y a 640 px solo 6, sin pista de que hay más. Para el docente, con tantos destinos, una barra inferior de 4–5 destinos más "Más" sería más cómoda.
4. **Objetivos táctiles pequeños.**
   - El enlace "← Inicio" de la cabecera mide 19 px de alto.
   - Los puntos de semana del inicio miden 16 px (6 por pantalla).
   - Las flechas del mapa miden 36 px.
   - Los chips del álbum miden 27 px.
   - Los segmentados miden 31 px.
   - Los chips de estudiantes en `d8` son 13 por pantalla.
   - Los enlaces "Privacidad" y "Condiciones" miden 15 px.
5. **Texto de 10–11 px** en kickers y etiquetas: de 3 a 20 elementos por pantalla (`d8` 20, `e19` 13, `e12` 12, `e2` 11).

## Prioridad 2

6. **Pantallas de docente con mucho scroll** (700–1400 px): `d5` 1242, `d7` 1189, `d13` 1142, `d6` 974. Son diseños de escritorio apretados, con filas de 3–4 datos y chips.
7. **Pantallas largas de estudiante** sin ayudas de navegación: `e22` calendario 2090 px, `e32` sonidos 1780, `e23` 1103.
8. **Teléfonos pequeños (360×640):** cada pantalla gana 150–250 px de scroll y el contenido útil queda aún más abajo.

## Sin verificar (requiere dispositivo real o más pruebas)

- Teclado abierto en formularios (acceso, entrega `e6`, personas `d13`): riesgo de que el dock tape los campos.
- Barra de direcciones de iOS (`100dvh`) y zonas seguras (notch, barra inferior).
- Gestos del mapa del inicio y estados al tocar.
- `e7` no pintó durante la medición a 375 px; revisar a mano.

## Orden de arreglo propuesto

- **Lote 1 (transversal):** cabecera compacta que se reduce al hacer scroll; dock de 64 px; espacio inferior para que el último elemento no quede tapado; áreas táctiles mínimas de 44 px; texto mínimo de 12 px.
- **Lote 2:** menú agrupado, con pista de que hay más filas, y barra inferior para el docente.
- **Lote 3:** pantallas de docente (listas en formato tarjeta y filtros plegables) y pantallas largas del estudiante.
- **Lote 4:** pruebas con teclado y en un celular real.

## Resultado de los arreglos (mismo día)

Medido de nuevo con el mismo script.

| | Antes | Después |
|---|---|---|
| Objetivos táctiles menores de 40 px (360×640, 47 pantallas) | 110 | 13 |
| Objetivos táctiles menores de 40 px (375×812) | 117 | 36 |
| Textos menores de 12 px (360×640) | 195 | 0 |
| Alto del dock | 92 px | 71 px |
| Scroll total (360×640) | 29 234 px | 26 445 px |

Hecho:

- **Lote 1.** Cabecera de 128 px (112 en pantallas bajas, sin subtítulo), dock de 71 px, objetivos táctiles de 44 px en botones, segmentados, flechas, "volver", ajustes de rúbrica, sonidos y cierre de práctica, y texto mínimo de 12 px.
- **Lote 2 (parcial).** El menú ahora agrupa las filas por sección (Explorar, Curso, Clase…), las filas son más compactas y un degradado al final avisa de que hay más. **No se hizo la barra inferior del docente:** choca con el botón de acción del dock y conviene probar primero el menú agrupado.
- **Lote 3 (parcial).** Las pestañas (segmentados) quedan fijas arriba al hacer scroll en las pantallas largas. **No se rediseñaron** las listas del docente (formato tarjeta, filtros plegables): es decisión de diseño pendiente.
- Las pantallas de escritorio siguen sin scroll vertical (revisadas 12 rutas a 1755×851 y 1317×640).

Sigue pendiente: lote 4 (teclado abierto, zonas seguras de iOS y prueba en un celular real), y los 13 objetivos que aún miden menos de 40 px (flechas del mapa y puntos de semana del inicio, chips del álbum en `e1`).
