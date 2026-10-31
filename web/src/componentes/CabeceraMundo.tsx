import type { ReactNode } from 'react';
import { Jaguar, type PoseJaguar } from './Jaguar';
import { Isla } from './Region';
import { Kicker } from './ui';

interface PropsCabecera {
  atras?: { texto: string; ruta: string };
  kicker?: string;
  titulo: string;
  subtitulo?: string;
  isla?: string;
  jaguar?: PoseJaguar;
  children?: ReactNode;
}

export function CabeceraMundo({ atras, kicker, titulo, subtitulo, isla, jaguar, children }: PropsCabecera) {
  return (
    <header className="mundo">
      {atras && <a className="mundo__atras" href={atras.ruta}>‹ {atras.texto}</a>}
      <div className="mundo__texto">
        {kicker && <Kicker estilo={{ color: 'var(--mint)' }}>{kicker}</Kicker>}
        <h1 className="titulo">{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
        {children}
      </div>
      {isla && <span className="mundo__arte"><Isla bioma={isla} /></span>}
      {jaguar && <Jaguar pose={jaguar} ancho={104} clase="mundo__jaguar" />}
    </header>
  );
}
