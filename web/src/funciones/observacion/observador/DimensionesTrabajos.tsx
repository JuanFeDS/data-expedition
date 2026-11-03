import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { O2DimensionesReal } from './ObservadorReal';

export const O2DimensionesTrabajos = conModoDemo(() => import('../../../demo/pantallas/observacion/observador/DimensionesTrabajos'), 'O2DimensionesTrabajosEjemplo', O2DimensionesReal);
