import { supabase } from './supabase';

export interface Curso { id: string; nombre: string; periodo?: string | null }
export interface DatosCurso { nombre: string; periodo: string }
export interface ConteoCurso { estudiantes: number; grupos: number }

export interface ServicioCursos {
  listar: () => Promise<Curso[]>;
  crear: (datos: DatosCurso) => Promise<string | null>;
  actualizar: (id: string, datos: DatosCurso) => Promise<string | null>;
  eliminar: (id: string) => Promise<string | null>;
  contar: () => Promise<Record<string, ConteoCurso>>;
  miGrupo: (cursoId: string) => Promise<string | null>;
}

export const servicioCursosSupabase: ServicioCursos = {
  async listar() {
    const { data, error } = await supabase!.from('ediciones').select('id, nombre, periodo').eq('es_plantilla', false).order('creada_en');
    if (error) throw error;
    return (data ?? []) as Curso[];
  },
  async crear(datos) {
    const { error } = await supabase!.from('ediciones').insert({ nombre: datos.nombre, periodo: datos.periodo || null });
    return error ? 'No pudimos crear el curso. Intenta de nuevo.' : null;
  },
  async actualizar(id, datos) {
    const { error } = await supabase!.from('ediciones').update({ nombre: datos.nombre, periodo: datos.periodo || null }).eq('id', id);
    return error ? 'No pudimos guardar los cambios. Intenta de nuevo.' : null;
  },
  async eliminar(id) {
    const [matriculas, trabajos] = await Promise.all([
      supabase!.from('matriculas').select('perfil_id', { count: 'exact', head: true }).eq('edicion_id', id),
      supabase!.from('trabajos').select('id', { count: 'exact', head: true }).eq('edicion_id', id),
    ]);
    if (matriculas.error || trabajos.error) return 'No pudimos comprobar el curso. Intenta de nuevo.';
    if ((matriculas.count ?? 0) > 0) return 'El curso tiene personas matriculadas. Quítalas primero desde Personas.';
    if ((trabajos.count ?? 0) > 0) return 'El curso tiene trabajos. Quítalos primero desde Trabajos.';
    const { error } = await supabase!.from('ediciones').delete().eq('id', id);
    return error ? 'No pudimos eliminar el curso.' : null;
  },
  async miGrupo(cursoId) {
    const { data: sesion } = await supabase!.auth.getSession();
    const yo = sesion.session?.user.id;
    if (!yo) return null;
    const { data } = await supabase!.from('matriculas').select('grupos(nombre)').eq('edicion_id', cursoId).eq('perfil_id', yo).maybeSingle();
    return (data?.grupos as unknown as { nombre: string } | null)?.nombre ?? null;
  },
  async contar() {
    const [matriculas, grupos] = await Promise.all([
      supabase!.from('matriculas').select('edicion_id, perfiles!inner(rol)').eq('perfiles.rol', 'estudiante'),
      supabase!.from('grupos').select('edicion_id'),
    ]);
    const conteo: Record<string, ConteoCurso> = {};
    const de = (id: string) => (conteo[id] ??= { estudiantes: 0, grupos: 0 });
    (matriculas.data ?? []).forEach((fila) => { de(fila.edicion_id as string).estudiantes += 1; });
    (grupos.data ?? []).forEach((fila) => { de(fila.edicion_id as string).grupos += 1; });
    return conteo;
  },
};

export function crearServicioCursosDemo(): ServicioCursos {
  const cursos: Curso[] = [{ id: 'ed-demo', nombre: 'Ciencia de datos 2026-2' }, { id: 'ed-demo-2', nombre: 'Estadística aplicada 2026-2' }];
  return {
    listar: async () => [...cursos],
    crear: async (datos) => { cursos.push({ id: `demo-${cursos.length + 1}`, ...datos }); return null; },
    actualizar: async (id, datos) => { const indice = cursos.findIndex((curso) => curso.id === id); if (indice >= 0) cursos[indice] = { id, ...datos }; return null; },
    eliminar: async (id) => { const indice = cursos.findIndex((curso) => curso.id === id); if (indice >= 0) cursos.splice(indice, 1); return null; },
    miGrupo: async () => 'Grupo A',
    contar: async () => Object.fromEntries(cursos.map((curso, indice) => [curso.id, { estudiantes: 12 - indice * 4, grupos: 3 - indice }])),
  };
}
