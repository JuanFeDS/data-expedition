import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { direccionDeRetorno, modoDemo, supabase } from '../servicios/supabase';
import type { Rol } from './navegacion';

export interface Persona {
  id: string;
  correo: string;
  nombre: string | null;
  usuario: string | null;
  rol: Rol;
}

export type ResultadoEnvio = { ok: true } | { ok: false; mensaje: string };

interface ValorSesion {
  modoDemo: boolean;
  cargando: boolean;
  persona: Persona | null;
  errorDeEnlace: string | null;
  enviarEnlace: (correo: string, crearCuenta: boolean) => Promise<ResultadoEnvio>;
  entrarConGoogle: () => Promise<ResultadoEnvio>;
  cerrarSesion: () => Promise<void>;
  guardarPerfil: (nombre: string, usuario: string) => Promise<ResultadoEnvio>;
}

const SIN_SESION: ValorSesion = {
  modoDemo: true,
  cargando: false,
  persona: null,
  errorDeEnlace: null,
  enviarEnlace: async () => ({ ok: false, mensaje: 'La conexión no está activa.' }),
  entrarConGoogle: async () => ({ ok: false, mensaje: 'La conexión no está activa.' }),
  cerrarSesion: async () => undefined,
  guardarPerfil: async () => ({ ok: false, mensaje: 'La conexión no está activa.' }),
};

const ContextoSesion = createContext<ValorSesion>(SIN_SESION);

export const useSesion = () => useContext(ContextoSesion);

const MENSAJES_DE_ENLACE: Record<string, string> = {
  otp_expired: 'El enlace venció o ya se usó. Pide uno nuevo.',
  access_denied: 'No pudimos validar ese enlace. Pide uno nuevo.',
};

const NO_AUTORIZADO = 'Ese correo no está autorizado. Pide a tu docente que lo agregue.';

const leerErrorDeEnlace = () => {
  const fragmento = window.location.hash.replace(/^#\/?/, '');
  const consulta = new URLSearchParams(window.location.search);
  if (consulta.has('error') && /database error|correo_no_autorizado/i.test(consulta.get('error_description') ?? '')) return NO_AUTORIZADO;
  if (!fragmento.includes('error')) return consulta.has('error') ? 'No pudimos validar el acceso. Intenta de nuevo.' : null;
  const parametros = new URLSearchParams(fragmento);
  const codigo = parametros.get('error_code') ?? parametros.get('error') ?? '';
  return MENSAJES_DE_ENLACE[codigo] ?? 'No pudimos validar ese enlace. Pide uno nuevo.';
};

const SIN_SESION_TRAS_REGRESO = 'No pudimos completar el ingreso en este navegador. Si usas una pestaña privada, abre el sitio en una pestaña normal e inténtalo de nuevo.';

const regresaConCodigo = () => new URLSearchParams(window.location.search).has('code');

const limpiarDireccion = () => {
  const direccion = new URL(window.location.href);
  const habia = ['code', 'error', 'error_code', 'error_description'].some((nombre) => direccion.searchParams.has(nombre));
  ['code', 'error', 'error_code', 'error_description'].forEach((nombre) => direccion.searchParams.delete(nombre));
  if (habia) window.history.replaceState(null, '', direccion.toString());
};

const traducirErrorDeEnvio = (mensaje: string, estado: number | undefined, crearCuenta: boolean) => {
  if (estado === 429 || /rate limit|too many/i.test(mensaje)) return 'Se enviaron muchos enlaces seguidos. Espera unos minutos e intenta de nuevo.';
  if (/database error|correo_no_autorizado/i.test(mensaje)) return NO_AUTORIZADO;
  if (/signups not allowed|not allowed/i.test(mensaje)) return crearCuenta ? 'Ese correo no está autorizado para registrarse.' : 'No hay una cuenta con ese correo. Usa «Crear cuenta».';
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
    const { data, error } = await supabase.from('perfiles').select('id, correo, nombre, usuario, rol').eq('id', sesion.user.id).maybeSingle();
    setPersona(error || !data ? null : (data as Persona));
    setCargando(false);
  }, []);

  useEffect(() => {
    if (!activo || !supabase) return undefined;
    if (errorDeEnlace) window.location.hash = '#/e0';
    const cliente = supabase;
    const veniaDeUnEnlace = regresaConCodigo();
    void cliente.auth.getSession().then(({ data }) => {
      limpiarDireccion();
      if (veniaDeUnEnlace && !data.session) setErrorDeEnlace(SIN_SESION_TRAS_REGRESO);
      void cargarPersona(data.session);
    });
    const { data: suscripcion } = cliente.auth.onAuthStateChange((_evento, sesion) => {
      window.setTimeout(() => void cargarPersona(sesion), 0);
    });
    return () => suscripcion.subscription.unsubscribe();
  }, [activo, cargarPersona, errorDeEnlace]);

  const enviarEnlace = useCallback(async (correo: string, crearCuenta: boolean): Promise<ResultadoEnvio> => {
    if (!supabase) return { ok: false, mensaje: 'La conexión no está activa.' };
    setErrorDeEnlace(null);
    const { error } = await supabase.auth.signInWithOtp({ email: correo.trim(), options: { emailRedirectTo: direccionDeRetorno(), shouldCreateUser: crearCuenta } });
    return error ? { ok: false, mensaje: traducirErrorDeEnvio(error.message, error.status, crearCuenta) } : { ok: true };
  }, []);

  const entrarConGoogle = useCallback(async (): Promise<ResultadoEnvio> => {
    if (!supabase) return { ok: false, mensaje: 'La conexión no está activa.' };
    setErrorDeEnlace(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: direccionDeRetorno(), queryParams: { prompt: 'select_account' } } });
    return error ? { ok: false, mensaje: 'No pudimos abrir Google. Intenta de nuevo.' } : { ok: true };
  }, []);

  const cerrarSesion = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setPersona(null);
    window.location.hash = '#/e0';
  }, []);

  const guardarPerfil = useCallback(async (nombre: string, usuario: string): Promise<ResultadoEnvio> => {
    if (!supabase || !persona) return { ok: false, mensaje: 'La conexión no está activa.' };
    const { error } = await supabase.from('perfiles').update({ nombre: nombre.trim(), usuario: usuario.trim().toLowerCase() }).eq('id', persona.id);
    if (error) {
      return { ok: false, mensaje: error.code === '23505' ? 'Ese usuario ya está en uso. Prueba con otro.' : 'No pudimos guardar tu perfil. Intenta de nuevo.' };
    }
    setPersona({ ...persona, nombre: nombre.trim(), usuario: usuario.trim().toLowerCase() });
    return { ok: true };
  }, [persona]);

  const valor = useMemo<ValorSesion>(
    () => ({ modoDemo: !activo, cargando, persona, errorDeEnlace, enviarEnlace, entrarConGoogle, cerrarSesion, guardarPerfil }),
    [activo, cargando, persona, errorDeEnlace, enviarEnlace, entrarConGoogle, cerrarSesion, guardarPerfil],
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}
