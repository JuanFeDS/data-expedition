import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E23SesionReal } from './DetalleSesionReal';

export const E23DetalleSesion = conModoDemo(() => import('../../../demo/pantallas/calendario/estudiante/DetalleSesion'), 'E23DetalleSesionEjemplo', E23SesionReal);
