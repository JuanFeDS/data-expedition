import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { D5FormulariosReal } from './FormulariosReal';

export const D5Formularios = conModoDemo(() => import('../../../demo/pantallas/formularios/docente/Formularios'), 'D5FormulariosEjemplo', D5FormulariosReal);
