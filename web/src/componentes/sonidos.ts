import { useSyncExternalStore } from 'react';

type Onda = OscillatorType;

export interface Nota {
  f: number;
  t: number;
  d: number;
  onda?: Onda;
  v?: number;
  hasta?: number;
  ruido?: boolean;
}

let contexto: AudioContext | null = null;

const obtenerContexto = () => {
  contexto ??= new AudioContext();
  if (contexto.state === 'suspended') void contexto.resume();
  return contexto;
};

export function reproducir(notas: Nota[]) {
  const audio = obtenerContexto();
  const ahora = audio.currentTime;
  for (const nota of notas) {
    const volumen = audio.createGain();
    const inicio = ahora + nota.t;
    const pico = nota.v ?? 0.18;
    volumen.gain.setValueAtTime(0.0001, inicio);
    volumen.gain.exponentialRampToValueAtTime(pico, inicio + 0.01);
    volumen.gain.exponentialRampToValueAtTime(0.0001, inicio + nota.d);
    volumen.connect(audio.destination);
    if (nota.ruido) {
      const largo = Math.ceil(audio.sampleRate * nota.d);
      const memoria = audio.createBuffer(1, largo, audio.sampleRate);
      const datos = memoria.getChannelData(0);
      for (let i = 0; i < largo; i += 1) datos[i] = Math.random() * 2 - 1;
      const fuente = audio.createBufferSource();
      fuente.buffer = memoria;
      const filtro = audio.createBiquadFilter();
      filtro.type = 'bandpass';
      filtro.frequency.value = nota.f;
      fuente.connect(filtro).connect(volumen);
      fuente.start(inicio);
    } else {
      const oscilador = audio.createOscillator();
      oscilador.type = nota.onda ?? 'sine';
      oscilador.frequency.setValueAtTime(nota.f, inicio);
      if (nota.hasta) oscilador.frequency.exponentialRampToValueAtTime(nota.hasta, inicio + nota.d);
      oscilador.connect(volumen);
      oscilador.start(inicio);
      oscilador.stop(inicio + nota.d + 0.05);
    }
  }
}

const secuencia = (frecuencias: number[], onda: Onda, paso: number, duracion: number, volumen = 0.16): Nota[] =>
  frecuencias.map((f, indice) => ({ f, t: indice * paso, d: duracion, onda, v: volumen }));

const campana = (frecuencias: number[], paso: number, duracion: number, volumen = 0.14): Nota[] =>
  frecuencias.flatMap((f, indice) => [
    { f, t: indice * paso, d: duracion, onda: 'sine' as Onda, v: volumen },
    { f: f * 2.76, t: indice * paso, d: duracion * 0.6, onda: 'sine' as Onda, v: volumen * 0.35 },
  ]);

export type Categoria = 'Práctica' | 'Premios' | 'Clase y avisos';

export interface Variante {
  nombre: string;
  descripcion: string;
  notas: Nota[];
}

export interface EventoSonido {
  id: string;
  categoria: Categoria;
  nombre: string;
  cuando: string;
  defecto: 'Encendido' | 'Apagado' | 'Solo con el sonido activado';
  variantes: Variante[];
}

