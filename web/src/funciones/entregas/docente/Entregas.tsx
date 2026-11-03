import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { D3EntregasReal } from './EntregasReal';

export const D3Entregas = conModoDemo(() => import('../../../demo/pantallas/entregas/docente/Entregas'), 'D3EntregasEjemplo', D3EntregasReal);
