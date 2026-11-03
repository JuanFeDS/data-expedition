import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { D6CalendarioReal } from './CalendarioReal';

export const D6CalendarioDocente = conModoDemo(() => import('../../../demo/pantallas/calendario/docente/Calendario'), 'D6CalendarioDocenteEjemplo', D6CalendarioReal);
