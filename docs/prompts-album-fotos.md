# Prompts para las fotos del álbum de la expedición

El álbum de **Practicar** tiene una página por gema. Cada sesión de 5 preguntas revela una foto de esa página. Son **6 fotos por página** y **8 páginas** (una por gema).

Se generan con una IA de imágenes, **una hoja por página**: una cuadrícula de 3 columnas × 2 filas, con las 6 escenas sobre fondo magenta para recortarlas después (igual que las hojas de islas, objetos y gemas).

## Cómo usarlos

1. Copia el **prompt base** y pega al final las **6 escenas** de la página que vas a generar.
2. Genera la hoja en formato **horizontal, 3:2**.
3. Si la IA mezcla las escenas, genera una sola escena y repite; lo importante es el estilo consistente.
4. Guarda cada hoja como `fotos-<gema>.png` y pásamela. Yo la recorto en 6 fotos y las dejo en `web/public/album/`.

## Prompt base

```
Sheet of 6 separate illustrations arranged in a clean grid of 3 columns by 2 rows, each illustration in the same square-ish frame size, with wide even spacing between them. The background of the whole sheet is flat pure magenta (#FF00FF), with no gradient, no shadow on the background and no texture, so it can be removed later.

Style: flat vector game illustration, soft rounded shapes, thick dark teal outline (#073B3A), simple cel shading with one highlight tone and one shadow tone, saturated and friendly colors, same look as a mobile adventure game. Every illustration is a self-contained little scene with its own ground, like a diorama, with no text, no letters, no numbers, no logos and no borders or frames.

Main character in every scene: the same cartoon jaguar explorer, standing upright, golden-yellow fur with dark rosette spots, cream muzzle and belly, large friendly dark eyes, round ears, wearing a blue bandana around the neck. Keep the same face, proportions and bandana in all six scenes.

The six scenes, left to right and top to bottom:
```

Después del bloque anterior, pega la lista de escenas de la página.

## Escenas por página

### 1. Datos · Esmeralda Semilla · Valle de los Datos (selva)

Ambientación: selva verde, cascada, palmeras, flores amarillas. Acento: verde esmeralda.

1. El jaguar planta una semilla en la tierra con una pequeña pala, junto a una palmera joven.
2. El jaguar mira una cascada a través de una lupa grande.
3. El jaguar ordena frutas de colores en tres cestas distintas.
4. El jaguar riega un brote que crece de un montón de hojas, con una regadera.
5. El jaguar con mochila cruza un puente colgante de lianas sobre un río.
6. El jaguar levanta un cesto lleno de frutas recién cosechadas, sonriendo.

### 2. Análisis · Topacio Faro · Costa de la Exploración (costa)

Ambientación: playa, faro rojo y blanco, mar turquesa. Acento: amarillo topacio.

1. El jaguar sube la escalera de un faro con una linterna en la mano.
2. El jaguar mira el horizonte con unos binoculares, sobre una roca en la playa.
3. El jaguar dibuja un gráfico de barras en la arena con un palo.
4. El jaguar ordena caracolas por tamaño en una fila sobre la arena.
5. El jaguar sigue un mapa del tesoro hacia una palmera.
6. El jaguar rema en una pequeña barca de madera, con el faro al fondo.

### 3. Producción · Ámbar Brasa · hoguera del campamento

Ambientación: campamento al atardecer, tonos cálidos naranja y ámbar. Acento: ámbar.

1. El jaguar enciende una hoguera con un trozo de madera.
2. El jaguar hace la mochila, metiendo un cuaderno y una brújula.
3. El jaguar ajusta una tuerca en un mecanismo de engranajes de madera.
4. El jaguar sella una caja de madera con cinta y una etiqueta lisa, sin texto.
5. El jaguar cuelga herramientas ordenadas en un tablero de madera.
6. El jaguar guarda frascos de miel ámbar en una estantería, orgulloso.

