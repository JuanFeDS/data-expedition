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

export const semanaActual = 4;
export const totalSemanas = 8;
export const rangoSemanaActual = '23 al 27 nov';

export interface Trabajo {
  codigo: string;
  titulo: string;
  tema: string;
  semana: number;
  estado: 'calificado' | 'actual' | 'pendiente';
  nota?: string;
  bioma: Bioma;
  vence: { dia: string; numero: string; largo: string };
  minPylint: number;
  declaracion?: 'Con IA' | 'Sin IA';
}

export const trabajos: Trabajo[] = [
  { codigo: 'T1', titulo: 'Trabajo 1', tema: 'EDA reproducible', semana: 2, estado: 'calificado', nota: '4.2', bioma: 'paramo', vence: { dia: 'VIE', numero: '13', largo: 'viernes 13 nov' }, minPylint: 6, declaracion: 'Con IA' },
  { codigo: 'T2', titulo: 'Trabajo 2', tema: 'Modelo frente a baseline', semana: 3, estado: 'calificado', nota: '3.8', bioma: 'desierto', vence: { dia: 'VIE', numero: '20', largo: 'viernes 20 nov' }, minPylint: 7, declaracion: 'Sin IA' },
  { codigo: 'T3', titulo: 'Trabajo 3', tema: 'Mismo análisis en Spark', semana: 4, estado: 'actual', bioma: 'cueva', vence: { dia: 'VIE', numero: '27', largo: 'viernes 27 nov' }, minPylint: 8 },
  { codigo: 'T4', titulo: 'Trabajo 4', tema: 'Dashboard con narrativa', semana: 5, estado: 'pendiente', bioma: 'glaciar', vence: { dia: 'VIE', numero: '4', largo: 'viernes 4 dic' }, minPylint: 8 },
  { codigo: 'T5', titulo: 'Trabajo 5', tema: 'Pipeline y backlog', semana: 6, estado: 'pendiente', bioma: 'costa', vence: { dia: 'VIE', numero: '11', largo: 'viernes 11 dic' }, minPylint: 8 },
  { codigo: 'T6', titulo: 'Trabajo 6', tema: 'Modelo optimizado e interpretado', semana: 7, estado: 'pendiente', bioma: 'ruinas', vence: { dia: 'VIE', numero: '18', largo: 'viernes 18 dic' }, minPylint: 8 },
  { codigo: 'T7', titulo: 'Proyecto final', tema: 'Integrador en equipo', semana: 8, estado: 'pendiente', bioma: 'volcan', vence: { dia: 'JUE', numero: '24', largo: 'jueves 24 dic' }, minPylint: 8 },
];

export const trabajoActual = trabajos.find((trabajo) => trabajo.estado === 'actual')!;
export const trabajoSiguiente = trabajos[trabajos.findIndex((trabajo) => trabajo.estado === 'actual') + 1];
export const calificados = trabajos.filter((trabajo) => trabajo.estado === 'calificado');
export const promedioNotas = calificados.reduce((suma, trabajo) => suma + Number(trabajo.nota), 0) / calificados.length;

