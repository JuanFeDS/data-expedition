import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E15PracticarReal } from './PracticarReal';

export const E15Practicar = conModoDemo(() => import('../../../demo/pantallas/practica/estudiante/Practicar'), 'E15PracticarEjemplo', E15PracticarReal);
