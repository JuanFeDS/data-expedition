# Operación: qué mirar si algo falla

Una página para quien esté de turno. La app es un sitio estático en GitHub Pages con Supabase administrado, así que casi todo se revisa en cuatro lugares.

## La app no carga

1. **¿Está caído el despliegue?** Pestaña Actions del repositorio: el último «Desplegar en GitHub Pages» debe estar en verde. Si falló, el sitio sigue con la versión anterior; abre el paso que falló (tipos, lint, pruebas, auditoría o build).
2. **¿Está caído Supabase?** Estado del proyecto en el panel de Supabase y `status.supabase.com`. Sin Supabase la pantalla de acceso carga pero nadie entra.
3. **¿Falta configuración?** Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` están en Settings → Secrets and variables → Actions → Variables. Sin ellas la app arranca en modo demo.

## Alguien dice que algo no funciona

Los errores del navegador de cada persona quedan en `errores_cliente` (solo los lee el docente). En el editor SQL de Supabase:

```sql
select mensaje, origen, count(*) as veces, max(creado_en) as ultimo, min(ruta) as ruta
from public.errores_cliente
where creado_en > now() - interval '1 day'
group by mensaje, origen
order by ultimo desc;
```

- `interfaz`: falló el dibujo de una pantalla (el usuario vio «Algo salió mal»).
- `ventana`: excepción sin atrapar. `promesa`: promesa rechazada sin atrapar.
- Un error que solo llega con una versión nueva de la app suele ser un problema del último despliegue: revisa el último commit y, si hace falta, vuelve a desplegar el anterior desde Actions.

Más contexto: los logs de la API y de la base en Supabase (Logs) y la tabla `eventos`, que guarda el uso y cada cambio de datos.

## Clase abierta a invitados (sin registro)

Para una clase en la que nadie tiene cuenta todavía.

**Antes (una sola vez)**
1. En Supabase: Authentication → Sign In / Providers → activa **Allow anonymous sign-ins**.
2. En Authentication → Rate Limits revisa el límite de **inicios de sesión anónimos por hora y por IP**. Si toda la clase entra por la misma red (el wifi de la universidad comparte una sola IP), el valor por defecto puede quedarse corto: súbelo por encima del tamaño del grupo.
3. Prepara los relámpagos de la competencia en **Formularios**: pregunta de opción, con la respuesta correcta marcada y un tiempo límite (por ejemplo 30 segundos).

**Durante la clase**
1. Abre **En clase** y pulsa **Abrir la clase**: aparecen un QR y un código de 5 caracteres. Proyéctalos.
2. Cada persona escanea el QR (o entra a la app, pulsa «Entra con un código») y escribe un apodo. Queda matriculada en el curso y cae en la pantalla de relámpagos.
3. Abre cada relámpago desde la misma pantalla. El marcador de la derecha se actualiza solo: 100 puntos por acierto y hasta 50 más por responder rápido.
4. Al terminar, **Cerrar clase**: el código deja de servir. Los invitados que ya entraron conservan su sesión en su navegador.

**Qué se guarda:** el apodo y las respuestas, sin correo. Los invitados cuentan como estudiantes en los resúmenes del curso, así que si luego quieres cifras solo de estudiantes registrados hay que filtrarlos (`perfiles.es_invitado`).

## Pendientes de configurar a mano

- Aviso al canal de Slack cuando falle el despliegue o `revision.yml` (integración de GitHub con Slack: `/github subscribe` con el filtro de workflows).
- Chequeo externo de disponibilidad sobre `https://juanfeds.com/data-expedition/` (UptimeRobot gratuito) con aviso por correo.
- Responsable del turno: ____________.