### 4. Dirección de IA · Ópalo Aurora · cielo de aurora

Ambientación: claro de bosque bajo una aurora de colores suaves, sin más personajes que un pequeño robot de madera con una sola luz azul. Acento: tonos iridiscentes de ópalo (celeste, rosa, lila).

1. El jaguar guía a un pequeño robot de madera con una brújula, señalando el camino.
2. El jaguar sostiene un mapa abierto mientras el robot señala una dirección distinta.
3. El jaguar corrige con una brocha una flecha de un letrero de madera, sin texto, que apuntaba al lado equivocado.
4. El jaguar y el robot cruzan juntos un puente pequeño de piedra.
5. El jaguar mira una aurora de colores con el robot sentado a su lado.
6. El jaguar elige entre dos caminos que se separan en el bosque, con el robot esperando.

### 5. Modelado · Zafiro del Oasis · Desierto del Modelado (desierto)

Ambientación: dunas, cactus, palmera y un oasis azul. Acento: azul zafiro.

1. El jaguar dibuja una línea recta en la arena con un palo, uniendo varias piedras.
2. El jaguar llena una cantimplora en el oasis.
3. El jaguar apila bloques de arenisca para formar una torre escalonada.
4. El jaguar prueba una balanza de madera con piedras de distinto tamaño.
5. El jaguar sigue huellas en la arena hacia una duna lejana.
6. El jaguar clava una bandera pequeña en la cima de una duna, con el oasis abajo.

### 6. Validación · Peridoto Centinela · Ruinas de la Validación (ruinas)

Ambientación: ruinas de piedra cubiertas de musgo, columnas, una puerta antigua. Acento: verde oliva peridoto.

1. El jaguar examina una columna antigua con una lupa.
2. El jaguar compara dos tablillas de piedra casi iguales, una al lado de otra.
3. El jaguar prueba la solidez de un puente de piedra golpeándolo con un martillo pequeño.
4. El jaguar pesa dos piedras idénticas en una balanza equilibrada.
5. El jaguar vigila la entrada de las ruinas con una linterna encendida.
6. El jaguar marca con una cuerda el contorno de un cuarto de las ruinas.

### 7. Comunicación · Aguamarina Eco · Glaciar de la Comunicación (glaciar)

Ambientación: glaciar azul claro, picos nevados, hielo brillante. Acento: aguamarina.

1. El jaguar grita hacia una montaña nevada; el eco se dibuja como ondas suaves, sin texto.
2. El jaguar talla un pequeño cartel de hielo, sin texto.
3. El jaguar envía una señal de humo desde un pico nevado.
4. El jaguar muestra un mapa a otro explorador pequeño y lejano, sin rostro definido.
5. El jaguar hace un muñeco de nieve con su mismo pañuelo azul.
6. El jaguar toca un cuerno de montaña sobre el glaciar, con ondas de sonido.

### 8. Proyecto final · Rubí del Volcán · El Volcán (volcán)

Ambientación: volcán con cráter, lava naranja, roca oscura. Acento: rojo rubí.

1. El jaguar mira un volcán humeante desde lejos, con el pecho inflado.
2. El jaguar sube un sendero rocoso con la mochila cargada.
3. El jaguar cruza un río de lava por un puente de piedra firme.
4. El jaguar clava su bandera en el borde del cráter.
5. El jaguar levanta un rubí grande que brilla, sobre una roca.
6. El jaguar celebra con los brazos arriba en la cima, con el sol saliendo detrás.

## Notas para la IA

- Si la IA añade texto o letras en alguna imagen, repite esa escena pidiendo: `no text, no letters, no writing of any kind`.
- Si la IA dibuja un marco o polaroid, pídele que no: `no frame, no border, no polaroid`. El marco lo pone la app.
- Si cambia el pelaje o el pañuelo entre escenas, ancla el estilo con una imagen de referencia del jaguar (`web/public/jaguar/guia.png`).
