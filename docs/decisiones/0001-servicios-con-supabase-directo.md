# 0001 · Los servicios hablan con Supabase directamente

Fecha: 2026-11-03 · Estado: vigente

## Contexto

El RFC-010 propone una arquitectura hexagonal: el dominio no conoce la base y todo pasa por puertos. La app es una sola página sin servidor propio, y Supabase es a la vez base de datos, autenticación y reglas de seguridad (RLS).

## Decisión

- El **dominio** (`web/src/dominio/`) es puro: no importa nada de fuera, y una prueba lo comprueba.
- Las **pantallas** no hablan con Supabase: usan `web/src/servicios/`.
- Los **servicios** sí importan el cliente de Supabase directamente, sin una interfaz de repositorio por encima.
- Las pruebas de servicios usan un cliente falso de Supabase (`pruebas/supabaseSimulado.ts`) en vez de un puerto.

## Por qué

La seguridad vive en la base (RLS y funciones `security definer`), no en el cliente. Un puerto en el cliente no la aislaría de Supabase: cambiar de proveedor obligaría a reescribir las políticas, las funciones y la autenticación, no solo los servicios. Añadir interfaces ahora sería una capa más sin quitar ese acoplamiento.

## Consecuencias

- Cambiar de proveedor toca los 14 servicios. Es un costo conocido y aceptado.
- El límite sigue claro: todo acceso a datos está en `servicios/`.

## Cuándo revisarlo

Si hace falta un segundo proveedor, si una parte pasa a un servidor propio, o si las pruebas con el cliente falso se vuelven frágiles. Entonces se empieza por los servicios más usados (`cursos`, `trabajos`, `calificaciones`) con una interfaz y un adaptador.
