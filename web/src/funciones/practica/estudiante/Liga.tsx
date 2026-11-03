import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E31LigaReal } from './LigaReal';

export const E31Liga = conModoDemo(() => import('../../../demo/pantallas/practica/estudiante/Liga'), 'E31LigaEjemplo', E31LigaReal);