export const hitosRuta: HitoRuta[] = [
  { kicker: 'Semana 1', titulo: 'Diagnóstico', estado: 'hecho', meta: 'Punto de partida fijado' },
  { kicker: 'Semana 2', titulo: 'Trabajo 1', estado: 'hecho', nota: '4.2', radar: ['Datos +12', 'Análisis +9', 'Producción +6'] },
  { kicker: 'Semana 3', titulo: 'Trabajo 2', estado: 'hecho', nota: '3.8', radar: ['Modelado +8', 'Validación +2'] },
  { kicker: `Estás aquí · Semana ${semanaActual}`, titulo: 'Trabajo 3', estado: 'actual', fecha: { dia: 'VIE', numero: '27' }, meta: 'Mismo análisis en Spark · vence el viernes 27', accion: { texto: 'Entregar', ruta: '#/e6' } },
  { kicker: 'Semana 5', titulo: 'Trabajo 4', estado: 'bloqueado', meta: 'Se abre al entregar el Trabajo 3' },
  { kicker: 'Semana 6', titulo: 'Trabajo 5', estado: 'bloqueado', meta: 'Pipeline y backlog' },
  { kicker: 'Semana 7', titulo: 'Trabajo 6', estado: 'bloqueado', meta: 'Modelo optimizado e interpretado' },
  { kicker: 'La cima · Semana 8', titulo: 'Proyecto final', estado: 'cima', meta: 'Integrador en equipo · faltan 4 semanas' },
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
  { icono: 'leccion', titulo: 'Lecciones y XP', texto: 'Lecciones de 5 minutos para practicar desde el celular. Al cerrar una isla ganas su gema y se abre su álbum con preguntas de repaso. En Practicar repasas todo lo visto, sin límite: suma racha y XP (que no es nota), y un aporte pequeño a tu radar, con tope semanal.' },
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
  { nombre: 'Valle de los Datos', modulo: 'Datos', semanas: '1', bioma: 'selva', estado: 'hecha', hitos: ['Diagnóstico'], frase: 'Aquí empezó todo: armaste tu entorno y fijaste tu punto de partida con el diagnóstico.' },
  { nombre: 'Páramo de la Limpieza', modulo: 'Análisis', semanas: '2', bioma: 'paramo', estado: 'hecha', hitos: ['Trabajo 1'], frase: 'En el Páramo se aprende lo menos vistoso y más importante: limpiar con pandas antes de explorar.' },
  { nombre: 'Desierto del Modelado', modulo: 'Modelado', semanas: '3', bioma: 'desierto', estado: 'hecha', hitos: ['Trabajo 2'], frase: 'En el Desierto pusiste un modelo frente a su baseline. Allí se ve si de verdad aprendió algo.' },
  { nombre: 'Cueva de la Escala', modulo: 'Big Data', semanas: '4', bioma: 'cueva', estado: 'actual', hitos: ['Trabajo 3'], frase: 'Aquí estamos: la Cueva de la Escala. Cuando los datos no caben en memoria, llega Spark. ¡Tú puedes!' },
  { nombre: 'Glaciar de la Comunicación', modulo: 'Comunicación', semanas: '5', bioma: 'glaciar', estado: 'pendiente', hitos: ['Trabajo 4'], frase: 'El Glaciar de la Comunicación aún no está disponible. Se abre en la semana 5.' },
  { nombre: 'Costa de los Ensambles', modulo: 'Ensambles', semanas: '6', bioma: 'costa', estado: 'pendiente', hitos: ['Trabajo 5'], frase: 'La Costa de los Ensambles aún no está disponible. Se abre en la semana 6.' },
  { nombre: 'Ruinas de la Validación', modulo: 'Validación', semanas: '7', bioma: 'ruinas', estado: 'pendiente', hitos: ['Trabajo 6'], frase: 'Las Ruinas de la Validación aún no están disponibles. Se abren en la semana 7.' },
  { nombre: 'El Volcán', modulo: 'Proyecto final', semanas: '8', bioma: 'volcan', estado: 'pendiente', hitos: ['Proyecto final'], frase: 'El Volcán aún no está disponible. Es la cima y se abre en la semana 8.' },
];

export interface GemaCurso {
  gema: string;
  nombre: string;
  dimension: string;
  isla: string;
  islaCorta: string;
}

export const gemasCurso: GemaCurso[] = [
  { gema: 'esmeralda', nombre: 'Esmeralda Semilla', dimension: 'Datos', isla: 'Valle de los Datos', islaCorta: 'Valle' },
  { gema: 'opalo', nombre: 'Ópalo Bruma', dimension: 'Análisis', isla: 'Páramo de la Limpieza', islaCorta: 'Páramo' },
  { gema: 'zafiro', nombre: 'Zafiro del Oasis', dimension: 'Modelado', isla: 'Desierto del Modelado', islaCorta: 'Desierto' },
  { gema: 'ambar', nombre: 'Ámbar Brasa', dimension: 'Datos', isla: 'Cueva de la Escala', islaCorta: 'Cueva' },
  { gema: 'aguamarina', nombre: 'Aguamarina Eco', dimension: 'Comunicación', isla: 'Glaciar de la Comunicación', islaCorta: 'Glaciar' },
  { gema: 'topacio', nombre: 'Topacio Faro', dimension: 'Producción', isla: 'Costa de los Ensambles', islaCorta: 'Costa' },
  { gema: 'peridoto', nombre: 'Peridoto Centinela', dimension: 'Validación', isla: 'Ruinas de la Validación', islaCorta: 'Ruinas' },
  { gema: 'rubi', nombre: 'Rubí del Volcán', dimension: 'Proyecto final', isla: 'El Volcán', islaCorta: 'Volcán' },
];

const islaCerrada = (gema: GemaCurso) => regionesCurso.find((region) => region.nombre === gema.isla)?.estado === 'hecha';

export const gemasGanadas = gemasCurso.filter(islaCerrada);

