# Arquitectura de Data Expedition

Guía corta para quien vaya a tocar el código. Describe cómo está organizada la app, las reglas que se siguen y cómo comprobar que algo no se rompió.

## Visión general

- **Frontend:** React 19 + TypeScript 7 + Vite 8, en `web/`. Sin router externo: la ruta vive en el fragmento de la URL (`#/c/<curso>/<pantalla>?param=valor`).
- **Backend:** Supabase (Postgres, Auth, RLS). Toda la lógica que protege datos vive en la base, no en la interfaz.
- **Despliegue:** GitHub Pages (`.github/workflows/pages.yml`). Las revisiones de rama corren `revision.yml`.

```
web/src
├─ main.tsx            arranque, enrutado por fragmento, proveedores globales
├─ config.ts           reglas de negocio ajustables (XP, umbrales, tiempos)
├─ registro.ts         catálogo de pantallas (cada una se descarga al abrirla)
├─ componentes/        piezas compartidas: navegación, sesión, curso, desbloqueos, tutorial, UI
├─ pantallas/          una pantalla por archivo (X.tsx = envoltorio, XReal.tsx = versión con datos)
├─ servicios/          acceso a datos y lógica pura (sin JSX)
└─ datos.ts, datosPlan.ts   datos ficticios del modo demo
supabase/
├─ migrations/         esquema numerado y aplicado en orden (0001…)
└─ pruebas/            pruebas SQL de políticas y funciones
```

## Capas y reglas

1. **Las pantallas no hablan con Supabase.** Usan funciones de `servicios/`. Un servicio devuelve datos ya tipados y mapeados (de `snake_case` de la base a `camelCase`).
2. **Servicios con dos implementaciones** (personas, trabajos, cursos, rúbricas): una real y otra en memoria para el modo demo, elegidas por un hook `useServicio…()`. Los servicios nuevos son solo reales; su pantalla demo usa datos ficticios.
3. **Pantalla con demo y real.** `conModoDemo(XEjemplo, XReal)` elige según `?demo`. La versión demo solo sirve de referencia visual.
4. **Seguridad en la base.** Cada tabla tiene RLS. Lo que no se puede expresar como política (calificar, responder, abrir asistencia, agregados para observadores) es una función `security definer` con `search_path = ''`, revocada para `anon` y verificando el rol dentro.
5. **Privacidad.** En formularios anónimos las respuestas no llevan perfil ni hora que las una con quien las dio. Observadores solo reciben agregados con mínimo de 5 personas (lo impone la base).
6. **Una regla de negocio, un lugar.** Lo ajustable está en `config.ts`; si también existe en SQL, el archivo lo dice.
7. **Estilos.** Variables y escala tipográfica en `estilos.css` (`--fs-*`), nada de tamaños sueltos; `pantallas.css` para pantallas; `escritorio.css` para ≥ 1100 px. Los controles usan componentes propios (`Selector`, `Segmentado`, confirmaciones), no los nativos.
8. **Movimiento.** Toda animación va dentro de `prefers-reduced-motion: no-preference`.

## Navegación y desbloqueo

- `componentes/navegacion.ts` define el panel: en modo real se agrupa por trabajo (`GRUPOS_CURSO`) y las secciones aún no abiertas pasan a «Descubrir».
- Cada persona desbloquea una sección al entrar a ella; el jaguar la explica la primera vez (`GuiaDesbloqueo.tsx`). Estado en `localStorage` y en `progreso_usuario`.
- `servicios/ruta.ts` fija el orden recomendado por rol. La prueba `estructura.test.ts` exige que toda sección de la ruta esté en el panel, tenga mensaje del jaguar y esté registrada.

## Cómo agregar una pantalla

1. Crea `pantallas/Xyz.tsx` (y `XyzReal.tsx` si tiene datos).
2. Regístrala en `registro.ts` y, si es de curso, añade el código a `ENCURSO` y `CONECTADAS` en `navegacion.ts`.
3. Si va en el panel: añádela a `GRUPOS_CURSO`, a la ruta de su rol en `servicios/ruta.ts` y escribe su mensaje en `GuiaDesbloqueo.tsx`.
4. Corre `npm run check`; las pruebas de estructura te dicen qué falta.

## Cómo agregar algo a la base

1. Nueva migración `supabase/migrations/00NN_descripcion.sql` (nunca edites una ya aplicada).
2. RLS activada y funciones revocadas para `anon`.
3. Agrega su bloque a `supabase/pruebas/funciones_y_politicas.sql` y córrelo (cada bloque termina en `OK …` o `FALLO …`).
4. Aplica la migración solo con aprobación explícita.

## Comprobaciones

| Comando | Qué revisa |
|---|---|
| `npm run typecheck` | Tipos estrictos, variables y parámetros sin uso |
| `npm run lint` | Errores probables (oxlint) |
| `npm test` | Lógica pura y consistencia de navegación/registro (Vitest) |
| `npm run check` | Los tres anteriores |
| `npm run build` | `check` + empaquetado |

## Deuda conocida

- Las pruebas de interfaz con navegador (flujos completos por rol) no existen; lo que hoy protege las pantallas son los tipos, las pruebas de estructura y las pruebas SQL.
- Hay políticas RLS permisivas múltiples por tabla (una para docente y otra para el dueño); funcionan, pero el asesor de rendimiento de Supabase las marca. Se pueden fusionar si el volumen lo pide.
- Las funciones `resumen_*_por_grupo` de la migración inicial ya no se usan desde el cliente.
- Activar en el panel de Supabase la protección contra contraseñas filtradas si algún día se habilitan contraseñas (hoy solo hay Google y enlace por correo).
