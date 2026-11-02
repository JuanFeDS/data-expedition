import type { Rol } from '../componentes/navegacion';
import { supabase } from './supabase';

export interface Edicion { id: string; nombre: string }
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
  edicion: Edicion | null;
  grupos: Grupo[];
  personas: PersonaCurso[];
  invitaciones: Invitacion[];
}

export interface ServicioPersonas {
  cargar: () => Promise<DatosPersonas>;
  crearEdicion: (nombre: string) => Promise<string | null>;
  crearGrupo: (edicion: Edicion, nombre: string) => Promise<string | null>;
  invitar: (edicion: Edicion, correos: string[], rol: Rol, grupoId: string | null) => Promise<string | null>;
  quitarInvitacion: (correo: string) => Promise<string | null>;
  cambiarRol: (persona: PersonaCurso, rol: Rol) => Promise<string | null>;
  moverDeGrupo: (edicion: Edicion, persona: PersonaCurso, grupoId: string | null) => Promise<string | null>;
}

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';
const mensaje = (error: { code?: string } | null, repetido?: string) => {
  if (!error) return null;
  return error.code === '23505' && repetido ? repetido : FALLO;
};

export const servicioSupabase: ServicioPersonas = {
  async cargar() {
    if (!supabase) throw new Error('Sin conexión');
    const { data: ediciones, error } = await supabase.from('ediciones').select('id, nombre').eq('es_plantilla', false).order('creada_en').limit(1);
    if (error) throw error;
    const edicion = (ediciones?.[0] as Edicion | undefined) ?? null;
    const [grupos, perfiles, matriculas, invitaciones] = await Promise.all([
      edicion ? supabase.from('grupos').select('id, nombre').eq('edicion_id', edicion.id).order('nombre') : Promise.resolve({ data: [], error: null }),
      supabase.from('perfiles').select('id, correo, nombre, usuario, rol').order('creado_en'),
      edicion ? supabase.from('matriculas').select('perfil_id, grupo_id').eq('edicion_id', edicion.id) : Promise.resolve({ data: [], error: null }),
      supabase.from('correos_autorizados').select('correo, rol, grupo_id').order('creado_en'),
    ]);
    if (grupos.error || perfiles.error || matriculas.error || invitaciones.error) throw new Error('Consulta fallida');
    const grupoDe = new Map((matriculas.data ?? []).map((fila) => [fila.perfil_id as string, fila.grupo_id as string | null]));
    const registrados = new Set((perfiles.data ?? []).map((perfil) => (perfil.correo as string).toLowerCase()));
    return {
      edicion,
      grupos: (grupos.data ?? []) as Grupo[],
      personas: (perfiles.data ?? []).map((perfil) => ({ ...(perfil as Omit<PersonaCurso, 'grupoId'>), grupoId: grupoDe.get(perfil.id as string) ?? null })),
      invitaciones: (invitaciones.data ?? []).filter((fila) => !registrados.has(fila.correo as string)).map((fila) => ({ correo: fila.correo as string, rol: fila.rol as Rol, grupoId: fila.grupo_id as string | null })),
    };
  },

  async crearEdicion(nombre) {
    const { error } = await supabase!.from('ediciones').insert({ nombre });
    return mensaje(error);
  },

  async crearGrupo(edicion, nombre) {
    const { error } = await supabase!.from('grupos').insert({ edicion_id: edicion.id, nombre });
    return mensaje(error, 'Ya existe un grupo con ese nombre.');
  },

  async invitar(edicion, correos, rol, grupoId) {
    const filas = correos.map((correo) => ({ correo, rol, edicion_id: edicion.id, grupo_id: rol === 'estudiante' ? grupoId : null }));
    const { error } = await supabase!.from('correos_autorizados').upsert(filas, { onConflict: 'correo' });
    return mensaje(error);
  },

  async quitarInvitacion(correo) {
    const { error } = await supabase!.from('correos_autorizados').delete().eq('correo', correo);
    return mensaje(error);
  },

  async cambiarRol(persona, rol) {
    const { error } = await supabase!.rpc('asignar_rol', { p_perfil: persona.id, p_rol: rol });
    if (error) return FALLO;
    await supabase!.from('correos_autorizados').update({ rol }).eq('correo', persona.correo.toLowerCase());
    return null;
  },

  async moverDeGrupo(edicion, persona, grupoId) {
    const { error } = await supabase!.from('matriculas').upsert({ perfil_id: persona.id, edicion_id: edicion.id, grupo_id: grupoId }, { onConflict: 'perfil_id,edicion_id' });
    return mensaje(error);
  },
};

export const correosDeTexto = (texto: string) =>
  [...new Set(texto.split(/[\s,;]+/).map((parte) => parte.trim().toLowerCase()).filter(Boolean))];

export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
