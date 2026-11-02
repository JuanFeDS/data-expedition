import { alternarSonido, alternarSonidoDeClase, useSonido } from './sonidos';

export function InterruptorSonido() {
  const { activo } = useSonido();
  return (
    <button className="interruptor-tema" role="switch" aria-checked={activo} onClick={alternarSonido}>
      <span className="interruptor-tema__pista" aria-hidden="true"><i /></span>
      <span>Sonido</span>
    </button>
  );
}

export function InterruptorSonidoDeClase() {
  const { clase } = useSonido();
  return (
    <button className="interruptor-tema" role="switch" aria-checked={clase} onClick={alternarSonidoDeClase}>
      <span className="interruptor-tema__pista" aria-hidden="true"><i /></span>
      <span>Sonidos de clase</span>
    </button>
  );
}
