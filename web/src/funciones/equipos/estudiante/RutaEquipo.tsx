import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E24EquipoReal } from './RutaEquipoReal';

export const E24RutaEquipo = conModoDemo(() => import('../../../demo/pantallas/equipos/estudiante/RutaEquipo'), 'E24RutaEquipoEjemplo', E24EquipoReal);
