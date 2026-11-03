import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { D10Rubricas } from './Rubricas';

export const D10Configuracion = conModoDemo(() => import('../../../demo/pantallas/rubricas/docente/Configuracion'), 'D10ConfiguracionEjemplo', D10Rubricas);
