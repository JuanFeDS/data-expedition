import { supabase } from './supabase';

export interface EstadoClase {
  abierta: boolean;
  codigo: string | null;
  hasta: string | null;
  abiertaEn: string | null;
  invitados: number;
}

export interface FilaMarcador {
  perfilId: string;
  apodo: string;
  esInvitado: boolean;
  aciertos: number;
  respondidas: number;
  puntos: number;
}

export type ResultadoEntrada = { ok: true; cursoId: string } | { ok: false; mensaje: string };

const SIN_CONEXION = 'La conexión no está activa.';
const CARACTERES_DE_CODIGO = /[^A-Z2-9]/g;

export const limpiarCodigo = (texto: string) => texto.toUpperCase().replace(CARACTERES_DE_CODIGO, '').slice(0, 5);

export const recargarApp = () => window.location.reload();

export const enlaceDeEntrada = (codigo: string) => `${window.location.origin}${window.location.pathname}#/entrar?codigo=${codigo}`;

const traducirErrorDeEntrada = (mensaje: string, estado: number | undefined) => {
  if (/codigo_invalido/i.test(mensaje)) return 'Ese código no es válido o la clase ya cerró. Pídele el código al docente.';
  if (/apodo/i.test(mensaje)) return 'El apodo debe tener entre 2 y 20 caracteres.';
  if (/anonymous sign-ins are disabled|anonymous_provider_disabled/i.test(mensaje)) return 'La entrada como invitado todavía no está activa. Avisa al docente.';
  if (estado === 429 || /rate limit|too many/i.test(mensaje)) return 'Demasiados intentos seguidos. Espera un momento e inténtalo de nuevo.';
  if (/solo para invitados/i.test(mensaje)) return 'Ya iniciaste sesión con una cuenta. Esta entrada es solo para invitados.';
  return 'No pudimos entrar a la clase. Intenta de nuevo.';
};

// Quien llega con un código no tiene cuenta: se le abre una sesión anónima y se le matricula en la clase con su apodo.
// Si ya tenía una sesión de invitado en este navegador, se reutiliza para conservar su puntaje.
export async function entrarComoInvitado(codigo: string, apodo: string): Promise<ResultadoEntrada> {
  if (!supabase) return { ok: false, mensaje: SIN_CONEXION };
  const { data: actual } = await supabase.auth.getSession();
  if (!actual.session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) return { ok: false, mensaje: traducirErrorDeEntrada(error.message, error.status) };
  }
  const { data, error } = await supabase.rpc('unirse_como_invitado', { p_codigo: limpiarCodigo(codigo), p_apodo: apodo });
  if (error) return { ok: false, mensaje: traducirErrorDeEntrada(error.message, undefined) };
  return { ok: true, cursoId: data as string };
}

export async function estadoClase(cursoId: string): Promise<EstadoClase> {
  const { data, error } = await supabase!.rpc('estado_clase_invitados', { p_edicion: cursoId });
  if (error) throw new Error(error.message);
  const fila = data as { abierta: boolean; codigo: string | null; hasta: string | null; abierta_en: string | null; invitados: number };
  return { abierta: fila.abierta, codigo: fila.codigo, hasta: fila.hasta, abiertaEn: fila.abierta_en, invitados: fila.invitados };
}

export async function abrirClase(cursoId: string): Promise<string> {
  const { data, error } = await supabase!.rpc('abrir_clase_invitados', { p_edicion: cursoId });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function cerrarClase(cursoId: string): Promise<void> {
  const { error } = await supabase!.rpc('cerrar_clase_invitados', { p_edicion: cursoId });
  if (error) throw new Error(error.message);
}

export async function marcadorDeClase(cursoId: string, desde: string | null): Promise<FilaMarcador[]> {
  const { data, error } = await supabase!.rpc('marcador_clase', { p_edicion: cursoId, p_desde: desde });
  if (error) throw new Error(error.message);
  return (data as { perfil_id: string; apodo: string; es_invitado: boolean; aciertos: number; respondidas: number; puntos: number }[]).map((fila) => ({
    perfilId: fila.perfil_id, apodo: fila.apodo, esInvitado: fila.es_invitado, aciertos: fila.aciertos, respondidas: fila.respondidas, puntos: fila.puntos,
  }));
}
