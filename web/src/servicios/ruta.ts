import { supabase } from './supabase';

export type CondicionRuta = 'visita' | 'estudiantes' | 'trabajos' | 'criterios' | 'formularios' | 'abierto' | 'sesiones' | 'recursos' | 'diagnosticos' | 'entrega' | 'autoinforme';
export type Condiciones = Record<Exclude<CondicionRuta, 'visita'>, boolean>;
export interface PasoRuta { codigo: string; completa: CondicionRuta; pista: string }

// Cada paso se completa con algo que la persona hace, y completarlo abre el siguiente.
// Las dos primeras secciones se abren al entrar al curso.
export const RUTA_DOCENTE: PasoRuta[] = [
  { codigo: 'curso', completa: 'visita', pista: 'Mira el resumen de tu curso' },
  { codigo: 'd13', completa: 'estudiantes', pista: 'Invita al menos a una persona al curso' },
  { codigo: 'd14', completa: 'trabajos', pista: 'Crea tu primer trabajo' },
  { codigo: 'd10', completa: 'criterios', pista: 'Define un criterio de calificación' },
  { codigo: 'd3', completa: 'visita', pista: 'Entra a Entregas y pulsa Entendido' },
  { codigo: 'd5', completa: 'formularios', pista: 'Crea tu primer formulario' },
  { codigo: 'd11', completa: 'abierto', pista: 'Abre un formulario en clase' },
  { codigo: 'd6', completa: 'sesiones', pista: 'Agrega una sesión al calendario' },
  { codigo: 'd9', completa: 'recursos', pista: 'Agrega un recurso de material' },
  { codigo: 'd7', completa: 'visita', pista: 'Entra a Equipos y pulsa Entendido' },
  { codigo: 'd2', completa: 'diagnosticos', pista: 'Registra el diagnóstico de un estudiante' },
  { codigo: 'd15', completa: 'visita', pista: 'Entra al banco de preguntas' },
];

export const RUTA_ESTUDIANTE: PasoRuta[] = [
  { codigo: 'curso', completa: 'visita', pista: 'Mira el resumen de tu curso' },
  { codigo: 'e5', completa: 'entrega', pista: 'Haz tu primera entrega' },
  { codigo: 'e3', completa: 'visita', pista: 'Entra a Notas y pulsa Entendido' },
  { codigo: 'e20', completa: 'visita', pista: 'Entra a En clase y pulsa Entendido' },
  { codigo: 'e22', completa: 'visita', pista: 'Revisa el calendario' },
  { codigo: 'e24', completa: 'visita', pista: 'Mira con quién haces los trabajos' },
  { codigo: 'e17', completa: 'autoinforme', pista: 'Guarda tu autoinforme del diagnóstico' },
  { codigo: 'e2', completa: 'visita', pista: 'Mira tu radar' },
  { codigo: 'e15', completa: 'visita', pista: 'Haz tu primera práctica' },
];

export const SECCIONES_INICIALES = 2;

export const rutaDeRol = (rol: string): PasoRuta[] => (rol === 'docente' ? RUTA_DOCENTE : rol === 'estudiante' ? RUTA_ESTUDIANTE : []);

// Si una consulta falla, esa condición cuenta como no cumplida: «Mostrar todo» evita que alguien quede bloqueado.
const contar = async (consulta: PromiseLike<{ count: number | null; error: unknown }>) => {
  try {
    const { count, error } = await consulta;
    return !error && (count ?? 0) > 0;
  } catch {
    return false;
  }
};

const VACIAS: Condiciones = { estudiantes: false, trabajos: false, criterios: false, formularios: false, abierto: false, sesiones: false, recursos: false, diagnosticos: false, entrega: false, autoinforme: false };

export const cargarCondiciones = async (rol: string, cursoId: string): Promise<Condiciones> => {
  if (!supabase) return VACIAS;
  const cabeza = { count: 'exact' as const, head: true };
  if (rol === 'docente') {
    const [matriculados, invitados, trabajos, criterios, formularios, abierto, sesiones, recursos, diagnosticos] = await Promise.all([
      contar(supabase.from('matriculas').select('perfil_id, perfiles!inner(rol)', cabeza).eq('edicion_id', cursoId).eq('perfiles.rol', 'estudiante')),
      contar(supabase.from('invitaciones').select('correo', cabeza).eq('edicion_id', cursoId).eq('rol', 'estudiante')),
      contar(supabase.from('trabajos').select('id', cabeza).eq('edicion_id', cursoId).eq('es_diagnostico', false)),
      contar(supabase.from('criterios').select('id, trabajos!inner(edicion_id)', cabeza).eq('trabajos.edicion_id', cursoId)),
      contar(supabase.from('formularios').select('id', cabeza).eq('edicion_id', cursoId)),
      contar(supabase.from('formularios').select('id', cabeza).eq('edicion_id', cursoId).not('abierto_en', 'is', null)),
      contar(supabase.from('sesiones').select('id', cabeza).eq('edicion_id', cursoId)),
      contar(supabase.from('recursos').select('id', cabeza).eq('edicion_id', cursoId)),
      contar(supabase.from('diagnosticos').select('perfil_id, dimensiones!inner(edicion_id)', cabeza).eq('dimensiones.edicion_id', cursoId).or('con_ia.not.is.null,sin_ia.not.is.null')),
    ]);
    return { ...VACIAS, estudiantes: matriculados || invitados, trabajos, criterios, formularios, abierto, sesiones, recursos, diagnosticos };
  }
  if (rol === 'estudiante') {
    const { data: sesion } = await supabase.auth.getSession();
    const yo = sesion.session?.user.id;
    if (!yo) return VACIAS;
    const [entrega, autoinforme] = await Promise.all([
      contar(supabase.from('entregas').select('id, trabajos!inner(edicion_id)', cabeza).eq('perfil_id', yo).eq('trabajos.edicion_id', cursoId).neq('estado', 'borrador')),
      contar(supabase.from('diagnosticos').select('dimension_id, dimensiones!inner(edicion_id)', cabeza).eq('perfil_id', yo).eq('dimensiones.edicion_id', cursoId).not('autoinforme', 'is', null)),
    ]);
    return { ...VACIAS, entrega, autoinforme };
  }
  return VACIAS;
};

// Cuántas secciones de la ruta están abiertas según lo que la persona ya hizo.
export const seccionesAbiertas = (ruta: PasoRuta[], condiciones: Condiciones, visitadas: string[]): string[] => {
  const hecho = (paso: PasoRuta) => (paso.completa === 'visita' ? visitadas.includes(paso.codigo) : condiciones[paso.completa]);
  let abiertas = Math.min(SECCIONES_INICIALES, ruta.length);
  for (let i = 1; i < ruta.length - 1; i += 1) {
    if (!hecho(ruta[i])) break;
    abiertas = i + 2;
  }
  return ruta.slice(0, abiertas).map((paso) => paso.codigo);
};
