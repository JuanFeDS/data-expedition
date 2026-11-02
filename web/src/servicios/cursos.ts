import { supabase } from './supabase';

export interface Curso { id: string; nombre: string }
export interface ConteoCurso { estudiantes: number; grupos: number }

export interface ServicioCursos {
  listar: () => Promise<Curso[]>;
  crear: (nombre: string) => Promise<string | null>;
  contar: () => Promise<Record<string, ConteoCurso>>;
}

export const servicioCursosSupabase: ServicioCursos = {
  async listar() {
    const { data, error } = await supabase!.from('ediciones').select('id, nombre').eq('es_plantilla', false).order('creada_en');
    if (error) throw error;
    return (data ?? []) as Curso[];
  },
  async crear(nombre) {
    const { error } = await supabase!.from('ediciones').insert({ nombre });
    return error ? 'No pudimos crear el curso. Intenta de nuevo.' : null;
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
    crear: async (nombre) => { cursos.push({ id: `demo-${cursos.length + 1}`, nombre }); return null; },
    contar: async () => Object.fromEntries(cursos.map((curso, indice) => [curso.id, { estudiantes: 12 - indice * 4, grupos: 3 - indice }])),
  };
}
