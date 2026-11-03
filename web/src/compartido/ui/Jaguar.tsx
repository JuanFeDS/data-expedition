export type PoseJaguar = 'guia' | 'celebra' | 'pensando' | 'saluda';

interface PropsJaguar {
  pose?: PoseJaguar;
  ancho?: number;
  clase?: string;
}

export function Jaguar({ pose = 'guia', ancho = 128, clase }: PropsJaguar) {
  return <img className={clase} src={`${import.meta.env.BASE_URL}jaguar/${pose}.png`} width={ancho} alt="Tu guía, un jaguar con pañuelo azul" />;
}
