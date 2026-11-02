# Prompts de marca: logo y letras

Dos piezas para la pantalla de acceso. Mientras no existan los archivos, la app muestra el título en texto; al dejarlos en la ruta indicada se activan solos.

Estilo común: ilustración vectorial plana, contornos gruesos y limpios, sombras de color sólidas (sin degradados fotográficos), paleta verde selva `#0a8057`, menta `#5eeab0`, amarillo `#ffd23f`, azul `#1f6bff` y verde profundo `#073b3a`. Mismo estilo que el jaguar y las islas.

## 1. Logo (emblema)

Destino: `web/public/marca/logo.webp`, cuadrado, fondo magenta `#ff00ff` plano para recortar (mismo flujo que las hojas de objetos).

```
Logo emblem for an educational data science adventure app called "data-expedicion". A round badge: a friendly cartoon jaguar head (yellow with black rosettes, blue bandana) in front of a compass rose, with a tiny floating island and a rising line chart behind it. Flat vector illustration, thick clean outlines, solid color shadows, no gradients, no text. Colors: jungle green #0a8057, mint #5eeab0, yellow #ffd23f, blue #1f6bff, deep green #073b3a. Centered, 1:1, on a flat solid magenta #ff00ff background, nothing else in the image.
```

## 2. Letras (lettering del nombre)

Destino: `web/public/marca/letras.webp`, proporción 4:1, fondo magenta plano.

```
Hand-lettered logotype reading exactly "data-expedicion" in lowercase, chunky rounded display letters like carved jungle adventure signage, bold yellow #ffd23f letters with thick deep green #073b3a outline and a solid offset shadow, the letter "x" in the shape of a small crossed-compass or treasure-map mark, one tiny leaf growing from the "d". Flat vector, no gradients, no extra words, no tagline. 4:1 wide, centered, on a flat solid magenta #ff00ff background.
```

Notas:

- El texto debe leerse "data-expedicion" sin tilde (es el nombre del repo y de la app).
- Si la IA deforma letras, pedir primero solo el emblema y rotular después con la tipografía de la app (Bricolage Grotesque, extrabold).
- Pasar cada imagen por `cortar_hoja.py` y guardarla como WebP.