export type Dificultad = 'básica' | 'media' | 'alta';
export const dificultadPara = (valor: number): Dificultad => (valor >= 60 ? 'alta' : valor >= 40 ? 'media' : 'básica');

export const temaDeRepaso = () => {
  const ganadas = gemasGanadas
    .map((gema) => ({ gema, valor: dimensiones.find((dimension) => dimension.nombre === gema.dimension)?.ahora }))
    .filter((item): item is { gema: GemaCurso; valor: number } => item.valor !== undefined);
  return ganadas.reduce((peor, item) => (item.valor < peor.valor ? item : peor), ganadas[0]);
};

export interface FotoAlbum {
  pie: string;
  jaguar: 'guia' | 'saluda' | 'pensando' | 'celebra';
  objeto: string;
}

export interface PaginaAlbum {
  gema: string;
  bioma: Bioma;
  fotos: FotoAlbum[];
  reveladas: number;
}

const POSES: FotoAlbum['jaguar'][] = ['guia', 'saluda', 'pensando', 'celebra', 'guia', 'celebra'];

const paginaAlbum = (gema: string, bioma: Bioma, objetos: string[], pies: string[], reveladas: number): PaginaAlbum => ({
  gema,
  bioma,
  reveladas,
  fotos: pies.map((pie, indice) => ({ pie, jaguar: POSES[indice], objeto: objetos[indice % objetos.length] })),
});

export const paginasAlbum: PaginaAlbum[] = [
  paginaAlbum('esmeralda', 'selva', ['mochila', 'binoculares', 'mapa'], ['Plantando la primera semilla', 'La cascada, con lupa', 'Frutas en tres cestas', 'Un brote que crece', 'Puente de lianas', 'La cosecha'], 6),
  paginaAlbum('opalo', 'paramo', ['cuaderno', 'binoculares', 'linterna'], ['Limpiando la lupa', 'Barriendo hojas secas', 'Agua turbia, colada', 'Un mapa sin polvo', 'Frutos buenos y dañados', 'La bruma se levanta'], 4),
  paginaAlbum('topacio', 'costa', ['linterna', 'binoculares', 'mapa'], ['Subiendo al faro', 'Mirando el horizonte', 'Barras en la arena', 'Caracolas en fila', 'El mapa del tesoro', 'Rumbo al faro'], 0),
  paginaAlbum('zafiro', 'desierto', ['cuaderno', 'mapa', 'mochila'], ['Una línea entre piedras', 'La cantimplora del oasis', 'Torre escalonada', 'Probando la balanza', 'Siguiendo huellas', 'Bandera en la duna'], 2),
  paginaAlbum('ambar', 'cueva', ['linterna', 'cuaderno', 'mochila'], ['Entrando con la linterna', 'Cristales en patrón', 'Dos formaciones, comparadas', 'Midiendo con la cuerda', 'Moldes de arcilla', 'El ámbar de la pared'], 1),
  paginaAlbum('peridoto', 'ruinas', ['linterna', 'cuaderno', 'binoculares'], ['La columna, con lupa', 'Dos tablillas casi iguales', 'El puente aguanta', 'Piedras en equilibrio', 'Vigilando la entrada', 'El contorno del cuarto'], 0),
  paginaAlbum('aguamarina', 'glaciar', ['carta', 'mapa', 'trofeo'], ['El eco de la montaña', 'Un cartel de hielo', 'Señal de humo', 'Mostrando el mapa', 'Un muñeco con pañuelo', 'El cuerno del glaciar'], 0),
  paginaAlbum('rubi', 'volcan', ['trofeo', 'mochila', 'mapa'], ['El volcán, a lo lejos', 'Subiendo el sendero', 'El puente sobre la lava', 'Bandera en el cráter', 'El rubí brilla', 'La cima'], 0),
];

export const albumDeIsla = (nombreIsla: string) => {
  const gema = gemasCurso.find((candidata) => candidata.isla === nombreIsla);
  const pagina = gema && paginasAlbum.find((candidata) => candidata.gema === gema.gema);
  return gema && pagina ? { gema, pagina } : undefined;
};

export const nivelDePulido = (valor: number) => (valor >= 60 ? 'Pulida' : valor >= 40 ? 'Tallada' : 'En bruto');

export const rachaPractica = {
  dias: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  hechos: [true, true, true, false, false, false, false],
  hoy: 3,
  metaHoy: 1,
  sesionesHoy: 0,
  xpSemana: 140,
  metaXpSemana: 200,
  xpPorSesion: 30,
  sesionesSemana: 5,
};
