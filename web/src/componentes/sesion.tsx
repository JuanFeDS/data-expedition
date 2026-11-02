import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { direccionDeRetorno, modoDemo, supabase } from '../servicios/supabase';
import type { Rol } from './navegacion';

export interface Persona {
  id: string;
  correo: string;
  nombre: string | null;
  rol: Rol;
}

export type ResultadoEnvio = { ok: true } | { ok: false; mensaje: string };

interface ValorSesion {
  modoDemo: boolean;
  cargando: boolean;
  persona: Persona | null;
  errorDeEnlace: string | null;
  enviarEnlace: (correo: string) => Promise<ResultadoEnvio>;
  cerrarSesion: () => Promise<void>;
}

const SIN_SESION: ValorSesion = {
  modoDemo: true,
  cargando: false,
  persona: null,
  errorDeEnlace: null,
  enviarEnlace: async () => ({ ok: false, mensaje: 'La conexión no está activa.' }),
  cerrarSesion: async () => undefined,
};

const ContextoSesion = createContext<ValorSesion>(SIN_SESION);

export const useSesion = () => useContext(ContextoSesion);

const MENSAJES_DE_ENLACE: Record<string, string> = {
  otp_expired: 'El enlace venció o ya se usó. Pide uno nuevo.',
  access_denied: 'No pudimos validar ese enlace. Pide uno nuevo.',
};

const leerErrorDeEnlace = () => {
  const fragmento = window.location.hash.replace(/^#\/?/, '');
  if (!fragmento.includes('error')) return null;
  const parametros = new URLSearchParams(fragmento);
  const codigo = parametros.get('error_code') ?? parametros.get('error') ?? '';
  return MENSAJES_DE_ENLACE[codigo] ?? 'No pudimos validar ese enlace. Pide uno nuevo.';
};

const limpiarDireccion = () => {
  const direccion = new URL(window.location.href);
  const habia = ['code', 'error', 'error_code', 'error_description'].some((nombre) => direccion.searchParams.has(nombre));
  ['code', 'error', 'error_code', 'error_description'].forEach((nombre) => direccion.searchParams.delete(nombre));
  if (habia) window.history.replaceState(null, '', direccion.toString());
};

const traducirErrorDeEnvio = (mensaje: string, estado?: number) => {
  if (estado === 429 || /rate limit|too many/i.test(mensaje)) return 'Se enviaron muchos enlaces seguidos. Espera unos minutos e intenta de nuevo.';
  if (/signups not allowed|not allowed/i.test(mensaje)) return 'Ese correo no está autorizado para entrar.';
  if (/invalid/i.test(mensaje) && /email/i.test(mensaje)) return 'Revisa el correo: no parece válido.';
  return 'No pudimos enviar el enlace. Intenta de nuevo en un momento.';
};

export function SesionProvider({ children }: { children: ReactNode }) {
  const activo = !modoDemo && supabase !== null;
  const [cargando, setCargando] = useState(activo);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [errorDeEnlace, setErrorDeEnlace] = useState<string | null>(activo ? leerErrorDeEnlace : null);

  const cargarPersona = useCallback(async (sesion: Session | null) => {
    if (!supabase || !sesion) {
      setPersona(null);
      setCargando(false);
      return;
    }
    const { data, error } = await supabase.from('perfiles').select('id, correo, nombre, rol').eq('id', sesion.user.id).maybeSingle();
    setPersona(error || !data ? null : (data as Persona));
    setCargando(false);
  }, []);

  useEffect(() => {
    if (!activo || !supabase) return undefined;
    if (errorDeEnlace) window.location.hash = '#/e0';
    const cliente = supabase;
    void cliente.auth.getSession().then(({ data }) => {
      limpiarDireccion();
      void cargarPersona(data.session);
    });
    const { data: suscripcion } = cliente.auth.onAuthStateChange((_evento, sesion) => {
      window.setTimeout(() => void cargarPersona(sesion), 0);
    });
    return () => suscripcion.subscription.unsubscribe();
  }, [activo, cargarPersona, errorDeEnlace]);

  const enviarEnlace = useCallback(async (correo: string): Promise<ResultadoEnvio> => {
    if (!supabase) return { ok: false, mensaje: 'La conexión no está activa.' };
    setErrorDeEnlace(null);
    const { error } = await supabase.auth.signInWithOtp({ email: correo.trim(), options: { emailRedirectTo: direccionDeRetorno() } });
    return error ? { ok: false, mensaje: traducirErrorDeEnvio(error.message, error.status) } : { ok: true };
  }, []);

  const cerrarSesion = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setPersona(null);
    window.location.hash = '#/e0';
  }, []);

  const valor = useMemo<ValorSesion>(
    () => ({ modoDemo: !activo, cargando, persona, errorDeEnlace, enviarEnlace, cerrarSesion }),
    [activo, cargando, persona, errorDeEnlace, enviarEnlace, cerrarSesion],
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}
