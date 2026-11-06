import type { Rol } from '../compartido/navegacion/navegacion';

export interface PasoDeRecorrido {
  ruta: string;
  titulo: string;
  texto: string;
}

export const ROLES_DEMO: { rol: Rol; etiqueta: string; objeto: string; promesa: string }[] = [
  { rol: 'estudiante', etiqueta: 'Estudiante', objeto: 'mapa', promesa: 'Mira tu radar, tus entregas y la práctica del día.' },
  { rol: 'docente', etiqueta: 'Docente', objeto: 'trofeo', promesa: 'Califica con rúbrica, ve las alertas y abre una relámpago.' },
  { rol: 'observador', etiqueta: 'Observador', objeto: 'binoculares', promesa: 'Consulta resúmenes de grupo sin ver datos individuales.' },
];

export const RECORRIDO: Record<Rol, PasoDeRecorrido[]> = {
  estudiante: [
    { ruta: 'home', titulo: 'Tu campamento', texto: 'Cada semana es una isla. El jaguar te guía y te dice qué sigue, así nadie se pierde.' },
    { ruta: 'e1', titulo: 'La ruta del curso', texto: 'Ves todo el recorrido: lo que ya exploraste, lo que viene y cuánto falta.' },
    { ruta: 'e2', titulo: 'Tu radar', texto: 'Siete dimensiones comparadas con tu propio punto de partida, no con los demás.' },
    { ruta: 'e4', titulo: 'Notas sin misterio', texto: 'Cada nota llega con la rúbrica y su regla a la vista: sabes por qué sacaste lo que sacaste.' },
    { ruta: 'e6', titulo: 'Entregas por pull request', texto: 'Declaras si usaste IA y dejas tu bitácora. Declarar nunca sale peor que decir «sin IA».' },
    { ruta: 'e15', titulo: 'Practicar', texto: 'Sesiones de 5 preguntas, con XP y racha. Se hacen desde el celular en pocos minutos.' },
    { ruta: 'e20', titulo: 'En clase, desde el celular', texto: 'Relámpagos y votaciones: participas sin levantar la mano.' },
  ],
  docente: [
    { ruta: 'd1', titulo: 'Tu panel', texto: 'Todo el curso de un vistazo: entregas, alertas y la clase de hoy.' },
    { ruta: 'd2', titulo: 'Diagnóstico y rutas', texto: 'El diagnóstico de la semana 1 sugiere una ruta para cada estudiante: nivelación, estándar o profundización.' },
    { ruta: 'd3', titulo: 'Entregas', texto: 'Quién cargó su entrega, quién va tarde y qué falta por revisar.' },
    { ruta: 'd4', titulo: 'Corrección con rúbrica', texto: 'Eliges el nivel de cada criterio y la app calcula la nota de 1.0 a 5.0, con su retroalimentación.' },
    { ruta: 'd11', titulo: 'En clase', texto: 'Abres una relámpago y muestras el QR: tus estudiantes responden desde el celular.' },
    { ruta: 'd16', titulo: 'Asistencia con QR rotativo', texto: 'Un código que cambia cada 20 segundos: nadie puede pasarle la asistencia a otra persona.' },
    { ruta: 'd8', titulo: 'La ficha de cada estudiante', texto: 'Radar, notas y actividad en un solo lugar, para intervenir a tiempo.' },
  ],
  observador: [
    { ruta: 'o1', titulo: 'Resumen por grupo', texto: 'Solo agregados, de grupos de 5 personas o más: nunca datos individuales.' },
    { ruta: 'o2', titulo: 'Dimensiones y trabajos', texto: 'Cómo va el curso por dimensión y por trabajo, sin nombres.' },
    { ruta: 'o3', titulo: 'Qué puede ver', texto: 'La privacidad está explicada dentro de la app, para que nadie tenga que adivinar.' },
  ],
};
