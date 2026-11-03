// Las secciones de un curso, en el orden en que conviene recorrerlas. Cada persona las va
// desbloqueando al entrar (ver componentes/desbloqueos.tsx); el orden solo ordena el panel y cuenta el avance.
export const RUTA_DOCENTE = ['curso', 'd13', 'd14', 'd10', 'd3', 'd5', 'd11', 'd6', 'd16', 'd9', 'd7', 'd2', 'd15'];
export const RUTA_ESTUDIANTE = ['curso', 'e5', 'e3', 'e20', 'e22', 'asistir', 'e24', 'e17', 'e2', 'e15'];

export const rutaDeRol = (rol: string): string[] => (rol === 'docente' ? RUTA_DOCENTE : rol === 'estudiante' ? RUTA_ESTUDIANTE : []);
