# Evaluación de data-expedicion — 2026-11-03

**Nota final: 6.5 / 10** · Perfil: web · Commit evaluado: `3076bee`

Base sólida de seguridad y dominio probado, con dos huecos que pesan: el CI de calidad nunca se ha ejecutado y no hay observabilidad. Primera corrida de `evaluar-app`, sirvió también para calibrar la herramienta.

## Resultado

| Rúbrica | Peso | Puntaje | Aporte |
|---|---|---|---|
| Funcionalidad | 25.0 % | 6/10 | 1.50 |
| Seguridad | 25.0 % | 7/10 | 1.75 |
| Calidad del código | 20.0 % | 7/10 | 1.40 |
| Arquitectura | 20.0 % | 7.5/10 | 1.50 |
| Observabilidad y alertamiento | 10.0 % | 3/10 | 0.30 |

**Nota final: 6.5 / 10**

## Fuente de la evidencia

- **CI**: existen `pages.yml` (despliegue) y `revision.yml` (typecheck, lint, pruebas con cobertura, build). Las últimas 10 ejecuciones son todas del despliegue (éxito). **`revision.yml` no tiene ninguna ejecución registrada**, porque corre solo en pull requests y en ramas distintas de `main`, y el trabajo va directo a `main`. Por eso no hay evidencia de CI para la calidad y se ejecutó en local (`--ejecutar`).
- **Local**: `npm run lint` (oxlint) pasa; `npm run build` pasa; `npm audit` sin críticas; `npm run test`: 1 prueba con timeout de 5 s en `pantallas-docente.test.tsx`, que al correr sola pasa (24/24 en 14.9 s).
- **No verificado**: no se abrió la app ni se recorrieron los flujos en el navegador; no se corrió `typecheck` ni la cobertura en local; no se revisó el contenido de cada política RLS, solo su existencia.

## Funcionalidad — 6/10
- El volumen de funciones es grande: 20 archivos de prueba, pantallas por rol (docente, estudiante, observador) y 17 migraciones.
- El build y las pruebas pasan, pero una prueba es inestable (timeout de 5 s al correr la suite completa, pasa aislada) y no se recorrieron los flujos con la app corriendo.
- Por la regla de la rúbrica, lo no verificado limita el puntaje a 6.

**Cómo mejorar**
1. Recorrer los flujos principales con la app corriendo (docente, estudiante, observador) y anotar fallos → permite pasar de 6 a 7.
2. Arreglar la prueba inestable `pantallas-docente.test.tsx` (esperar el elemento en vez de depender del tiempo, o subir el `testTimeout`) → la suite deja de fallar de forma intermitente.
3. Añadir pruebas de extremo a extremo (Playwright) del flujo de entrega y calificación → 8.
4. Cubrir estados vacíos, de carga y de error en cada pantalla, y una revisión de accesibilidad con teclado → 9.

## Seguridad — 7/10
- Sin secretos en el código ni `.env` rastreados; `.gitignore` cubre `.env`. `npm audit` sin vulnerabilidades críticas.
- RLS activado en las 30 tablas creadas (30 `create table`, 30 `enable row level security`), y existe una migración de endurecimiento (`0017`). Hay pruebas de aislamiento (`dominio/aislamiento.test.ts`) y de políticas en `supabase/pruebas`.
- Falta: auditoría de dependencias en CI, y revisar las políticas una por una. El trato de datos de estudiantes (Ley 1581) sigue como pregunta abierta del RFC.

**Cómo mejorar**
1. Añadir `npm audit --audit-level=high` a `revision.yml` y activar Dependabot → mantiene el 7 y evita regresiones.
2. Revisar cada política RLS contra los roles (estudiante solo ve lo suyo, observador solo agregados con mínimo de 5 personas) y probarlo en `supabase/pruebas` → 8.
3. Cerrar la pregunta de la Ley 1581 (dónde se alojan los datos y con qué base legal) y documentarlo → 9.
4. Añadir `gitleaks` al CI para detectar secretos antes de que lleguen a `main`.

## Calidad del código — 7/10
- `typecheck`, lint y cobertura con umbrales están definidos (dominio ≥ 90 % de líneas, servicios ≥ 80 %), un buen diseño. 92 % de commits convencionales, lockfile y README presentes.
- Se descuenta: `revision.yml` nunca se ha ejecutado, así que los umbrales no se hacen cumplir; una prueba inestable; sin formateador configurado; `web/src/estilos/pantallas.css` tiene 1571 líneas. 3 marcas TODO/FIXME.

