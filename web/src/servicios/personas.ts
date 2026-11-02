import type { Rol } from '../componentes/navegacion';
import { supabase } from './supabase';

export interface Grupo { id: string; nombre: string }
export interface PersonaCurso {
  id: string;
  correo: string;
  nombre: string | null;
  usuario: string | null;
  rol: Rol;
  grupoId: string | null;
}
export interface Invitacion { correo: string; rol: Rol; grupoId: string | null }

export interface DatosPersonas {
  grupos: Grupo[];
  personas: PersonaCurso[];
  invitaciones: Invitacion[];
}

export interface ServicioPersonas {
  cargar: (cursoId: string) => Promise<DatosPersonas>;
  crearGrupo: (cursoId: string, nombre: string) => Promise<string | null>;
  invitar: (cursoId: string, correos: string[], rol: Rol, grupoId: string | null) => Promise<string | null>;
  quitarInvitacion: (cursoId: string, correo: string) => Promise<string | null>;
  cambiarRol: (persona: PersonaCurso, rol: Rol) => Promise<string | null>;
  moverDeGrupo: (cursoId: string, persona: PersonaCurso, grupoId: string | null) => Promise<string | null>;
  sacarDelCurso: (cursoId: string, persona: PersonaCurso) => Promise<string | null>;
}

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';
const mensaje = (error: { code?: string } | null, repetido?: string) => {
  if (!error) return null;
  return error.code === '23505' && repetido ? repetido : FALLO;
};

export const servicioSupabase: ServicioPersonas = {
  async cargar(cursoId) {
    if (!supabase) throw new Error('Sin conexión');
    const [grupos, matriculas, docentes, invitaciones] = await Promise.all([
      supabase.from('grupos').select('id, nombre').eq('edicion_id', cursoId).order('nombre'),
      supabase.from('matriculas').select('grupo_id, perfiles(id, correo, nombre, usuario, rol)').eq('edicion_id', cursoId),
      supabase.from('perfiles').select('id, correo, nombre, usuario, rol').eq('rol', 'docente'),
      supabase.from('invitaciones').select('correo, rol, grupo_id').eq('edicion_id', cursoId).order('creado_en'),
    ]);
    if (grupos.error || matriculas.error || docentes.error || invitaciones.error) throw new Error('Consulta fallida');
    const porId = new Map<string, PersonaCurso>();
    (docentes.data ?? []).forEach((perfil) => porId.set(perfil.id as string, { ...(perfil as Omit<PersonaCurso, 'grupoId'>), grupoId: null }));
    (matriculas.data ?? []).forEach((fila) => {
      const perfil = fila.perfiles as unknown as Omit<PersonaCurso, 'grupoId'> | null;
      if (perfil) porId.set(perfil.id, { ...perfil, grupoId: fila.grupo_id as string | null });
    });
    const registrados = new Set([...porId.values()].map((persona) => persona.correo.toLowerCase()));
    return {
      grupos: (grupos.data ?? []) as Grupo[],
      personas: [...porId.values()],
      invitaciones: (invitaciones.data ?? []).filter((fila) => !registrados.has(fila.correo as string)).map((fila) => ({ correo: fila.correo as string, rol: fila.rol as Rol, grupoId: fila.grupo_id as string | null })),
    };
  },

  async crearGrupo(cursoId, nombre) {
    const { error } = await supabase!.from('grupos').insert({ edicion_id: cursoId, nombre });
    return mensaje(error, 'Ya existe un grupo con ese nombre.');
  },

  async invitar(cursoId, correos, rol, grupoId) {
    const grupo = rol === 'estudiante' ? grupoId : null;
    const { data: existentes, error: falloBusqueda } = await supabase!.from('perfiles').select('id, correo').in('correo', correos);
    if (falloBusqueda) return FALLO;
    const idDe = new Map((existentes ?? []).map((perfil) => [(perfil.correo as string).toLowerCase(), perfil.id as string]));
    const yaRegistrados = correos.filter((correo) => idDe.has(correo));
    const nuevos = correos.filter((correo) => !idDe.has(correo));
    if (yaRegistrados.length > 0) {
      const { error } = await supabase!.from('matriculas').upsert(yaRegistrados.map((correo) => ({ perfil_id: idDe.get(correo), edicion_id: cursoId, grupo_id: grupo })), { onConflict: 'perfil_id,edicion_id' });
      if (error) return FALLO;
    }
    if (nuevos.length > 0) {
      const { error } = await supabase!.from('invitaciones').upsert(nuevos.map((correo) => ({ correo, edicion_id: cursoId, grupo_id: grupo, rol })), { onConflict: 'correo,edicion_id' });
      if (error) return FALLO;
    }
    return null;
  },

  async quitarInvitacion(cursoId, correo) {
    const { error } = await supabase!.from('invitaciones').delete().eq('edicion_id', cursoId).eq('correo', correo);
    return mensaje(error);
  },

  async cambiarRol(persona, rol) {
    const { error } = await supabase!.rpc('asignar_rol', { p_perfil: persona.id, p_rol: rol });
    return error ? FALLO : null;
  },

  async moverDeGrupo(cursoId, persona, grupoId) {
    const { error } = await supabase!.from('matriculas').upsert({ perfil_id: persona.id, edicion_id: cursoId, grupo_id: grupoId }, { onConflict: 'perfil_id,edicion_id' });
    return mensaje(error);
  },

  async sacarDelCurso(cursoId, persona) {
    const { error } = await supabase!.from('matriculas').delete().eq('edicion_id', cursoId).eq('perfil_id', persona.id);
    return mensaje(error);
  },
};

export const correosDeTexto = (texto: string) =>
  [...new Set(texto.split(/[\s,;]+/).map((parte) => parte.trim().toLowerCase()).filter(Boolean))];

export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
