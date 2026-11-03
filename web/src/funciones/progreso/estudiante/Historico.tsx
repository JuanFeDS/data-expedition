import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E30HistoricoReal } from './HistoricoReal';

export const E30Historico = conModoDemo(() => import('../../../demo/pantallas/progreso/estudiante/Historico'), 'E30HistoricoEjemplo', E30HistoricoReal);
