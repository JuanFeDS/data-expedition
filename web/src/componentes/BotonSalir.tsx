import { useEffect, useRef, useState } from 'react';
import { Jaguar } from './Jaguar';
import { useSesion } from './sesion';

export function BotonSalir({ clase, children }: { clase: string; children: React.ReactNode }) {
  const { persona, cerrarSesion } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const seguir = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return undefined;
    seguir.current?.focus();
    const alTeclear = (evento: KeyboardEvent) => { if (evento.key === 'Escape') setAbierto(false); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  return (
    <>
      <button className={clase} onClick={() => setAbierto(true)}>{children}</button>
      {abierto && (
        <div className="salir__velo" onClick={() => setAbierto(false)}>
          <div className="salir" role="alertdialog" aria-modal="true" aria-labelledby="salir-titulo" onClick={(evento) => evento.stopPropagation()}>
            <Jaguar pose="pensando" ancho={110} clase="salir__guia" />
            <h2 id="salir-titulo" className="titulo">¿Cerrar sesión?</h2>
            <p>Saldrás de la cuenta de <b>{persona?.nombre ?? persona?.usuario}</b>. Puedes volver a entrar cuando quieras.</p>
            <div className="salir__acciones">
              <button ref={seguir} className="acceso__boton acceso__boton--principal" onClick={() => setAbierto(false)}>Seguir en la expedición</button>
              <button className="salir__confirmar" onClick={() => void cerrarSesion()}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
