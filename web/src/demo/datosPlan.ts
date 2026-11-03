export type EstadoSesion = 'dada' | 'hoy' | 'proxima';

export interface Sesion {
  codigo: string;
  semana: number;
  fecha: string;
  hora: string;
  modalidad: 'Virtual' | 'Presencial';
  tema: string;
  estado: EstadoSesion;
  trabajo?: string;
}

export const sesiones: Sesion[] = [
  { codigo: 'S1', semana: 1, fecha: 'mar 3 nov', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Introducción a la ciencia de datos, entorno y guía de PR', estado: 'dada' },
  { codigo: 'S2', semana: 1, fecha: 'jue 5 nov', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Verificación sin IA y pandas, fundamentos', estado: 'dada' },
  { codigo: 'S3', semana: 2, fecha: 'mar 10 nov', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'pandas avanzado: joins, ventanas y limpieza; NumPy', estado: 'dada' },
  { codigo: 'S4', semana: 2, fecha: 'jue 12 nov', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Teoría de visualización, votación de librería y EDA', estado: 'dada', trabajo: 'T1' },
  { codigo: 'S5', semana: 3, fecha: 'mar 17 nov', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Regresión con scikit-learn, partición y métricas', estado: 'dada' },
  { codigo: 'S6', semana: 3, fecha: 'jue 19 nov', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Clasificación, pipelines y baseline', estado: 'dada', trabajo: 'T2' },
  { codigo: 'S7', semana: 4, fecha: 'mar 24 nov', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Big Data: Hadoop, escalabilidad y Spark; PySpark DataFrames', estado: 'dada' },
  { codigo: 'S8', semana: 4, fecha: 'jue 26 nov', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'PySpark SQL, particiones y comparación con pandas', estado: 'hoy', trabajo: 'T3' },
  { codigo: 'S9', semana: 5, fecha: 'mar 1 dic', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Teoría de dashboards y votación de herramienta', estado: 'proxima' },
  { codigo: 'S10', semana: 5, fecha: 'jue 3 dic', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Storytelling con datos y diseño del dashboard', estado: 'proxima', trabajo: 'T4' },
  { codigo: 'S11', semana: 6, fecha: 'mar 8 dic', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Árboles y ensambles; planning del sprint 1', estado: 'proxima' },
  { codigo: 'S12', semana: 6, fecha: 'jue 10 dic', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Pipelines reproducibles y trabajo en equipo con Git', estado: 'proxima', trabajo: 'T5' },
  { codigo: 'S13', semana: 7, fecha: 'mar 15 dic', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Validación cruzada y ajuste de hiperparámetros', estado: 'proxima' },
  { codigo: 'S14', semana: 7, fecha: 'jue 17 dic', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Interpretación con SHAP y LIME; tarea forma B', estado: 'proxima', trabajo: 'T6' },
  { codigo: 'S15', semana: 8, fecha: 'mar 22 dic', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Verificación sin IA (forma B), sprint final y ensayo', estado: 'proxima' },
  { codigo: 'S16', semana: 8, fecha: 'jue 24 dic', hora: '6:00 p. m.', modalidad: 'Virtual', tema: 'Presentación del integrador y retroalimentación', estado: 'proxima', trabajo: 'T7' },
];

export const presenciales = [
  { codigo: 'P1', fecha: 'sáb 14 nov', hora: '9:00 a. m.', estado: 'dada' as EstadoSesion, nota: 'Abierta: el plan no depende de ella' },
  { codigo: 'P2', fecha: 'sáb 21 nov', hora: '9:00 a. m.', estado: 'dada' as EstadoSesion, nota: 'Abierta: el plan no depende de ella' },
  { codigo: 'P3', fecha: 'sáb 28 nov', hora: '9:00 a. m.', estado: 'proxima' as EstadoSesion, nota: 'Abierta: por definir' },
];

export const calendarioProvisional = 'Fechas de ejemplo: el calendario real de las sesiones aún no existe.';

export interface Recurso {
  id: string;
  titulo: string;
  tipo: 'libro' | 'capítulo' | 'documentación' | 'video' | 'curso' | 'guía';
  idioma: 'ES' | 'EN';
  gratis: boolean;
  sesion: string;
  verificado: boolean;
  fecha?: string;
  resumen?: string;
  glosario?: string[];
}

export const recursos: Recurso[] = [
  { id: 'r1', titulo: 'Pro Git (Chacon y Straub)', tipo: 'libro', idioma: 'ES', gratis: true, sesion: 'S1', verificado: true, fecha: '1 nov' },
  { id: 'r2', titulo: 'La Guía de Scrum 2020', tipo: 'guía', idioma: 'ES', gratis: true, sesion: 'S11', verificado: true, fecha: '1 nov' },
  { id: 'r3', titulo: 'Tutoriales de scikit-learn en cienciadedatos.net', tipo: 'curso', idioma: 'ES', gratis: true, sesion: 'S5', verificado: true, fecha: '1 nov' },
  { id: 'r4', titulo: 'Fundamentals of Data Visualization (Wilke)', tipo: 'libro', idioma: 'EN', gratis: true, sesion: 'S4', verificado: true, fecha: '1 nov', resumen: 'Explica cómo elegir el gráfico según lo que quieres mostrar: cantidades, distribuciones, proporciones o relaciones. Insiste en reducir el ruido visual y en usar el color con intención.', glosario: ['Overplotting: demasiados puntos que se tapan entre sí', 'Encoding: la forma visual con que se representa un dato'] },
  { id: 'r5', titulo: 'PySpark, primeros pasos (documentación oficial)', tipo: 'documentación', idioma: 'EN', gratis: true, sesion: 'S7', verificado: false, resumen: 'Muestra cómo crear una sesión de Spark, leer un archivo y hacer las primeras transformaciones sobre un DataFrame.', glosario: ['Lazy evaluation: Spark no ejecuta hasta que pides un resultado', 'Partition: un trozo de los datos que se procesa por separado'] },
  { id: 'r6', titulo: 'Documentación de GitHub Codespaces', tipo: 'documentación', idioma: 'ES', gratis: true, sesion: 'S7', verificado: true, fecha: '1 nov' },
  { id: 'r7', titulo: 'Fundamentos de PySpark (DataCamp)', tipo: 'curso', idioma: 'ES', gratis: false, sesion: 'S7', verificado: false },
  { id: 'r8', titulo: 'Video en español: Hadoop frente a Spark', tipo: 'video', idioma: 'ES', gratis: true, sesion: 'S7', verificado: false },
  { id: 'r9', titulo: 'Guía de Spark SQL y DataFrames', tipo: 'documentación', idioma: 'EN', gratis: true, sesion: 'S8', verificado: false, resumen: 'Explica cómo consultar un DataFrame con SQL, cómo unir tablas y cómo leer el plan de ejecución.', glosario: ['Shuffle: mover datos entre particiones, es lo más costoso', 'Catalyst: el optimizador de consultas de Spark'] },
  { id: 'r10', titulo: 'Microsoft Learn: Power BI', tipo: 'curso', idioma: 'ES', gratis: true, sesion: 'S9', verificado: true, fecha: '1 nov' },
  { id: 'r11', titulo: 'Interpretable Machine Learning (Molnar)', tipo: 'libro', idioma: 'EN', gratis: true, sesion: 'S14', verificado: true, fecha: '1 nov', resumen: 'Presenta las técnicas para explicar un modelo, desde coeficientes hasta SHAP y LIME, con sus ventajas y límites.', glosario: ['SHAP: cuánto aporta cada variable a una predicción', 'LIME: un modelo simple que explica una predicción local'] },
];

export type EstadoEntrega = 'sin_cargar' | 'cargada' | 'aprobada' | 'fusionada' | 'fusion_propia';

export interface Estudiante {
  id: string;
  nombre: string;
  iniciales: string;
  grupo: number;
  github: string;
  datos: number;
  ruta: 'Nivelación' | 'Estándar' | 'Profundización';
  entrega: EstadoEntrega;
  tarde: boolean;
  pylint: number | null;
  pareja: string;
  equipo: string;
  rol: string;
  autoinforme: number;
  xp: number;
}

export const estudiantes: Estudiante[] = [
  { id: 'e1', nombre: 'Camilo Restrepo', iniciales: 'CR', grupo: 2, github: 'camilo-r', datos: 62, ruta: 'Estándar', entrega: 'cargada', tarde: false, pylint: 8.4, pareja: 'Julián Arias', equipo: 'Páramo', rol: 'Analista de datos', autoinforme: 4, xp: 340 },
  { id: 'e2', nombre: 'Julián Arias', iniciales: 'JA', grupo: 2, github: 'julian-a', datos: 48, ruta: 'Nivelación', entrega: 'aprobada', tarde: false, pylint: 8.1, pareja: 'Camilo Restrepo', equipo: 'Páramo', rol: 'Ingeniero de pipelines', autoinforme: 3, xp: 280 },
  { id: 'e3', nombre: 'María Soto', iniciales: 'MS', grupo: 2, github: 'maria-s', datos: 81, ruta: 'Profundización', entrega: 'fusionada', tarde: false, pylint: 9.2, pareja: 'Daniel Pineda', equipo: 'Páramo', rol: 'Modelador', autoinforme: 5, xp: 410 },
  { id: 'e4', nombre: 'Daniel Pineda', iniciales: 'DP', grupo: 2, github: 'dani-p', datos: 55, ruta: 'Estándar', entrega: 'sin_cargar', tarde: false, pylint: null, pareja: 'María Soto', equipo: 'Páramo', rol: 'Narrador', autoinforme: 3, xp: 190 },
  { id: 'e5', nombre: 'Laura Gómez', iniciales: 'LG', grupo: 1, github: 'laura-g', datos: 44, ruta: 'Nivelación', entrega: 'cargada', tarde: true, pylint: 7.2, pareja: 'Andrés Cano', equipo: 'Frailejón', rol: 'Analista de datos', autoinforme: 2, xp: 220 },
  { id: 'e6', nombre: 'Andrés Cano', iniciales: 'AC', grupo: 1, github: 'andres-c', datos: 71, ruta: 'Estándar', entrega: 'fusion_propia', tarde: false, pylint: 8.8, pareja: 'Laura Gómez', equipo: 'Frailejón', rol: 'Modelador', autoinforme: 4, xp: 360 },
  { id: 'e7', nombre: 'Sofía Mejía', iniciales: 'SM', grupo: 1, github: 'sofia-m', datos: 38, ruta: 'Nivelación', entrega: 'sin_cargar', tarde: false, pylint: null, pareja: 'Tomás Ruiz', equipo: 'Frailejón', rol: 'Narrador', autoinforme: 2, xp: 150 },
  { id: 'e8', nombre: 'Tomás Ruiz', iniciales: 'TR', grupo: 1, github: 'tomas-r', datos: 90, ruta: 'Profundización', entrega: 'aprobada', tarde: false, pylint: 9.6, pareja: 'Sofía Mejía', equipo: 'Frailejón', rol: 'Ingeniero de pipelines', autoinforme: 4, xp: 450 },
  { id: 'e9', nombre: 'Valentina Ortiz', iniciales: 'VO', grupo: 3, github: 'vale-o', datos: 66, ruta: 'Estándar', entrega: 'fusionada', tarde: false, pylint: 8.5, pareja: 'Esteban Luna', equipo: 'Colibrí', rol: 'Analista de datos', autoinforme: 3, xp: 330 },
  { id: 'e10', nombre: 'Esteban Luna', iniciales: 'EL', grupo: 3, github: 'esteban-l', datos: 52, ruta: 'Estándar', entrega: 'cargada', tarde: false, pylint: 7.9, pareja: 'Valentina Ortiz', equipo: 'Colibrí', rol: 'Modelador', autoinforme: 4, xp: 260 },
  { id: 'e11', nombre: 'Paula Vargas', iniciales: 'PV', grupo: 3, github: 'paula-v', datos: 29, ruta: 'Nivelación', entrega: 'sin_cargar', tarde: true, pylint: null, pareja: 'Mateo Ríos', equipo: 'Colibrí', rol: 'Narrador', autoinforme: 1, xp: 90 },
  { id: 'e12', nombre: 'Mateo Ríos', iniciales: 'MR', grupo: 3, github: 'mateo-r', datos: 75, ruta: 'Estándar', entrega: 'aprobada', tarde: false, pylint: 8.7, pareja: 'Paula Vargas', equipo: 'Colibrí', rol: 'Ingeniero de pipelines', autoinforme: 5, xp: 380 },
];

export const textoEntrega: Record<EstadoEntrega, string> = {
  sin_cargar: 'Sin cargar',
  cargada: 'Cargada, falta la pareja',
  aprobada: 'Aprobada por la pareja',
  fusionada: 'Fusionada por el docente',
  fusion_propia: 'Fusionó el estudiante',
};

export const UMBRAL_NIVELACION = 50;
export const UMBRAL_PROFUNDIZACION = 80;
export const porcentajeDatos = Math.round((estudiantes.filter((estudiante) => estudiante.datos >= UMBRAL_NIVELACION).length / estudiantes.length) * 100);
export const rutaPropuesta = porcentajeDatos < 50 ? 'Nivelación' : porcentajeDatos > 80 ? 'Profundización' : 'Estándar';

export const dimensionesDiagnostico = [
  { nombre: 'Datos', conIA: 68, sinIA: 54 },
  { nombre: 'Análisis', conIA: 61, sinIA: 49 },
  { nombre: 'Modelado', conIA: 52, sinIA: 33 },
  { nombre: 'Validación', conIA: 44, sinIA: 28 },
  { nombre: 'Comunicación', conIA: 70, sinIA: 63 },
  { nombre: 'Producción', conIA: 47, sinIA: 38 },
  { nombre: 'Dirección de IA', conIA: 58, sinIA: 58 },
];

export type TipoFormulario = 'Encuesta' | 'Votación' | 'Relámpago';

export interface Formulario {
  id: string;
  nombre: string;
  tipo: TipoFormulario;
  cuando: string;
  anonimo: boolean;
  estado: 'abierto' | 'cerrado' | 'borrador' | 'programado';
  respuestas: number;
}

export const formularios: Formulario[] = [
  { id: 'f1', nombre: 'Autorización de tratamiento de datos', tipo: 'Encuesta', cuando: 'Antes de la S1', anonimo: false, estado: 'cerrado', respuestas: 36 },
  { id: 'f2', nombre: 'Contexto y expectativas', tipo: 'Encuesta', cuando: 'S1', anonimo: false, estado: 'cerrado', respuestas: 35 },
  { id: 'f3', nombre: 'Votación de librería de visualización', tipo: 'Votación', cuando: 'S4', anonimo: true, estado: 'cerrado', respuestas: 33 },
  { id: 'f4', nombre: 'Pulso semanal · semana 4', tipo: 'Encuesta', cuando: 'Cierre de S8', anonimo: true, estado: 'programado', respuestas: 0 },
  { id: 'f5', nombre: 'Relámpago: ¿qué es una acción en Spark?', tipo: 'Relámpago', cuando: 'S8', anonimo: false, estado: 'abierto', respuestas: 21 },
  { id: 'f6', nombre: 'Votación de herramienta de dashboards', tipo: 'Votación', cuando: 'S9', anonimo: true, estado: 'borrador', respuestas: 0 },
  { id: 'f7', nombre: 'Seguimiento de quien no entrega', tipo: 'Encuesta', cuando: 'Cuando falta una entrega', anonimo: false, estado: 'borrador', respuestas: 0 },
];

export const equiposCurso = [
  { nombre: 'Páramo', grupo: 2, integrantes: ['Camilo Restrepo', 'Julián Arias', 'María Soto', 'Daniel Pineda'], balance: 'Equilibrado' },
  { nombre: 'Frailejón', grupo: 1, integrantes: ['Laura Gómez', 'Andrés Cano', 'Sofía Mejía', 'Tomás Ruiz'], balance: 'Falta nivel en Modelado' },
  { nombre: 'Colibrí', grupo: 3, integrantes: ['Valentina Ortiz', 'Esteban Luna', 'Paula Vargas', 'Mateo Ríos'], balance: 'Equilibrado' },
];

export const ROLES_EQUIPO = ['Analista de datos', 'Ingeniero de pipelines', 'Modelador', 'Narrador'];

export interface RegistroRelampago {
  sesion: string;
  tema: string;
  resultado: 'acierto' | 'fallo' | 'fuera';
  segundos: number;
  xp: number;
}

export const historicoRelampagos: RegistroRelampago[] = [
  { sesion: 'S2', tema: 'DataFrame frente a Series', resultado: 'acierto', segundos: 41, xp: 20 },
  { sesion: 'S3', tema: 'Tipo de unión en pandas', resultado: 'acierto', segundos: 33, xp: 20 },
  { sesion: 'S4', tema: 'Cuándo usar un histograma', resultado: 'fallo', segundos: 52, xp: 0 },
  { sesion: 'S5', tema: 'Qué mide el R²', resultado: 'acierto', segundos: 38, xp: 20 },
  { sesion: 'S6', tema: 'Para qué sirve un baseline', resultado: 'acierto', segundos: 29, xp: 20 },
  { sesion: 'S7', tema: 'Transformación o acción', resultado: 'fuera', segundos: 74, xp: 0 },
];

export interface RegistroEncuesta {
  nombre: string;
  semana: number;
  respuesta: string;
}

export const historicoEncuestas: RegistroEncuesta[] = [
  { nombre: 'Pulso semanal', semana: 1, respuesta: 'Ritmo justo · claridad 4' },
  { nombre: 'Pulso semanal', semana: 2, respuesta: 'Ritmo rápido · claridad 3' },
  { nombre: 'Pulso semanal', semana: 3, respuesta: 'Ritmo justo · claridad 5' },
  { nombre: 'Autoinforme de habilidades', semana: 1, respuesta: 'Enviada' },
  { nombre: 'Uso y actitud frente a la IA', semana: 1, respuesta: 'Enviada' },
];

export const pulsoSemanal = [
  { semana: 1, claridad: 4.1, ritmo: 3.0, respuestas: 35 },
  { semana: 2, claridad: 3.6, ritmo: 3.7, respuestas: 34 },
  { semana: 3, claridad: 4.3, ritmo: 3.2, respuestas: 33 },
];

export const ligaActual = {
  nombre: 'Liga Esmeralda',
  nivel: 'Nivel intermedio del diagnóstico',
  cierra: 'domingo 29 nov',
  ascienden: 2,
  descienden: 2,
  participantes: [
    { nombre: 'Tomás Ruiz', iniciales: 'TR', xp: 310, cambio: 1 },
    { nombre: 'María Soto', iniciales: 'MS', xp: 285, cambio: 0 },
    { nombre: 'Camilo Restrepo', iniciales: 'CR', xp: 240, cambio: 2, yo: true },
    { nombre: 'Valentina Ortiz', iniciales: 'VO', xp: 225, cambio: -1 },
    { nombre: 'Andrés Cano', iniciales: 'AC', xp: 170, cambio: -1 },
    { nombre: 'Mateo Ríos', iniciales: 'MR', xp: 130, cambio: 0 },
  ],
};
