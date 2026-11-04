import { modoDemo, supabase } from './supabase';

type OrigenError = 'ventana' | 'promesa' | 'interfaz';

const MAXIMO_POR_SESION = 10;
const REPETIDO_MS = 60_000;
const RUIDO = /ResizeObserver loop|^Script error\.?$/i;

const recientes = new Map<string, number>();
let enviados = 0;

// Guarda un error del navegador para que alguien se entere. Es de mejor esfuerzo, con tope por sesión y sin repetir
// el mismo mensaje seguido, y nunca interrumpe la app. Sin sesión no se guarda: la política de la tabla lo exige.
export async function reportarError(origen: OrigenError, error: unknown, contexto = '') {
  if (modoDemo || !supabase || enviados >= MAXIMO_POR_SESION) return;
  const mensaje = error instanceof Error ? error.message : String(error ?? '');
  if (!mensaje || RUIDO.test(mensaje)) return;
  const ahora = Date.now();
  const llave = `${origen}:${mensaje}`;
  if (ahora - (recientes.get(llave) ?? 0) < REPETIDO_MS) return;
  recientes.set(llave, ahora);
  try {
    const { data: sesion } = await supabase.auth.getSession();
    const perfilId = sesion.session?.user.id;
    if (!perfilId) return;
    enviados += 1;
    const pila = `${error instanceof Error ? error.stack ?? '' : ''}${contexto}`.slice(0, 4000);
    await supabase.from('errores_cliente').insert({
      perfil_id: perfilId,
      origen,
      mensaje: mensaje.slice(0, 500),
      pila: pila || null,
      ruta: window.location.hash.slice(0, 200),
      agente: navigator.userAgent.slice(0, 300),
    });
  } catch {
    return;
  }
}

export function instalarReporteDeErrores() {
  window.addEventListener('error', (evento) => void reportarError('ventana', evento.error ?? evento.message));
  window.addEventListener('unhandledrejection', (evento) => void reportarError('promesa', evento.reason));
}
