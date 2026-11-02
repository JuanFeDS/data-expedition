import type { Icono } from './Icono';

export type Rol = 'estudiante' | 'docente' | 'observador';

export interface Enlace {
  tipo: Icono;
  etiqueta: string;
  detalle: string;
  ruta: string;
  activa: string[];
  color: string;
  aviso?: string;
}

export interface GrupoEnlaces {
  titulo: string;
  enlaces: Enlace[];
}

export const rolDeRuta = (ruta: string): Rol => {
  if (/^d\d+$/.test(ruta)) return 'docente';
  if (/^o\d+$/.test(ruta)) return 'observador';
  return 'estudiante';
};

export const inicioDeRol: Record<Rol, string> = { estudiante: '#/home', docente: '#/d1', observador: '#/o1' };

export const usuarioDeRol: Record<Rol, { iniciales: string; nombre: string; detalle: string; ruta: string; color: string }> = {
  estudiante: { iniciales: 'CR', nombre: 'Camilo', detalle: 'Rol: Analista · 340 XP', ruta: '#/e12', color: 'verde' },
  docente: { iniciales: 'JF', nombre: 'Prof. Juanfe', detalle: 'Docente · 3 grupos', ruta: '#/d10', color: 'azul' },
  observador: { iniciales: 'OB', nombre: 'Observación', detalle: 'Coordinación académica', ruta: '#/o1', color: 'menta' },
};