export const EVENTOS: EventoSonido[] = [
  {
    id: 'clic', categoria: 'Práctica', nombre: 'Toque en un botón', cuando: 'Al elegir una opción, pasar de pestaña o confirmar. Muy corto y discreto.', defecto: 'Encendido',
    variantes: [
      { nombre: 'Suave', descripcion: 'Un “pop” redondo', notas: secuencia([660], 'sine', 0, 0.06, 0.18) },
      { nombre: 'Arcade', descripcion: 'Un “bip” de consola', notas: secuencia([880], 'square', 0, 0.05, 0.07) },
      { nombre: 'Madera', descripcion: 'Un golpecito seco', notas: [{ f: 520, t: 0, d: 0.05, onda: 'triangle', v: 0.25 }, { f: 1800, t: 0, d: 0.03, ruido: true, v: 0.1 }] },
    ],
  },
  {
    id: 'acierto', categoria: 'Práctica', nombre: 'Respuesta correcta', cuando: 'Al comprobar una pregunta de la sesión de práctica y acertar.', defecto: 'Encendido',
    variantes: [
      { nombre: 'Suave', descripcion: 'Dos notas ascendentes', notas: secuencia([523, 659], 'sine', 0.09, 0.22) },
      { nombre: 'Arcade', descripcion: 'Tres notas de moneda', notas: secuencia([523, 659, 784], 'square', 0.07, 0.12, 0.09) },
      { nombre: 'Campana', descripcion: 'Un tintineo brillante', notas: campana([784, 1047], 0.11, 0.5) },
    ],
  },
  {
    id: 'error', categoria: 'Práctica', nombre: 'Respuesta incorrecta', cuando: 'Al fallar. Debe sonar amable, porque aquí fallar no se castiga.', defecto: 'Encendido',
    variantes: [
      { nombre: 'Suave', descripcion: 'Un descenso tranquilo', notas: [{ f: 330, hasta: 262, t: 0, d: 0.3, onda: 'sine', v: 0.18 }] },
      { nombre: 'Arcade', descripcion: 'Dos notas bajas', notas: secuencia([196, 165], 'square', 0.1, 0.16, 0.07) },
      { nombre: 'Madera', descripcion: 'Dos golpes graves', notas: [{ f: 180, t: 0, d: 0.18, onda: 'triangle', v: 0.3 }, { f: 140, t: 0.12, d: 0.22, onda: 'triangle', v: 0.3 }] },
    ],
  },
  {
    id: 'sesion', categoria: 'Práctica', nombre: 'Sesión completada', cuando: 'Al terminar las 5 preguntas y ver el resultado con el XP.', defecto: 'Encendido',
    variantes: [
      { nombre: 'Suave', descripcion: 'Arpegio que sube', notas: secuencia([523, 659, 784, 1047], 'sine', 0.1, 0.35) },
      { nombre: 'Arcade', descripcion: 'Fanfarria de nivel', notas: secuencia([523, 659, 784, 659, 784, 1047], 'square', 0.08, 0.14, 0.08) },
      { nombre: 'Campanas', descripcion: 'Cinco campanas', notas: campana([523, 659, 784, 1047, 1319], 0.12, 0.7) },
    ],
  },
  {
    id: 'foto', categoria: 'Premios', nombre: 'Revelar una foto del álbum', cuando: 'Al terminar una sesión de repaso de una isla y aparecer la polaroid.', defecto: 'Encendido',
    variantes: [
      { nombre: 'Obturador', descripcion: 'Clic de cámara y un brillo', notas: [{ f: 3000, t: 0, d: 0.05, ruido: true, v: 0.3 }, { f: 2000, t: 0.09, d: 0.06, ruido: true, v: 0.25 }, { f: 1320, t: 0.2, d: 0.3, onda: 'sine', v: 0.1 }] },
      { nombre: 'Destello', descripcion: 'Un barrido que sube', notas: [{ f: 400, hasta: 1600, t: 0, d: 0.35, onda: 'sine', v: 0.14 }, { f: 1568, t: 0.3, d: 0.35, onda: 'sine', v: 0.12 }] },
      { nombre: 'Campana', descripcion: 'Tres campanitas', notas: campana([988, 1319, 1568], 0.09, 0.6) },
    ],
  },
  {
    id: 'racha', categoria: 'Premios', nombre: 'Racha de un día más', cuando: 'La primera vez que practicas en el día y la racha sube.', defecto: 'Encendido',
    variantes: [
      { nombre: 'Suave', descripcion: 'Tres notas que suben', notas: secuencia([392, 523, 659], 'triangle', 0.1, 0.25) },
      { nombre: 'Arcade', descripcion: 'Cuatro notas rápidas', notas: secuencia([392, 523, 659, 784], 'square', 0.06, 0.1, 0.08) },
      { nombre: 'Campana', descripcion: 'Tres campanas', notas: campana([523, 784, 1047], 0.11, 0.6) },
    ],
  },
  {
    id: 'liga', categoria: 'Premios', nombre: 'Subir de liga', cuando: 'En el modo competitivo, al cerrar la semana en zona de ascenso.', defecto: 'Encendido',
    variantes: [
      { nombre: 'Fanfarria', descripcion: 'Cuatro notas con cuerpo', notas: secuencia([523, 659, 784, 1047], 'triangle', 0.09, 0.3, 0.2) },
      { nombre: 'Arcade', descripcion: 'Subida de nivel', notas: secuencia([262, 330, 392, 523, 392, 523], 'square', 0.07, 0.12, 0.08) },
      { nombre: 'Campanas', descripcion: 'Tres campanas amplias', notas: campana([659, 880, 1175], 0.13, 0.8) },
    ],
  },
  {
    id: 'entrega', categoria: 'Premios', nombre: 'Entrega registrada', cuando: 'Al confirmar el PR y salir el sello con el visto y el confeti.', defecto: 'Encendido',
    variantes: [
      { nombre: 'Sello', descripcion: 'Golpe de sello y acorde', notas: [{ f: 200, t: 0, d: 0.12, onda: 'triangle', v: 0.35 }, { f: 523, t: 0.1, d: 0.5, onda: 'sine', v: 0.14 }, { f: 784, t: 0.1, d: 0.5, onda: 'sine', v: 0.14 }] },
      { nombre: 'Arcade', descripcion: 'Cuatro notas de victoria', notas: secuencia([659, 784, 988, 1319], 'square', 0.06, 0.1, 0.08) },
      { nombre: 'Campana', descripcion: 'Dos campanas largas', notas: campana([659, 988], 0.15, 0.8) },
    ],
  },
  {
    id: 'relampago', categoria: 'Clase y avisos', nombre: 'Se abre una relámpago', cuando: 'Cuando el docente abre una pregunta relámpago y aparece la cuenta de 60 s.', defecto: 'Apagado',
    variantes: [
      { nombre: 'Doble aviso', descripcion: 'Dos pitidos claros', notas: secuencia([880, 880], 'sine', 0.16, 0.12) },
      { nombre: 'Ping', descripcion: 'Un solo tono largo', notas: [{ f: 1175, t: 0, d: 0.6, onda: 'sine', v: 0.14 }, { f: 2350, t: 0, d: 0.3, onda: 'sine', v: 0.05 }] },
      { nombre: 'Trompetilla', descripcion: 'Cuatro notas que invitan', notas: secuencia([392, 523, 659, 784], 'sawtooth', 0.07, 0.12, 0.06) },
    ],
  },
  {
    id: 'tic', categoria: 'Clase y avisos', nombre: 'Cuenta regresiva', cuando: 'Cada segundo de los últimos 10, mientras corre la ventana de la relámpago.', defecto: 'Apagado',
    variantes: [
      { nombre: 'Tic', descripcion: 'Un tono corto y limpio', notas: secuencia([800], 'sine', 0, 0.04, 0.12) },
      { nombre: 'Madera', descripcion: 'Un golpecito de reloj', notas: [{ f: 600, t: 0, d: 0.04, onda: 'triangle', v: 0.25 }] },
      { nombre: 'Reloj', descripcion: 'Un chasquido agudo', notas: [{ f: 1500, t: 0, d: 0.02, onda: 'square', v: 0.05 }] },
    ],
  },
  {
    id: 'aviso', categoria: 'Clase y avisos', nombre: 'Aviso para el docente', cuando: 'Cuando entra una alerta nueva en el panel: entrega tarde o fusión del propio estudiante.', defecto: 'Solo con el sonido activado',
    variantes: [
      { nombre: 'Ding', descripcion: 'Dos notas que bajan', notas: secuencia([988, 784], 'sine', 0.12, 0.3) },
      { nombre: 'Blip', descripcion: 'Dos bips agudos', notas: secuencia([700, 900], 'square', 0.06, 0.07, 0.06) },
      { nombre: 'Campana', descripcion: 'Una campana larga', notas: campana([1319], 0, 0.8) },
    ],
  },
  {
    id: 'verificacion', categoria: 'Clase y avisos', nombre: 'Comprobación lista', cuando: 'Cada vez que una línea de la verificación del PR se marca con el visto.', defecto: 'Encendido',
    variantes: [
      { nombre: 'Tic ascendente', descripcion: 'Tres tonos que suben', notas: secuencia([600, 800, 1000], 'sine', 0.18, 0.12, 0.12) },
      { nombre: 'Arcade', descripcion: 'Tres bips', notas: secuencia([500, 700, 900], 'square', 0.12, 0.08, 0.06) },
      { nombre: 'Madera', descripcion: 'Tres golpecitos', notas: [{ f: 500, t: 0, d: 0.05, onda: 'triangle', v: 0.25 }, { f: 620, t: 0.14, d: 0.05, onda: 'triangle', v: 0.25 }, { f: 760, t: 0.28, d: 0.06, onda: 'triangle', v: 0.25 }] },
    ],
  },
];

