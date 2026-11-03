import { useContext, type ReactNode } from 'react';
import { Jaguar, type PoseJaguar } from './Jaguar';
import { Isla } from './Region';
import { useRutaCurso } from '../estado/curso';
import { esConectada } from '../navegacion/navegacion';
import { useSesion } from '../estado/sesion';
import { Kicker, ModoModal } from './ui';

interface PropsCabecera {
  atras?: { texto: string; ruta: string };
  kicker?: string;
  titulo: string;
  subtitulo?: string;
  isla?: string;
  objeto?: string;
  jaguar?: PoseJaguar;
  children?: ReactNode;
}

export function CabeceraMundo({ atras, kicker, titulo, subtitulo, isla, objeto, jaguar, children }: PropsCabecera) {
  const modal = useContext(ModoModal);
  const { modoDemo } = useSesion();
  const rutaCurso = useRutaCurso();
  return (
    <header className="mundo">
      {atras && !modal && (modoDemo || esConectada(atras.ruta)) && <a className="mundo__atras" href={rutaCurso(atras.ruta)}>‹ {atras.texto}</a>}
      <div className="mundo__texto">
        {kicker && <Kicker estilo={{ color: 'var(--mint)' }}>{kicker}</Kicker>}
        <h1 className={`titulo ${titulo.split(' ').some((palabra) => palabra.length > 11) ? 'titulo--largo' : ''}`}>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
        {children}
      </div>
      {isla && <span className="mundo__arte"><Isla bioma={isla} /></span>}
      {objeto && <span className={`mundo__arte mundo__arte--objeto ${jaguar ? 'mundo__arte--junto' : ''}`}><img className="mundo__objeto" src={`${import.meta.env.BASE_URL}objetos/${objeto}.webp`} alt="" /></span>}
      {jaguar && <Jaguar pose={jaguar} ancho={104} clase="mundo__jaguar" />}
    </header>
  );
}
