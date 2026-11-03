import { supabase } from './supabase';

export const leerProgreso = async <T>(clave: string): Promise<T | null> => {
  if (!supabase) return null;
  try {
    const { data: sesion } = await supabase.auth.getSession();
    const perfilId = sesion.session?.user.id;
    if (!perfilId) return null;
    const { data, error } = await supabase.from('progreso_usuario').select('valor').eq('perfil_id', perfilId).eq('clave', clave).maybeSingle();
    return error ? null : ((data?.valor as T | undefined) ?? null);
  } catch {
    return null;
  }
};

export const guardarProgreso = async (clave: string, valor: unknown) => {
  if (!supabase) return;
  try {
    const { data: sesion } = await supabase.auth.getSession();
    const perfilId = sesion.session?.user.id;
    if (!perfilId) return;
    await supabase.from('progreso_usuario').upsert({ perfil_id: perfilId, clave, valor }, { onConflict: 'perfil_id,clave' });
  } catch {
    // el progreso también queda en el navegador
  }
};
