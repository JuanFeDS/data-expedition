export interface DimensionRadar {
  nombre: string;
  inicio: number;
  ahora: number;
}

export const dimensiones: DimensionRadar[] = [
  { nombre: 'Datos', inicio: 40, ahora: 62 },
  { nombre: 'Análisis', inicio: 35, ahora: 55 },
  { nombre: 'Modelado', inicio: 25, ahora: 48 },
  { nombre: 'Validación', inicio: 30, ahora: 30 },
  { nombre: 'Comunicación', inicio: 55, ahora: 70 },
  { nombre: 'Producción', inicio: 20, ahora: 34 },
  { nombre: 'Dirección de IA', inicio: 45, ahora: 66 },
];

export interface CriterioNota {
  nombre: string;
  dimension: string;
  nivel: number;
  peso: number;
}

export const criteriosTrabajo1: CriterioNota[] = [
  { nombre: 'Limpieza de datos', dimension: 'Datos', nivel: 4.5, peso: 2 },
  { nombre: 'Preguntas de análisis', dimension: 'Análisis', nivel: 5, peso: 2 },
  { nombre: 'Visualización', dimension: 'Comunicación', nivel: 4, peso: 1 },
  { nombre: 'Reproducibilidad', dimension: 'Producción', nivel: 3.5, peso: 1 },
  { nombre: 'Bitácora de IA', dimension: 'Dirección de IA', nivel: 4, peso: 1 },
];

export type EstadoHito = 'hecho' | 'actual' | 'bloqueado' | 'cima';

export interface HitoRuta {
  kicker: string;
  titulo: string;
  estado: EstadoHito;
  meta?: string;
  nota?: string;
  radar?: string[];
  fecha?: { dia: string; numero: string };
  accion?: { texto: string; ruta: string };
}

export const hitosRuta: HitoRuta[] = [
  { kicker: 'Semana 1', titulo: 'Diagnóstico', estado: 'hecho', meta: 'Punto de partida fijado' },
  { kicker: 'Semanas 2–3', titulo: 'Trabajo 1', estado: 'hecho', nota: '4.2', radar: ['Datos +12', 'Análisis +9', 'Modelado +8'] },
  { kicker: 'Estás aquí · Semanas 4–5', titulo: 'Trabajo 2', estado: 'actual', fecha: { dia: 'VIE', numero: '7' }, meta: 'Modelo predictivo · vence el viernes 7', accion: { texto: 'Entregar', ruta: '#/e6' } },
  { kicker: 'Semana 6', titulo: 'Trabajo 3', estado: 'bloqueado', meta: 'Se abre al entregar el Trabajo 2' },
  { kicker: 'La cima · Semana 8', titulo: 'Proyecto final', estado: 'cima', meta: 'Misión en equipo · faltan 4 semanas' },
];

export const consejosJaguar = [
  'Una entrega más y ves la cima. Toca de nuevo y te cuento cómo funciona todo.',
  'Tu ruta muestra los trabajos del curso. Lo que sigue es lo que está en amarillo.',
  'El radar compara cómo vas con tu punto de partida, no con tus compañeros.',
  'Al entregar, declara si usaste IA. Las dos opciones valen igual; se evalúan habilidades distintas.',
  'El XP no es nota: lo ganas con lecciones y misiones y desbloquea retos opcionales.',
  'Las lecciones de 5 minutos suman práctica a tu radar, con un tope por semana.',
  'Cada semana te llega un resumen con lo que subió y qué practicar. Míralo en Resumen.',
  'Cada módulo tu grupo vota cómo jugar: colaborativo o competitivo. Tu voto es anónimo.',
  '¿Te perdiste? Abre el menú (los cuatro cuadritos) o mira el tutorial completo.',
];

export const pasosTutorial = [
  { icono: 'ruta', titulo: 'Tu ruta', texto: 'Cada punto del camino es un trabajo del curso. Lo recorrido va en menta, lo que sigue en amarillo y lo bloqueado se abre al entregar el anterior.' },
  { icono: 'radar', titulo: 'Tu radar', texto: 'Mide tus habilidades en varias dimensiones y las compara con tu punto de partida del diagnóstico. Nunca con tus compañeros.' },
  { icono: 'notas', titulo: 'Notas y retroalimentación', texto: 'Cada trabajo se califica con una rúbrica de 5 niveles. Ves qué nivel sacaste en cada criterio y cómo se calculó la nota de 1.0 a 5.0.' },
  { icono: 'entregas', titulo: 'Entregas y uso de IA', texto: 'Puedes usar IA, pero debes declararlo al entregar y contar tu bitácora: qué pediste, qué aceptaste y qué descartaste.' },
  { icono: 'leccion', titulo: 'Lecciones y XP', texto: 'Lecciones de 5 minutos para practicar desde el celular. Al cerrar un módulo ganas su gema y se desbloquean sus preguntas de repaso. Dan XP (que no es nota) y un aporte pequeño a tu radar, con tope semanal.' },
  { icono: 'equipo', titulo: 'Votaciones y equipos', texto: 'Cada módulo tu grupo vota cómo jugar. En la misión final trabajas en equipo y cada quien responde por su rol.' },
  { icono: 'resumen', titulo: 'Tu resumen semanal', texto: 'Cada semana recibes lo que subió, lo que conviene vigilar y qué hacer después, en la app y en tu correo institucional.' },
] as const;

