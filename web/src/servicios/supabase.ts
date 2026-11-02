import { createClient } from '@supabase/supabase-js';
import { almacenamientoDeSesion } from './almacenamiento';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const clave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const hayConexion = Boolean(url && clave);

export const modoDemo = !hayConexion || window.location.search.includes('demo');

export const supabase = hayConexion
  ? createClient(url as string, clave as string, {
      auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true, storage: almacenamientoDeSesion },
    })
  : null;

export const direccionDeRetorno = () => `${window.location.origin}${import.meta.env.BASE_URL}`;
