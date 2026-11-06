# Arquitectura de Data Expedition

Guía corta para quien vaya a tocar el código. Describe cómo está organizada la app, las reglas que se siguen y cómo comprobar que algo no se rompió.

## Visión general

- **Frontend:** React 19 + TypeScript 7 + Vite 8, en `web/`. Sin router externo: la ruta vive en el fragmento de la URL (`#/c/<curso>/<pantalla>?param=valor`).
- **Backend:** Supabase (Postgres, Auth, RLS). Toda la lógica que protege datos vive en la base, no en la interfaz.
- **Despliegue:** GitHub Pages (`.github/workflows/pages.yml`). Las revisiones de rama corren `revision.yml`.

```
web/src
├─ app/            arranque (main.tsx), enrutado y registro de pantallas
├─ compartido/
│  ├─ ui/          piezas de interfaz (jaguar, selector, radar, paneles, errores…)
│  ├─ estado/      sesión, curso, desbloqueos, actividad, confirmaciones
│  └─ navegacion/  rutas, panel lateral, menú, guía de desbloqueo
├─ dominio/        reglas puras y sus pruebas (niveles, nota, radar, reglas.ts)
├─ servicios/      acceso a Supabase y adaptación de datos
├─ funciones/      una carpeta por tema (entregas, formularios, asistencia…)
│  └─ <tema>/      docente/, estudiante/, observador/ o comun/; X.tsx elige entre demo y real
├─ demo/           datos ficticios y pantallas de ejemplo (se descargan solo en modo demo)
└─ estilos/        tokens y estilos globales, de pantallas y de escritorio
supabase/
├─ migrations/     esquema numerado y aplicado en orden (0001…)
└─ pruebas/        pruebas SQL de políticas y funciones
docs/              producto/, curso/, diseno/, historial/
```

## Capas y reglas

1. **Las pantallas no hablan con Supabase.** Usan funciones de `servicios/`. Un servicio devuelve datos ya tipados y mapeados (de `snake_case` de la base a `camelCase`).
2. **Servicios con dos implementaciones** (personas, trabajos, cursos, rúbricas): una real y otra en memoria para el modo demo, elegidas por un hook `useServicio…()`. Los servicios nuevos son solo reales; su pantalla demo usa datos ficticios.
3. **Pantalla con demo y real.** `conModoDemo(() => import('demo/…'), 'XEjemplo', XReal)` elige según `?demo`; la versión demo vive en `demo/` y solo se descarga en ese modo.
4. **Seguridad en la base.** Cada tabla tiene RLS. Lo que no se puede expresar como política (calificar, responder, abrir asistencia, agregados para observadores) es una función `security definer` con `search_path = ''`, revocada para `anon` y verificando el rol dentro.
5. **Dominio portable.** `dominio/` solo importa de `dominio/` (lo comprueba una prueba) para poder correr también en una función de servidor.
6. **Privacidad.** En formularios anónimos las respuestas no llevan perfil ni hora que las una con quien las dio. Observadores solo reciben agregados con mínimo de 5 personas (lo impone la base).
7. **Una regla de negocio, un lugar.** Lo ajustable está en `dominio/reglas.ts`; si también existe en SQL, el archivo lo dice.
8. **Estilos.** Variables y escala tipográfica en `estilos.css` (`--fs-*`), nada de tamaños sueltos; `pantallas.css` para pantallas; `escritorio.css` para ≥ 1100 px. Los controles usan componentes propios (`Selector`, `Segmentado`, confirmaciones), no los nativos.
9. **Movimiento.** Toda animación va dentro de `prefers-reduced-motion: no-preference`.

## Navegación y desbloqueo

- `compartido/navegacion/navegacion.ts` define el panel: en modo real se agrupa por trabajo (`GRUPOS_CURSO`) y las secciones aún no abiertas pasan a «Descubrir».
- Cada persona desbloquea una sección al entrar a ella; el jaguar la explica la primera vez (`GuiaDesbloqueo.tsx`). Estado en `localStorage` y en `progreso_usuario`.
- `servicios/ruta.ts` fija el orden recomendado por rol. La prueba `compartido/navegacion/estructura.test.ts` exige que toda sección de la ruta esté en el panel, tenga mensaje del jaguar y esté registrada.

## Cómo agregar una pantalla

1. Crea `funciones/<tema>/<rol>/Xyz.tsx` (y `XyzReal.tsx` si tiene datos; su versión de ejemplo va en `demo/pantallas/`).
2. Regístrala en `app/registro.ts` y, si es de curso, añade el código a `ENCURSO` y `CONECTADAS` en `navegacion.ts`.
3. Si va en el panel: añádela a `GRUPOS_CURSO`, a la ruta de su rol en `servicios/ruta.ts` y escribe su mensaje en `GuiaDesbloqueo.tsx`.
4. Corre `npm run check`; las pruebas de estructura te dicen qué falta.