export type Bioma = 'selva' | 'paramo' | 'costa' | 'volcan' | 'desierto' | 'glaciar' | 'cueva' | 'ruinas';

export interface RegionCurso {
  nombre: string;
  modulo: string;
  semanas: string;
  bioma: Bioma;
  estado: 'hecha' | 'actual' | 'pendiente';
  hitos: string[];
  frase: string;
}

export const regionesCurso: RegionCurso[] = [
  { nombre: 'Valle de los Datos', modulo: 'Datos', semanas: '1', bioma: 'selva', estado: 'hecha', hitos: ['Diagnóstico'], frase: 'Aquí empezó todo: fijaste tu punto de partida con el diagnóstico.' },
  { nombre: 'Páramo de la Limpieza', modulo: 'Datos', semanas: '2', bioma: 'paramo', estado: 'hecha', hitos: [], frase: 'En el Páramo se aprende lo menos vistoso y más importante: limpiar los datos.' },
  { nombre: 'Costa de la Exploración', modulo: 'Análisis', semanas: '3', bioma: 'costa', estado: 'hecha', hitos: ['Trabajo 1'], frase: 'Brisa de mar y datos por explorar: la Costa te enseñó a hacer buenas preguntas.' },
  { nombre: 'Desierto del Modelado', modulo: 'Modelado', semanas: '4', bioma: 'desierto', estado: 'actual', hitos: ['Trabajo 2'], frase: 'Bienvenido al Desierto: aquí un modelo predictivo se pone a prueba. ¡Tú puedes!' },
  { nombre: 'Cueva de los Modelos', modulo: 'Modelado', semanas: '5', bioma: 'cueva', estado: 'pendiente', hitos: [], frase: 'La Cueva de los Modelos aún no está disponible. Se abre en la semana 5.' },
  { nombre: 'Ruinas de la Validación', modulo: 'Validación', semanas: '6', bioma: 'ruinas', estado: 'pendiente', hitos: ['Trabajo 3'], frase: 'Las Ruinas de la Validación aún no están disponibles. Se abren en la semana 6.' },
  { nombre: 'Glaciar de la Comunicación', modulo: 'Comunicación', semanas: '7', bioma: 'glaciar', estado: 'pendiente', hitos: [], frase: 'El Glaciar de la Comunicación aún no está disponible. Se abre en la semana 7.' },
  { nombre: 'El Volcán', modulo: 'Proyecto final', semanas: '8', bioma: 'volcan', estado: 'pendiente', hitos: ['Proyecto final'], frase: 'El Volcán aún no está disponible. Es la cima y se abre en la semana 8.' },
];

export interface GemaCurso {
  gema: string;
  nombre: string;
  dimension: string;
  cierraCon: string;
}

export const gemasCurso: GemaCurso[] = [
  { gema: 'esmeralda', nombre: 'Esmeralda Semilla', dimension: 'Datos', cierraCon: 'Datos' },
  { gema: 'topacio', nombre: 'Topacio Faro', dimension: 'Análisis', cierraCon: 'Análisis' },
  { gema: 'zafiro', nombre: 'Zafiro del Oasis', dimension: 'Modelado', cierraCon: 'Modelado' },
  { gema: 'peridoto', nombre: 'Peridoto Centinela', dimension: 'Validación', cierraCon: 'Validación' },
  { gema: 'aguamarina', nombre: 'Aguamarina Eco', dimension: 'Comunicación', cierraCon: 'Comunicación' },
  { gema: 'ambar', nombre: 'Ámbar Brasa', dimension: 'Producción', cierraCon: 'Análisis' },
  { gema: 'opalo', nombre: 'Ópalo Aurora', dimension: 'Dirección de IA', cierraCon: 'Análisis' },
  { gema: 'rubi', nombre: 'Rubí del Volcán', dimension: 'Proyecto final', cierraCon: 'Proyecto final' },
];

const moduloCerrado = (modulo: string) => {
  const regiones = regionesCurso.filter((region) => region.modulo === modulo);
  return regiones.length > 0 && regiones.every((region) => region.estado === 'hecha');
};

export const gemasGanadas = gemasCurso.filter((gema) => moduloCerrado(gema.cierraCon));

export type Dificultad = 'básica' | 'media' | 'alta';
export const dificultadPara = (valor: number): Dificultad => (valor >= 60 ? 'alta' : valor >= 40 ? 'media' : 'básica');

export const temaDeRepaso = () => {
  const ganadas = gemasGanadas
    .map((gema) => ({ gema, valor: dimensiones.find((dimension) => dimension.nombre === gema.dimension)?.ahora }))
    .filter((item): item is { gema: GemaCurso; valor: number } => item.valor !== undefined);
  return ganadas.reduce((peor, item) => (item.valor < peor.valor ? item : peor), ganadas[0]);
};
