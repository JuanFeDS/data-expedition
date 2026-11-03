import { valorDimension } from '../dominio/radar.ts';
import { UMBRAL_NIVELACION, UMBRAL_PROFUNDIZACION } from '../dominio/reglas';
import { registrarEvento } from './eventos';
import { supabase } from './supabase';

export interface DimensionCurso { id: string; nombre: string }
export interface PuntoRadar { id: string; nombre: string; inicio: number; ahora: number; tieneInicio: boolean; tieneEvidencia: boolean }
export interface Diagnostico { dimensionId: string; autoinforme: number | null; conIa: number | null; sinIa: number | null }
export type RutaCurso = 'nivelacion' | 'estandar' | 'profundizacion';

export { UMBRAL_NIVELACION, UMBRAL_PROFUNDIZACION };

const FALLO = 'No pudimos guardar el cambio. Intenta de nuevo.';

export const rutaDeEstudiante = (datosSinIa: number | null): RutaCurso | null => {
  if (datosSinIa === null) return null;
  return datosSinIa < UMBRAL_NIVELACION ? 'nivelacion' : datosSinIa > UMBRAL_PROFUNDIZACION ? 'profundizacion' : 'estandar';
};

export const rutaPropuestaDelCurso = (porcentajeEnNivel: number): RutaCurso => (porcentajeEnNivel < 50 ? 'nivelacion' : porcentajeEnNivel > 80 ? 'profundizacion' : 'estandar');

export const dimensionesDelCurso = async (cursoId: string): Promise<DimensionCurso[]> => {
  const { data, error } = await supabase!.from('dimensiones').select('id, nombre').eq('edicion_id', cursoId).order('orden');
  if (error) throw error;
  return (data ?? []).map((fila) => ({ id: fila.id as string, nombre: fila.nombre as string }));
};

interface Evidencia { dimension_id: string; fuente: string; valor: number | string; peso: number | string }

const promedio = (filas: Evidencia[]) => valorDimension(filas.map((fila) => ({ valor: Number(fila.valor), peso: Number(fila.peso) }))) ?? 0;

export const calcularRadar = (dimensiones: DimensionCurso[], evidencias: Evidencia[]): PuntoRadar[] => dimensiones.map((dimension) => {
  const propias = evidencias.filter((evidencia) => evidencia.dimension_id === dimension.id);
  const iniciales = propias.filter((evidencia) => evidencia.fuente === 'diagnostico_inicial');
  const inicio = iniciales.length > 0 ? Math.round(promedio(iniciales)) : 0;
  const ahora = propias.length > 0 ? Math.round(promedio(propias)) : 0;
  return { id: dimension.id, nombre: dimension.nombre, inicio, ahora, tieneInicio: iniciales.length > 0, tieneEvidencia: propias.length > 0 };
});

export const miRadar = async (cursoId: string): Promise<PuntoRadar[]> => {
  const { data: sesion } = await supabase!.auth.getSession();
  const yo = sesion.session?.user.id;
  const dimensiones = await dimensionesDelCurso(cursoId);
  if (!yo || dimensiones.length === 0) return calcularRadar(dimensiones, []);
  const { data, error } = await supabase!.from('evidencias_radar').select('dimension_id, fuente, valor, peso').eq('perfil_id', yo).in('dimension_id', dimensiones.map((dimension) => dimension.id));
  if (error) throw error;
  return calcularRadar(dimensiones, (data ?? []) as Evidencia[]);
};

const aDiagnostico = (fila: Record<string, unknown>): Diagnostico => ({
  dimensionId: fila.dimension_id as string,
  autoinforme: fila.autoinforme as number | null,
  conIa: fila.con_ia === null ? null : Number(fila.con_ia),
  sinIa: fila.sin_ia === null ? null : Number(fila.sin_ia),
});

export const miDiagnostico = async (cursoId: string): Promise<{ dimensiones: DimensionCurso[]; filas: Diagnostico[] }> => {
  const dimensiones = await dimensionesDelCurso(cursoId);
  if (dimensiones.length === 0) return { dimensiones, filas: [] };
  const { data: sesion } = await supabase!.auth.getSession();
  const yo = sesion.session?.user.id;
  if (!yo) return { dimensiones, filas: [] };
  const { data, error } = await supabase!.from('diagnosticos').select('dimension_id, autoinforme, con_ia, sin_ia').eq('perfil_id', yo).in('dimension_id', dimensiones.map((dimension) => dimension.id));
  if (error) throw error;
  return { dimensiones, filas: (data ?? []).map(aDiagnostico) };
};

export const guardarAutoinforme = async (cursoId: string, valores: Record<string, number>): Promise<string | null> => {
  const carga = Object.entries(valores).map(([dimension_id, autoinforme]) => ({ dimension_id, autoinforme }));
  const { error } = await supabase!.rpc('guardar_autoinforme', { p_valores: carga });
  if (error) return FALLO;
  registrarEvento('autoinforme_guardado', { edicionId: cursoId, entidad: 'diagnostico', datos: { dimensiones: carga.length } });
  return null;
};

export const diagnosticosDelCurso = async (cursoId: string): Promise<Map<string, Diagnostico[]>> => {
  const dimensiones = await dimensionesDelCurso(cursoId);
  const mapa = new Map<string, Diagnostico[]>();
  if (dimensiones.length === 0) return mapa;
  const { data, error } = await supabase!.from('diagnosticos').select('perfil_id, dimension_id, autoinforme, con_ia, sin_ia').in('dimension_id', dimensiones.map((dimension) => dimension.id));
  if (error) throw error;
  (data ?? []).forEach((fila) => {
    const perfil = fila.perfil_id as string;
    mapa.set(perfil, [...(mapa.get(perfil) ?? []), aDiagnostico(fila)]);
  });
  return mapa;
};

export const registrarDiagnostico = async (cursoId: string, perfilId: string, valores: { dimensionId: string; conIa: number | null; sinIa: number | null }[]): Promise<string | null> => {
  const carga = valores.map((valor) => ({ dimension_id: valor.dimensionId, con_ia: valor.conIa, sin_ia: valor.sinIa }));
  const { error } = await supabase!.rpc('registrar_diagnostico', { p_perfil: perfilId, p_valores: carga });
  if (error) return FALLO;
  registrarEvento('diagnostico_registrado', { edicionId: cursoId, entidad: 'perfil', entidadId: perfilId });
  return null;
};

export const rutaGuardada = async (cursoId: string): Promise<RutaCurso | null> => {
  const { data, error } = await supabase!.from('ediciones').select('ruta_curso').eq('id', cursoId).maybeSingle();
  if (error) throw error;
  return (data?.ruta_curso as RutaCurso | null) ?? null;
};

export const confirmarRuta = async (cursoId: string, ruta: RutaCurso): Promise<string | null> => {
  const { error } = await supabase!.from('ediciones').update({ ruta_curso: ruta }).eq('id', cursoId);
  return error ? FALLO : null;
};
