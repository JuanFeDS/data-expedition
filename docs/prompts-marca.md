# Prompts de marca: logo y letras

Dos piezas para la pantalla de acceso. Mientras no existan los archivos, la app muestra el título en texto; al dejarlos en la ruta indicada se activan solos.

Estilo común: ilustración vectorial plana, contornos gruesos y limpios, sombras de color sólidas (sin degradados fotográficos), paleta verde selva `#0a8057`, menta `#5eeab0`, amarillo `#ffd23f`, azul `#1f6bff` y verde profundo `#073b3a`. Mismo estilo que el jaguar y las islas.

## 1. Logo (emblema)

Destino: `web/public/marca/logo.webp`, cuadrado, fondo magenta `#ff00ff` plano para recortar (mismo flujo que las hojas de objetos).

```
Logo emblem for an educational data science adventure app called "Data Expedition". A round badge: a friendly cartoon jaguar head (yellow with black rosettes, blue bandana) in front of a compass rose, with a tiny floating island and a rising line chart behind it. Flat vector illustration, thick clean outlines, solid color shadows, no gradients, no text. Colors: jungle green #0a8057, mint #5eeab0, yellow #ffd23f, blue #1f6bff, deep green #073b3a. Centered, 1:1, on a flat solid magenta #ff00ff background, nothing else in the image.
```

## 2. Letras (lettering del nombre)

Destino: `web/public/marca/letras.webp`, proporción 3:1, fondo magenta plano. La primera versión (plana, minúsculas) se descartó por simple; esta pide volumen, dos líneas y mayúsculas iniciales.

```
Epic 3D game-title logotype in two stacked lines: "Data" on the first line and "Expedition" on the second, each word starting with a capital letter. Chunky rounded adventure-game letters with a glossy golden-yellow face (#ffd23f to #ff9d1c gradient), a strong bevel and highlight, a thick deep jungle green #073b3a outline, and a heavy 3D extruded shadow in darker green. The letter "x" is a gleaming crossed pair of compass needles, a small leaf grows from the "d", thin jungle vines with tiny leaves wrap around a few letters, a few sparkles and soft mint #5eeab0 glow behind the text. Polished mobile-game title style, high contrast, readable at small size, no other words, no tagline. 3:1 wide, centered, on a flat solid magenta #ff00ff background with no magenta inside the letters.
```

Variante de una línea (si la anterior sale cargada): reemplazar "in two stacked lines..." por `on one line: "Data Expedition"`.

Notas:

- El nombre de la marca es "Data Expedition" (como el repo `data-expedition`), con mayúsculas iniciales y sin tilde.
- Si la IA deforma letras, pedir primero solo el emblema y rotular después con la tipografía de la app (Bricolage Grotesque, extrabold).
- Pasar cada imagen por `cortar_hoja.py` y guardarla como WebP.