## Cómo agregar algo a la base

1. Nueva migración `supabase/migrations/00NN_descripcion.sql` (nunca edites una ya aplicada).
2. RLS activada y funciones revocadas para `anon`.
3. Agrega su bloque a `supabase/pruebas/funciones_y_politicas.sql` y córrelo (cada bloque termina en `OK …` o `FALLO …`).
4. Aplica la migración solo con aprobación explícita.

## Demo

El modo demo (`?demo`, o sin variables de Supabase) es una experiencia aparte, cargada bajo demanda: `demo/ExperienciaDemo.tsx` (portada, barra «Ver como…» y un jaguar que comenta cada pantalla la primera vez que se entra, sin mover a nadie), `demo/recorrido.ts` (las pantallas y el comentario de cada rol) y `demo/estado.ts` (un almacén pequeño que guarda en `sessionStorage` qué pantallas ya se comentaron). Las pantallas siguen siendo las de `demo/pantallas/` con datos de `demo/datos*.ts`. Para añadir un paso al recorrido basta una entrada en `recorrido.ts`; una prueba comprueba que la pantalla exista y sea del rol.

## Observabilidad

- **Errores del navegador:** `servicios/errores.ts` guarda en `errores_cliente` las excepciones sin atrapar, las promesas rechazadas y los fallos de dibujo, con tope por sesión y sin repetir el mismo mensaje. Solo el docente los lee.
- **Uso y cambios de datos:** la tabla `eventos` (ver `servicios/eventos.ts` y la migración 0007).
- **Despliegue y calidad:** el despliegue solo ocurre si pasan tipos, lint, pruebas con cobertura y la auditoría de dependencias (`pages.yml`); las ramas y los PR corren lo mismo en `revision.yml`.
- **Qué mirar si algo falla:** [operacion.md](operacion.md).
- **Decisiones:** [decisiones/](decisiones/).

## Comprobaciones

| Comando (en `web/`) | Qué revisa |
|---|---|
| `npm run typecheck` | Tipos estrictos, variables y parámetros sin uso |
| `npm run lint` | Errores probables (oxlint) |
| `npm test` | Todas las pruebas unitarias (Vitest + Testing Library) |
| `npm run test:cobertura` | Lo anterior con cobertura y mínimos exigidos |
| `npm run check` | Tipos, lint y pruebas |
| `npm run build` | `check` + empaquetado |

### Pruebas unitarias

- **Dominio** (`dominio/*.test.ts`): reglas puras de nota, niveles y radar, y que el dominio no importe de fuera.
- **Servicios** (`servicios/*.test.ts`): cada función que habla con Supabase se prueba con un cliente falso (`pruebas/supabaseSimulado.ts`): qué consulta arma, cómo mapea la respuesta y cómo traduce los errores. También los servicios de demostración, el registro de eventos y el almacenamiento de la sesión.
- **Componentes** (`compartido/**/*.test.tsx`): selector, preguntas, paneles, resultados, manejo de errores y el desbloqueo de secciones con sus proveedores.
- **Pantallas** (`funciones/*.test.tsx`): flujos de las pantallas clave, con los servicios simulados (`pruebas/contexto.ts` simula sesión y curso).
- **Estructura** (`compartido/navegacion/estructura.test.ts`): consistencia entre el registro, el panel y la ruta de desbloqueo.
- **Base de datos**: `supabase/pruebas/funciones_y_politicas.sql`, que se corre aparte contra Supabase.
- **Mínimos de cobertura** (que no pueden bajar): dominio 90 % de líneas, servicios 80 %.

Al agregar un servicio o una pantalla con lógica, agrega su prueba junto al archivo (`X.test.ts` / `X.test.tsx`).

## Deuda conocida

- No hay pruebas con un navegador real (flujos completos por rol). Las pantallas sin prueba unitaria son sobre todo las de calendario, equipos, diagnóstico, observador y el campamento.
- Hay políticas RLS permisivas múltiples por tabla (una para docente y otra para el dueño); funcionan, pero el asesor de rendimiento de Supabase las marca. Se pueden fusionar si el volumen lo pide.
- Las funciones `resumen_*_por_grupo` de la migración inicial ya no se usan desde el cliente.
- Activar en el panel de Supabase la protección contra contraseñas filtradas si algún día se habilitan contraseñas (hoy solo hay Google y enlace por correo).
