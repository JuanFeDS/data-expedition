import { Jaguar } from './Jaguar';
import type { Rol } from './navegacion';

export interface AnuncioSeccion {
  titulo: string;
  texto: string;
}

const COMUN: Record<string, AnuncioSeccion> = {
  curso: {
    titulo: 'Información',
    texto: 'Aquí ves un resumen de tu curso: las personas, los trabajos y sus fechas.',
  },
};

const POR_ROL: Record<Rol, Record<string, AnuncioSeccion>> = {
  estudiante: {
    e5: {
      titulo: 'Entregas',
      texto: 'Aquí están tus trabajos: lo que debes entregar, cuándo vence y lo que ya enviaste. Entregas pegando el enlace de tu Pull Request.',
    },
    e15: {
      titulo: 'Practicar',
      texto: 'Aquí repasas con sesiones de cinco preguntas. Ganas XP y mantienes tu racha; el XP no es nota.',
    },
    e17: {
      titulo: 'Diagnóstico',
      texto: 'Aquí haces tu autoinforme y ves tu punto de partida, con y sin IA, cuando tu docente registre el resultado.',
    },
    e2: {
      titulo: 'Radar',
      texto: 'Aquí ves cómo avanzas en cada dimensión frente a tu punto de partida. Se llena con tus notas.',
    },
    e24: {
      titulo: 'Mi equipo',
      texto: 'Aquí ves con quién haces cada trabajo en equipo. Tu docente los sortea y los ajusta.',
    },
    e11: {
      titulo: 'Resumen',
      texto: 'Tu semana en una página: lo que subió en tu radar, lo que conviene vigilar y qué hacer ahora.',
    },
    e30: {
      titulo: 'Mis resultados',
      texto: 'Todo lo que has respondido en clase: relámpagos, encuestas y votaciones.',
    },
    e12: {
      titulo: 'Perfil',
      texto: 'Tu punto fuerte, tu XP y tu nivel. El XP no es nota: se gana practicando.',
    },
    e1: {
      titulo: 'Mapa del curso',
      texto: 'Cada trabajo es una isla del mapa. Entregas, y avanzas a la siguiente: aquí ves dónde estás y cuánto te falta.',
    },
    asistir: {
      titulo: 'Asistencia',
      texto: 'Aquí registras tu asistencia con el código que proyecta tu docente en clase, y ves cuántas clases llevas.',
    },
    e22: {
      titulo: 'Calendario',
      texto: 'Aquí ves las sesiones semana a semana, los plazos de tus trabajos y el material de cada clase.',
    },
    e20: {
      titulo: 'En clase',
      texto: 'Cuando tu docente abra un relámpago, una votación o una encuesta, aparecerá aquí para que respondas.',
    },
    e3: {
      titulo: 'Notas',
      texto: 'Aquí ves tus calificaciones, cómo se calculó cada una y lo que tu docente te comenta para mejorar.',
    },
  },
  docente: {
    d13: {
      titulo: 'Personas',
      texto: 'Aquí invitas a tus estudiantes por correo o con un CSV, y asignas roles. Quien se registre con ese correo queda dentro del curso.',
    },
    d14: {
      titulo: 'Trabajos',
      texto: 'Aquí publicas lo que se entrega y su fecha límite. Los estudiantes lo verán en sus Entregas.',
    },
    d15: {
      titulo: 'Banco de preguntas',
      texto: 'Aquí cargas las preguntas que tus estudiantes practican, por dimensión y dificultad. Puedes pegar un JSON o subir un CSV.',
    },
    d2: {
      titulo: 'Diagnóstico y rutas',
      texto: 'Aquí registras el diagnóstico de entrada de cada estudiante, con y sin IA, y confirmas la ruta del curso.',
    },
    d7: {
      titulo: 'Equipos',
      texto: 'Aquí defines el tamaño de los equipos de cada trabajo, los sorteas y los ajustas a mano si hace falta.',
    },
    d1: {
      titulo: 'Panel del curso',
      texto: 'Un vistazo a tu curso: entregas por cargar y calificar, lo que requiere tu atención y la próxima clase.',
    },
    d8: {
      titulo: 'Estudiantes',
      texto: 'La ficha de cada estudiante: su radar, sus notas, su asistencia y su práctica en un solo lugar.',
    },
    d12: {
      titulo: 'Resultados',
      texto: 'El histórico de encuestas, votaciones y relámpagos, con la opción de exportarlos a CSV.',
    },
    d16: {
      titulo: 'Asistencia',
      texto: 'Aquí abres la asistencia de cada clase: proyectas un QR y un código que cambian cada 20 segundos, y ves quién llegó.',
    },
    d6: {
      titulo: 'Calendario',
      texto: 'Aquí cargas las sesiones del curso con su fecha, su tema y cómo corre cada una. Tus estudiantes lo ven al instante.',
    },
    d9: {
      titulo: 'Material',
      texto: 'Aquí guardas los recursos de cada sesión, con su idioma y si ya verificaste que el enlace sirve.',
    },
    d5: {
      titulo: 'Formularios',
      texto: 'Aquí creas relámpagos, votaciones y encuestas, con su respuesta correcta, su tiempo y si son anónimos.',
    },
    d11: {
      titulo: 'En clase',
      texto: 'Aquí abres un formulario para que tus estudiantes lo respondan, y ves la participación y los resultados en vivo.',
    },
    d10: {
      titulo: 'Rúbricas',
      texto: 'Aquí defines las dimensiones del radar y los criterios con que calificas cada trabajo, con sus cinco niveles.',
    },
    d3: {
      titulo: 'Entregas',
      texto: 'Aquí llegan las entregas de tus estudiantes: quién entregó, con o sin IA, y el enlace a su Pull Request.',
    },
  },
  observador: {},
};

export const anuncioDe = (rol: Rol, clave: string): AnuncioSeccion | null => POR_ROL[rol][clave] ?? COMUN[clave] ?? null;

export function GuiaDesbloqueo({ anuncio, quedan, alAvanzar }: { anuncio: AnuncioSeccion; quedan: number; alAvanzar: () => void }) {
  return (
    <div className="guia-nueva" role="status" aria-live="polite">
      <Jaguar pose="saluda" ancho={104} clase="guia-nueva__jaguar" />
      <div className="guia-nueva__globo">
        <small>Nueva sección</small>
        <strong>{anuncio.titulo}</strong>
        <p>{anuncio.texto}</p>
        <button onClick={alAvanzar}>{quedan > 1 ? 'Siguiente' : 'Entendido'}</button>
      </div>
    </div>
  );
}

export function MuestraGuiaDesbloqueo() {
  return <GuiaDesbloqueo anuncio={{ titulo: 'Personas', texto: POR_ROL.docente.d13.texto }} quedan={2} alAvanzar={() => undefined} />;
}