export const CATEGORIAS: Categoria[] = ['Práctica', 'Premios', 'Clase y avisos'];

export const ELECCION: Record<string, number> = {
  clic: 0, acierto: 1, error: 1, sesion: 0, foto: 1, racha: 2, liga: 2, entrega: 2, relampago: 0, tic: 0, aviso: 2, verificacion: 0,
};

const DE_CLASE = ['relampago', 'tic'];
const CLAVE_AJUSTES = 'sonido-ajustes';

interface Ajustes {
  activo: boolean;
  clase: boolean;
}

const leerAjustes = (): Ajustes => {
  try {
    return { activo: true, clase: false, ...(JSON.parse(window.localStorage.getItem(CLAVE_AJUSTES) ?? '{}') as Partial<Ajustes>) };
  } catch {
    return { activo: true, clase: false };
  }
};

let ajustes: Ajustes = leerAjustes();
const oyentes = new Set<() => void>();

const cambiarAjustes = (nuevos: Ajustes) => {
  ajustes = nuevos;
  try {
    window.localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(ajustes));
  } catch {
    // sin almacenamiento: el ajuste vale solo para esta visita
  }
  oyentes.forEach((oyente) => oyente());
};

export const alternarSonido = () => cambiarAjustes({ ...ajustes, activo: !ajustes.activo });
export const alternarSonidoDeClase = () => cambiarAjustes({ ...ajustes, clase: !ajustes.clase });

