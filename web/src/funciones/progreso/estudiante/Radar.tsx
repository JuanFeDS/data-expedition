import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E2RadarReal } from './RadarReal';

export const E2Radar = conModoDemo(() => import('../../../demo/pantallas/progreso/estudiante/Radar'), 'E2RadarEjemplo', E2RadarReal);
