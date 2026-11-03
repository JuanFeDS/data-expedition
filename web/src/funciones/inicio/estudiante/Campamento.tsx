import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E1HomeReal } from './CampamentoReal';

export const E1Home = conModoDemo(() => import('../../../demo/pantallas/inicio/estudiante/Campamento'), 'E1HomeEjemplo', E1HomeReal);
