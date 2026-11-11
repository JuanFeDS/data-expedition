import { vi } from 'vitest';

// Cliente de Supabase falso para probar los servicios sin red. Cada consulta encadenada
// (from().select().eq()…) devuelve el resultado configurado y guarda qué métodos se llamaron.

export interface Resultado { data?: unknown; error?: { message: string; code?: string } | null; count?: number | null }
export interface Operacion { metodo: string; args: unknown[] }
export interface ConsultaRegistrada { tabla: string; operaciones: Operacion[] }
type Definicion = Resultado | ((operaciones: Operacion[]) => Resultado);

export const consultas: ConsultaRegistrada[] = [];

export const supabaseSimulado = {
  from: vi.fn(),
  rpc: vi.fn(),
  auth: { getSession: vi.fn(), signInAnonymously: vi.fn() },
};

const completar = (resultado: Resultado) => ({ data: null, error: null, count: null, ...resultado });

const crearConsulta = (obtener: () => Resultado, operaciones: Operacion[]): unknown => {
  const consulta: unknown = new Proxy({}, {
    get(_, propiedad) {
      if (propiedad === 'then') {
        return (alExito: (valor: unknown) => unknown, alFallo: (razon: unknown) => unknown) => Promise.resolve(completar(obtener())).then(alExito, alFallo);
      }
      return (...args: unknown[]) => {
        operaciones.push({ metodo: String(propiedad), args });
        return consulta;
      };
    },
  });
  return consulta;
};

export function simular(opciones: { tablas?: Record<string, Definicion>; rpc?: Record<string, Definicion>; usuario?: string | null } = {}) {
  const { tablas = {}, rpc = {}, usuario = 'yo' } = opciones;
  consultas.length = 0;
  supabaseSimulado.from.mockReset();
  supabaseSimulado.rpc.mockReset();
  supabaseSimulado.auth.getSession.mockReset();
  supabaseSimulado.auth.signInAnonymously.mockReset().mockResolvedValue({ data: {}, error: null });
  supabaseSimulado.from.mockImplementation((tabla: string) => {
    const operaciones: Operacion[] = [];
    consultas.push({ tabla, operaciones });
    const definicion = tablas[tabla] ?? {};
    return crearConsulta(() => (typeof definicion === 'function' ? definicion(operaciones) : definicion), operaciones);
  });
  supabaseSimulado.rpc.mockImplementation((nombre: string) => {
    const definicion = rpc[nombre] ?? {};
    return Promise.resolve(completar(typeof definicion === 'function' ? definicion([]) : definicion));
  });
  supabaseSimulado.auth.getSession.mockResolvedValue({ data: { session: usuario ? { user: { id: usuario } } : null } });
}

export const operacionesDe = (tabla: string) => consultas.filter((consulta) => consulta.tabla === tabla).flatMap((consulta) => consulta.operaciones);
export const llamo = (tabla: string, metodo: string) => operacionesDe(tabla).some((operacion) => operacion.metodo === metodo);
