import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E22CalendarioReal } from './CalendarioReal';

export const E22Calendario = conModoDemo(() => import('../../../demo/pantallas/calendario/estudiante/Calendario'), 'E22CalendarioEjemplo', E22CalendarioReal);