**Cómo mejorar**
1. Hacer que `revision.yml` corra en `push` a `main` y que el despliegue dependa de él → los umbrales de cobertura pasan a hacerse cumplir (hallazgo 1), sube a 8.
2. Estabilizar la prueba con timeout (ver Funcionalidad).
3. Partir `estilos/pantallas.css` (1571 líneas) por pantalla o por componente.
4. Añadir un formateador (Prettier o `oxfmt`) y verificarlo en CI → 9.

## Arquitectura — 7.5/10
- Estructura clara: `dominio` (nota, radar, niveles, con pruebas), `servicios` (acceso a Supabase), `compartido`, `app`. Migraciones versionadas y modelo de datos coherente.
- El dominio es puro: `dominio/reglas.ts` solo menciona Supabase en un comentario, sin importarlo.
- Los servicios (14 archivos) importan Supabase directamente, sin puerto intermedio, aunque el RFC-010 propone arquitectura hexagonal; cambiar de proveedor tocaría casi todos. Es lo que impide un puntaje mayor.

**Cómo mejorar**
1. Definir una interfaz de repositorio por servicio y dejar Supabase como implementación en un adaptador; empezar por los de mayor uso (`cursos`, `trabajos`, `calificaciones`) → 8.5.
2. Hacer que las pruebas de servicios usen el adaptador simulado ya existente (`pruebas/supabaseSimulado.ts`) detrás de esa interfaz.
3. Documentar la decisión en un ADR corto (por qué hexagonal en una SPA y qué se aísla) → 9.

## Observabilidad y alertamiento — 3/10
- Sin logs estructurados, sin reporte de errores (la señal de «monitoreo de errores» del script era un falso positivo (`scrollbar` en el CSS y el lockfile); en el código no aparece), sin métricas ni endpoint de salud.
- Lo que sí hay: un registro de actividad en base de datos (`0007_registro_de_actividad.sql`, `app/registro.ts`) y el aviso de GitHub cuando falla el despliegue. No hay alertas con responsable.
- Se juzga con proporción: es un sitio estático en GitHub Pages con Supabase administrado, así que no se esperan métricas de servidor, pero sí reporte de errores del cliente.

**Cómo mejorar**
1. **Reporte de errores del cliente** (Sentry plan gratuito, o `window.onerror` y `unhandledrejection` hacia una tabla `errores_cliente` en Supabase) → 5. Hoy, si falla en el celular de un estudiante, nadie se entera.
2. **Alerta al canal de Slack** cuando falla el despliegue, `revision.yml` o llega un error nuevo → 6.
3. **Chequeo externo de disponibilidad** (UptimeRobot gratuito sobre la URL de Pages) y revisar de vez en cuando los logs de Supabase → 7.
4. Dar un responsable y un runbook de una página (qué mirar si la app no carga) → 8.
No hacen falta logs de servidor, métricas propias ni endpoint de salud: los administra Supabase.

## Hallazgos prioritarios

| # | Severidad | Hallazgo | Siguiente paso |
|---|---|---|---|
| 1 | Alta | `revision.yml` nunca se ha ejecutado: typecheck, cobertura y umbrales no se hacen cumplir sobre `main` | Hacer que `revision.yml` corra también en `push` a `main` (o trabajar con PR) y que `pages.yml` dependa de él |
| 2 | Media | Sin reporte de errores del cliente ni alertas | Añadir Sentry (plan gratuito) u otro, con aviso al canal de Slack |
| 3 | Media | Prueba inestable `pantallas-docente.test.tsx` (timeout 5 s) | Subir el timeout o arreglar la espera; verificar que no sea un bloqueo real |
| 4 | Media | Los servicios dependen de Supabase sin puerto intermedio | Definir una interfaz de repositorio por servicio, empezando por los de mayor uso |
| 5 | Baja | Sin auditoría de dependencias en CI | Añadir `npm audit --audit-level=high` a `revision.yml` |

## Limitaciones
- Todas las rúbricas aplican. No se ejecutó la app en el navegador, no se corrió `typecheck`/cobertura, y las políticas RLS no se leyeron en detalle: por eso Funcionalidad queda en 6 y Seguridad en 7.
- Esta evaluación mide la calidad de la app, no el cumplimiento de los 15 criterios del RFC-010.
