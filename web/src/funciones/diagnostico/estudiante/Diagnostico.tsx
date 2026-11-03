import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { E17DiagnosticoReal } from './DiagnosticoReal';

export const E17Diagnostico = conModoDemo(() => import('../../../demo/pantallas/diagnostico/estudiante/Diagnostico'), 'E17DiagnosticoEjemplo', E17DiagnosticoReal);
