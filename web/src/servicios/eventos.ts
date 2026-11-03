import { modoDemo, supabase } from './supabase';

interface OpcionesEvento {
  edicionId?: string | null;
  entidad?: string;
  entidadId?: string;
  datos?: Record<string, unknown>;
}

interface FilaEvento {
  tipo: string;
  edicion_id: string | null;
  entidad: string | null;
  entidad_id: string | null;
  datos: Record<string, unknown>;
  creado_en: string;
}

const ESPERA_MS = 2500;
const FALLOS_PARA_APAGAR = 3;

let cola: FilaEvento[] = [];
let temporizador: number | undefined;
let fallos = 0;

const vaciar = async () => {
  window.clearTimeout(temporizador);
  temporizador = undefined;
  if (cola.length === 0 || !supabase || fallos >= FALLOS_PARA_APAGAR) return;
  const lote = cola;
  cola = [];
  const { data: sesion } = await supabase.auth.getSession();
  const perfilId = sesion.session?.user.id;
  if (!perfilId) return;
  const { error } = await supabase.from('eventos').insert(lote.map((fila) => ({ ...fila, perfil_id: perfilId })));
  fallos = error ? fallos + 1 : 0;
};

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void vaciar(); });
}

// Guarda un evento de uso (qué pantalla viste, un paso del tutorial…). Es de mejor esfuerzo: nunca interrumpe la app.
// Los cambios de datos (entregas, matrículas, trabajos…) los registra la propia base con disparadores.
export function registrarEvento(tipo: string, opciones: OpcionesEvento = {}) {
  if (modoDemo || !supabase) return;
  cola.push({
    tipo,
    edicion_id: opciones.edicionId ?? null,
    entidad: opciones.entidad ?? null,
    entidad_id: opciones.entidadId ?? null,
    datos: opciones.datos ?? {},
    creado_en: new Date().toISOString(),
  });
  if (temporizador === undefined) temporizador = window.setTimeout(() => void vaciar(), ESPERA_MS);
}
