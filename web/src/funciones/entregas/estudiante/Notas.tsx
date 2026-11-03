import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E3NotasReal } from './NotasReal';

export const E3Notas = conModoDemo(() => import('../../../demo/pantallas/entregas/estudiante/Notas'), 'E3NotasEjemplo', E3NotasReal);
