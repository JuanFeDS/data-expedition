import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { D1PanelReal } from './PanelReal';

export const D1Panel = conModoDemo(() => import('../../../demo/pantallas/cursos/docente/Panel'), 'D1PanelEjemplo', D1PanelReal);
