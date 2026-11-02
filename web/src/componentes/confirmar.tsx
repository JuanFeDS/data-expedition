import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Jaguar } from './Jaguar';

export interface OpcionesConfirmacion {
  titulo: string;
  texto: string;
  confirmar?: string;
  cancelar?: string;
}

type Confirmar = (opciones: OpcionesConfirmacion) => Promise<boolean>;

const ContextoConfirmar = createContext<Confirmar>(async () => false);

export const useConfirmar = () => useContext(ContextoConfirmar);

interface Pendiente {
  opciones: OpcionesConfirmacion;
  resolver: (aceptado: boolean) => void;
}

export function ConfirmarProvider({ children }: { children: ReactNode }) {
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const seguro = useRef<HTMLButtonElement>(null);

  const confirmar = useCallback<Confirmar>((opciones) => new Promise<boolean>((resolver) => setPendiente({ opciones, resolver })), []);

  const responder = useCallback((aceptado: boolean) => {
    setPendiente((actual) => {
      actual?.resolver(aceptado);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!pendiente) return undefined;
    seguro.current?.focus();
    const alTeclear = (evento: KeyboardEvent) => { if (evento.key === 'Escape') responder(false); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [pendiente, responder]);

  return (
    <ContextoConfirmar.Provider value={confirmar}>
      {children}
      {pendiente && (
        <div className="salir__velo" onClick={() => responder(false)}>
          <div className="salir" role="alertdialog" aria-modal="true" aria-labelledby="confirmar-titulo" onClick={(evento) => evento.stopPropagation()}>
            <Jaguar pose="pensando" ancho={110} clase="salir__guia" />
            <h2 id="confirmar-titulo" className="titulo">{pendiente.opciones.titulo}</h2>
            <p>{pendiente.opciones.texto}</p>
            <div className="salir__acciones">
              <button ref={seguro} className="acceso__boton acceso__boton--principal" onClick={() => responder(false)}>{pendiente.opciones.cancelar ?? 'Cancelar'}</button>
              <button className="salir__confirmar" onClick={() => responder(true)}>{pendiente.opciones.confirmar ?? 'Confirmar'}</button>
            </div>
          </div>
        </div>
      )}
    </ContextoConfirmar.Provider>
  );
}
