import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { D8FichaReal } from './EstudiantesReal';

export const D8Estudiantes = conModoDemo(() => import('../../../demo/pantallas/progreso/docente/Estudiantes'), 'D8EstudiantesEjemplo', D8FichaReal);
