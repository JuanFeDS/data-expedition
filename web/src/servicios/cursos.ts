import { supabase } from './supabase';

export interface Curso { id: string; nombre: string }

export interface ServicioCursos {
  listar: () => Promise<Curso[]>;
  crear: (nombre: string) => Promise<string | null>;
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
};

export function crearServicioCursosDemo(): ServicioCursos {
  const cursos: Curso[] = [{ id: 'ed-demo', nombre: 'Ciencia de datos 2026-2' }, { id: 'ed-demo-2', nombre: 'Estadística aplicada 2026-2' }];
  return {
    listar: async () => [...cursos],
    crear: async (nombre) => { cursos.push({ id: `demo-${cursos.length + 1}`, nombre }); return null; },
  };
}
