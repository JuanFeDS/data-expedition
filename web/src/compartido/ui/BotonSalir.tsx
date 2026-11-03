import { useConfirmar } from '../estado/confirmar';
import { useSesion } from '../estado/sesion';

export function BotonSalir({ clase, children }: { clase: string; children: React.ReactNode }) {
  const { persona, cerrarSesion } = useSesion();
  const confirmar = useConfirmar();

  const pedir = async () => {
    const aceptado = await confirmar({
      titulo: '¿Cerrar sesión?',
      texto: `Saldrás de la cuenta de ${persona?.nombre ?? persona?.usuario ?? 'tu usuario'}. Puedes volver a entrar cuando quieras.`,
      cancelar: 'Seguir en la expedición',
      confirmar: 'Cerrar sesión',
    });
    if (aceptado) await cerrarSesion();
  };

  return <button className={clase} onClick={() => void pedir()}>{children}</button>;
}
