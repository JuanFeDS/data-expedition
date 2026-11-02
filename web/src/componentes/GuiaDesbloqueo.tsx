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
