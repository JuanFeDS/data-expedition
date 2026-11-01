# data-expedicion

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square" />
  <img alt="TypeScript 7" src="https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white&style=flat-square" />
  <img alt="Vite 8" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square" />
  <img alt="Vitest 5" src="https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white&style=flat-square" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-migraciones-3ECF8E?logo=supabase&logoColor=white&style=flat-square" />
</p>

App de seguimiento, calificación y gamificación para un curso de ciencia de datos. Cada estudiante tiene un radar de habilidades que parte de un diagnóstico y se compara siempre contra su propio punto de partida, junto con notas por rúbrica, declaración de uso de IA y lecciones cortas pensadas para el celular. Todo va envuelto en una expedición con un jaguar como guía.

🔗 **Demo del prototipo:** https://juanfeds.com/data-expedition/

---

## 📑 Tabla de contenido

1. [Contexto y motivación](#-1-contexto-y-motivación)
2. [Funcionalidades](#-2-funcionalidades)
3. [Estado del proyecto](#-3-estado-del-proyecto)
4. [Arquitectura](#-4-arquitectura)
5. [Modelo de datos](#-5-modelo-de-datos)
6. [Guía de uso](#-6-guía-de-uso)
7. [Contacto](#-7-contacto)

---

## 🎯 1. Contexto y motivación

El curso se repensó para la era de la IA: la evaluación se rediseña antes que la clase, se permite la IA con declaración obligatoria y cada estudiante construye un perfil de habilidades que evoluciona con el trabajo. Ninguna herramienta conocida une rúbricas por niveles que alimentan un radar, nota tradicional aparte, declaración de IA por entrega, lecciones tipo Duolingo y votaciones por grupo. Un LMS califica pero no calcula el radar ni gamifica; una hoja de cálculo no ofrece lecciones en el celular ni vistas privadas. De ahí esta app. El diseño completo está en [`docs/RFC-010-app-expedicion.md`](docs/RFC-010-app-expedicion.md).

---

## ✨ 2. Funcionalidades

| | Funcionalidad |
|---|---|
| 📊 | **Radar por estudiante**, calculado con la evidencia de cada dimensión y comparado con su punto de partida |
| 🧪 | **Diagnóstico** de la semana 1 que fija ese punto de partida (no cuenta para aprobar) |
| 📝 | **Rúbricas de 5 niveles** que dan la nota de 1.0 a 5.0, con decimales, y una regla visible para el estudiante |
| 🤖 | **Declaración de IA por entrega** ("con IA" o "sin IA"), con bitácora cuando se usó |
| ⚡ | **Lecciones** de 3 a 5 minutos para el celular, con XP y un aporte pequeño y con tope al radar |
| 💎 | **Gemas**: cada módulo cerrado da una gema y desbloquea sus preguntas de repaso; el nivel de pulido sube la dificultad |
| 🤝 | **Misiones en equipo** y **votaciones** por grupo (modo colaborativo o competitivo) |
| 🗳️ | **Votación en vivo** durante la clase |
| 📬 | **Resumen semanal** dentro de la app y por correo |
| 🐆 | **Jaguar guía**, con frases por isla y consejos |

**Fuera de alcance:** integración con el LMS, tabla de posiciones global, detectores de IA y chat o foro.

---

## 🗺️ 3. Estado del proyecto

- ✅ **Prototipo de interfaz** (`web/`): 16 pantallas con datos de ejemplo, en móvil y en escritorio.
- ✅ **Dominio en TypeScript** (`src/`): nota, niveles y radar con pruebas, sin red ni base de datos.
- 🏗️ **Migración inicial de Supabase** con políticas por fila, todavía sin aplicar a un proyecto real.
- ⏳ **Pendiente:** autenticación, conexión de la interfaz con la base de datos, panel del docente y vista del observador.

---

## 🏛️ 4. Arquitectura

Hexagonal: el dominio no conoce la base de datos ni la interfaz, y todo lo que sale al exterior pasa por un puerto. Un lint de fronteras vigila las dependencias.

```
data-expedicion/
├── src/
│   ├── dominio/        # reglas puras: niveles, nota, radar
│   ├── puertos/        # interfaces (p. ej. repositorio de evidencias)
│   ├── casos-de-uso/   # calcular-radar
│   └── adaptadores/    # supabase/ y banco/ (por implementar)
├── web/                # prototipo de interfaz (React + Vite + TypeScript)
│   └── src/
│       ├── pantallas/      # una pantalla por archivo (E0 … E14)
│       ├── componentes/    # barra lateral, radar, isla, jaguar, menús
│       ├── datos.ts        # datos de ejemplo del curso
│       ├── estilos.css     # tokens de diseño
│       ├── pantallas.css   # estilos de las pantallas (diseño móvil)
│       └── escritorio.css  # capa para pantallas de 1100 px o más
├── supabase/           # migraciones y datos semilla
├── test/               # espeja src/
└── docs/               # RFC-010
```

**Regla de dependencias:** `dominio` no importa nada; `puertos` solo importa `dominio`; `casos-de-uso` solo `dominio` y `puertos`.

**Interfaz:** se diseñó primero para el celular. Desde 1100 px de ancho se activa una capa de escritorio (barra lateral fija, escenas panorámicas y modales); por debajo de ese ancho nada cambia.

---

## 🗄️ 5. Modelo de datos

La migración [`supabase/migrations/0001_modelo_inicial.sql`](supabase/migrations/0001_modelo_inicial.sql) define las tablas principales, con políticas por fila: cada estudiante lee solo lo suyo y el docente lee todo.

| Tabla | Rol |
|---|---|
| `ediciones` | Cada vez que se dicta el curso; la plantilla es una edición |
| `perfiles`, `grupos`, `matriculas` | Usuarios con rol, grupos y su inscripción |
| `dimensiones`, `trabajos`, `criterios` | Catálogo configurable del curso y sus rúbricas |
| `entregas`, `calificaciones` | Lo entregado y el nivel por criterio |
| `evidencias_radar` | La evidencia que alimenta el radar |

---

## ⚙️ 6. Guía de uso

### Requisitos
- Node.js 22 o superior (la versión que usa el flujo de despliegue)

### Instalación
```bash
git clone https://github.com/JuanFeDS/data-expedition.git
cd data-expedition
cd web && npm install
```

### Ejecutar la interfaz
```bash
cd web
npm run dev
```
Se abre en `http://localhost:5173`. La navegación usa rutas con `#`: `#/home`, `#/e1` … `#/e14`, `#/tutorial`, y `#/todas` para la galería de todas las pantallas. Agrega `?completo` para ver las pantallas a altura completa.

### Dominio y pruebas
```bash
npm install
npm run check     # tipos, lint de fronteras y pruebas
```

### Otros comandos
| Comando | Dónde | Qué hace |
|---|---|---|
| `npm run build` | `web/` | Revisa tipos y construye la interfaz |
| `npm run typecheck` | raíz o `web/` | Revisa tipos |
| `npm test` | raíz | Ejecuta las pruebas del dominio |
| `npm run lint` | raíz | Verifica las fronteras de la arquitectura |

### Despliegue
Cada push a `main` construye `web/` y lo publica en GitHub Pages con [`.github/workflows/pages.yml`](.github/workflows/pages.yml). La variable `VITE_BASE` define la ruta base (`/data-expedition/` en producción).

---

## 📬 7. Contacto

JuanFe — [jmartinezbernal02@gmail.com](mailto:jmartinezbernal02@gmail.com)
