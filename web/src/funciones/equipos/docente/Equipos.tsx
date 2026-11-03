import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { D7EquiposReal } from './EquiposReal';

export const D7Equipos = conModoDemo(() => import('../../../demo/pantallas/equipos/docente/Equipos'), 'D7EquiposEjemplo', D7EquiposReal);
