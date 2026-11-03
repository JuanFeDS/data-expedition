import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { D12ResultadosReal } from './ResultadosReal';

export const D12Resultados = conModoDemo(() => import('../../../demo/pantallas/formularios/docente/Resultados'), 'D12ResultadosEjemplo', D12ResultadosReal);
