import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { D2DiagnosticoReal } from './DiagnosticoRutasReal';

export const D2DiagnosticoRutas = conModoDemo(() => import('../../../demo/pantallas/diagnostico/docente/DiagnosticoRutas'), 'D2DiagnosticoRutasEjemplo', D2DiagnosticoReal);