export const NAVEGACION: Record<Rol, GrupoEnlaces[]> = {
  estudiante: [
    {
      titulo: 'Explorar',
      enlaces: [
        { tipo: 'inicio', etiqueta: 'Inicio', detalle: 'Tu campamento y la isla de la semana', ruta: '#/home', activa: ['home'], color: 'claro' },
        { tipo: 'ruta', etiqueta: 'Mapa del curso', detalle: 'Tu recorrido por el curso', ruta: '#/e1', activa: ['e1'], color: 'mint' },
        { tipo: 'radar', etiqueta: 'Radar', detalle: 'Cómo vas frente a tu punto de partida', ruta: '#/e2', activa: ['e2'], color: 'accent' },
        { tipo: 'notas', etiqueta: 'Notas', detalle: 'Tus trabajos y retroalimentación', ruta: '#/e3', activa: ['e3', 'e4'], color: 'azul' },
        { tipo: 'entregas', etiqueta: 'Entregas', detalle: 'Pendientes y entregadas', ruta: '#/e5', activa: ['e5', 'e6', 'e29'], color: 'mint' },
        { tipo: 'leccion', etiqueta: 'Practicar', detalle: 'Racha, XP y repaso sin límite', ruta: '#/e15', activa: ['e15', 'e7', 'e8', 'e16', 'e27'], color: 'accent' },
      ],
    },
    {
      titulo: 'Curso',
      enlaces: [
        { tipo: 'calendario', etiqueta: 'Calendario', detalle: 'Sesiones, plazos y material', ruta: '#/e22', activa: ['e22', 'e23'], color: 'azul' },
        { tipo: 'formulario', etiqueta: 'Diagnóstico', detalle: 'Tu punto de partida, con y sin IA', ruta: '#/e17', activa: ['e17', 'e18', 'e19'], color: 'mint' },
        { tipo: 'equipo', etiqueta: 'Mi ruta y equipo', detalle: 'Tu ruta asignada y tu equipo', ruta: '#/e24', activa: ['e24'], color: 'accent' },
        { tipo: 'historico', etiqueta: 'Mis resultados', detalle: 'Relámpagos, encuestas y votaciones', ruta: '#/e30', activa: ['e30'], color: 'claro' },
      ],
    },
    {
      titulo: 'Mi grupo',
      enlaces: [
        { tipo: 'votar', etiqueta: 'Votación', detalle: 'Cómo juega tu grupo', ruta: '#/e9', activa: ['e9', 'e13', 'e20', 'e21', 'e25', 'e28'], color: 'accent', aviso: '1' },
        { tipo: 'liga', etiqueta: 'Mi liga', detalle: 'Ranking del modo competitivo', ruta: '#/e31', activa: ['e31'], color: 'mint' },
        { tipo: 'equipo', etiqueta: 'Misión en equipo', detalle: 'El proyecto final', ruta: '#/e10', activa: ['e10'], color: 'azul' },
        { tipo: 'resumen', etiqueta: 'Resumen semanal', detalle: 'Tu semana en una página', ruta: '#/e11', activa: ['e11'], color: 'mint', aviso: '•' },
      ],
    },
    {
      titulo: 'Ayuda',
      enlaces: [
        { tipo: 'ayuda', etiqueta: 'Tutorial', detalle: 'Cómo se usa la expedición', ruta: '#/tutorial', activa: ['tutorial', 'e26'], color: 'azul' },
        { tipo: 'sonido', etiqueta: 'Sonidos', detalle: 'Galería para elegir los sonidos', ruta: '#/e32', activa: ['e32'], color: 'accent' },
      ],
    },
  ],
  docente: [
    {
      titulo: 'Curso',
      enlaces: [
        { tipo: 'panel', etiqueta: 'Panel', detalle: 'Resumen del curso y alertas', ruta: '#/d1', activa: ['d1'], color: 'claro' },
        { tipo: 'entregas', etiqueta: 'Entregas', detalle: 'Estado de cada entrega', ruta: '#/d3', activa: ['d3'], color: 'mint', aviso: '4' },
        { tipo: 'votar', etiqueta: 'Corrección', detalle: 'Rúbrica de una entrega', ruta: '#/d4', activa: ['d4'], color: 'accent' },
        { tipo: 'radar', etiqueta: 'Diagnóstico y rutas', detalle: 'Resultados y ruta propuesta', ruta: '#/d2', activa: ['d2'], color: 'azul' },
        { tipo: 'perfil', etiqueta: 'Estudiantes', detalle: 'Ficha de cada estudiante', ruta: '#/d8', activa: ['d8'], color: 'mint' },
        { tipo: 'equipo', etiqueta: 'Equipos', detalle: 'Formación y roles', ruta: '#/d7', activa: ['d7'], color: 'accent' },
      ],
    },
    {
      titulo: 'Clase',
      enlaces: [
        { tipo: 'leccion', etiqueta: 'En clase', detalle: 'Abrir una relámpago con QR', ruta: '#/d11', activa: ['d11'], color: 'accent' },
        { tipo: 'formulario', etiqueta: 'Formularios', detalle: 'Encuestas, votaciones y relámpago', ruta: '#/d5', activa: ['d5'], color: 'azul' },
        { tipo: 'historico', etiqueta: 'Resultados', detalle: 'Histórico de encuestas y votaciones', ruta: '#/d12', activa: ['d12'], color: 'mint' },
        { tipo: 'calendario', etiqueta: 'Calendario', detalle: 'Sesiones y plazos', ruta: '#/d6', activa: ['d6'], color: 'mint' },
        { tipo: 'material', etiqueta: 'Material', detalle: 'Recursos por sesión', ruta: '#/d9', activa: ['d9'], color: 'claro' },
      ],
    },
    {
      titulo: 'Ajustes',
      enlaces: [
        { tipo: 'equipo', etiqueta: 'Personas', detalle: 'Invitaciones, roles y grupos', ruta: '#/d13', activa: ['d13'], color: 'mint' },
        { tipo: 'entregas', etiqueta: 'Trabajos', detalle: 'Qué se entrega y cuándo', ruta: '#/d14', activa: ['d14'], color: 'accent' },
        { tipo: 'ajustes', etiqueta: 'Configuración', detalle: 'Dimensiones, rúbricas y umbrales', ruta: '#/d10', activa: ['d10'], color: 'azul' },
      ],
    },
  ],
  observador: [
    {
      titulo: 'Observación',
      enlaces: [
        { tipo: 'ojo', etiqueta: 'Resumen por grupo', detalle: 'Solo datos agregados', ruta: '#/o1', activa: ['o1'], color: 'mint' },
        { tipo: 'notas', etiqueta: 'Dimensiones y trabajos', detalle: 'Avance agregado del curso', ruta: '#/o2', activa: ['o2'], color: 'azul' },
      ],
    },
    {
      titulo: 'Ayuda',
      enlaces: [{ tipo: 'ayuda', etiqueta: 'Qué puedes ver', detalle: 'Anonimato y mínimo de personas', ruta: '#/o3', activa: ['o3'], color: 'accent' }],
    },
  ],
};

export const RUTAS_COMUNES = new Set(['cursos']);
export const CONECTADAS = new Set(['e0', 'cursos', 'e5', 'e6', 'd3', 'd13', 'd14']);

const ENLACE_CURSOS: Enlace = { tipo: 'inicio', etiqueta: 'Cursos', detalle: 'Tus cursos y el que tienes activo', ruta: '#/cursos', activa: ['cursos'], color: 'claro' };

export const codigoDeRuta = (ruta: string) => ruta.replace(/^#\/?/, '');

export const esConectada = (ruta: string) => CONECTADAS.has(codigoDeRuta(ruta));

export const gruposVisibles = (rol: Rol, soloConectadas: boolean) =>
  [...(soloConectadas ? [{ titulo: 'Cursos', enlaces: [ENLACE_CURSOS] }] : []), ...NAVEGACION[rol]]
    .map((grupo) => ({ ...grupo, enlaces: soloConectadas ? grupo.enlaces.filter((enlace) => esConectada(enlace.ruta)) : grupo.enlaces }))
    .filter((grupo) => grupo.enlaces.length > 0);