export const useSonido = () =>
  useSyncExternalStore(
    (aviso) => {
      oyentes.add(aviso);
      return () => oyentes.delete(aviso);
    },
    () => ajustes,
  );

export function sonar(id: string, solo?: number) {
  if (!ajustes.activo || (DE_CLASE.includes(id) && !ajustes.clase)) return;
  if (window.location.hash.replace(/^#\/?/, '') === 'todas') return;
  if (!contexto && !navigator.userActivation?.hasBeenActive) return;
  const evento = EVENTOS.find((candidato) => candidato.id === id);
  if (!evento) return;
  let notas = evento.variantes[ELECCION[id]].notas;
  if (solo !== undefined) notas = [{ ...notas[Math.min(solo, notas.length - 1)], t: 0 }];
  try {
    reproducir(notas);
  } catch {
    // sin audio disponible: la app sigue en silencio
  }
}

const TOCABLES = '.opcion, .resp, .segmentado button, .diag__chip, .ficha, .pulso__ritmo button, .pulso__estrellas button, .album__pestana, .dock__menu, .dock__accion, .camp__guia-boton, .acceso-rapido, .d2__ruta, .d8__lista button, .interruptor-tema';
const SILENCIADOS = '.son__variantes, .sesion__comprobar, .sesion__fb, .dock__accion[disabled]';

export function instalarSonidoDeClic() {
  document.addEventListener('click', (evento) => {
    const objetivo = evento.target as Element | null;
    if (!objetivo?.closest(TOCABLES) || objetivo.closest(SILENCIADOS)) return;
    sonar('clic');
  }, true);
}
