import { lazy, type ComponentType } from 'react';
import { MuestraGuiaDesbloqueo } from './componentes/GuiaDesbloqueo';
import { AyudaDocente, InicioEstudiante, InicioObservador, InicioPorRol, InicioSinCurso } from './componentes/inicio';

type Modulo = Record<string, unknown>;

// Cada pantalla se descarga la primera vez que se abre, así la carga inicial solo trae lo común.
const cargar = (importar: () => Promise<Modulo>, nombre: string) => lazy(() => importar().then((modulo) => ({ default: modulo[nombre] as ComponentType })));

export interface RegistroPantalla {
  codigo: string;
  titulo: string;
  grupo: string;
  componente: ComponentType;
}

export const PANTALLAS: RegistroPantalla[] = [
  { codigo: 'e0', titulo: 'Acceso', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E0Acceso'), 'E0Acceso') },
  { codigo: 'home', titulo: 'Inicio (campamento)', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E1Home'), 'E1Home') },
  { codigo: 'tutorial', titulo: 'Tutorial', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E14Tutorial'), 'E14Tutorial') },
  { codigo: 'e1', titulo: 'Ruta', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E1Ruta'), 'E1Ruta') },
  { codigo: 'e2', titulo: 'Radar', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E2Radar'), 'E2Radar') },
  { codigo: 'e3', titulo: 'Notas', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E3Notas'), 'E3Notas') },
  { codigo: 'e4', titulo: 'Detalle de nota', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E4DetalleNota'), 'E4DetalleNota') },
  { codigo: 'e5', titulo: 'Entregas', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E5Entregas'), 'E5Entregas') },
  { codigo: 'e6', titulo: 'Nueva entrega', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E6NuevaEntrega'), 'E6NuevaEntrega') },
  { codigo: 'e17', titulo: 'Diagnóstico', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E17Diagnostico'), 'E17Diagnostico') },
  { codigo: 'e18', titulo: 'Diagnóstico: ejercicio', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E18EjercicioDiagnostico'), 'E18EjercicioDiagnostico') },
  { codigo: 'e19', titulo: 'Diagnóstico: resultado', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E19ResultadoDiagnostico'), 'E19ResultadoDiagnostico') },
  { codigo: 'e20', titulo: 'Relámpago y pulso', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E20Relampago'), 'E20Relampago') },
  { codigo: 'e21', titulo: 'Resultado de relámpago', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E21ResultadoRelampago'), 'E21ResultadoRelampago') },
  { codigo: 'e22', titulo: 'Calendario', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E22Calendario'), 'E22Calendario') },
  { codigo: 'e23', titulo: 'Detalle de sesión', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E23DetalleSesion'), 'E23DetalleSesion') },
  { codigo: 'e24', titulo: 'Mi ruta y equipo', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E24RutaEquipo'), 'E24RutaEquipo') },
  { codigo: 'e25', titulo: 'Votación de herramienta', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E25VotacionHerramienta'), 'E25VotacionHerramienta') },
  { codigo: 'e15', titulo: 'Practicar (álbum)', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E15Practicar'), 'E15Practicar') },
  { codigo: 'e7', titulo: 'Lección', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E7Leccion'), 'E7Leccion') },
  { codigo: 'e16', titulo: 'Lección · unir conceptos', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E16UnirConceptos'), 'E16UnirConceptos') },
  { codigo: 'e8', titulo: 'Resultado de lección', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E8ResultadoLeccion'), 'E8ResultadoLeccion') },
  { codigo: 'e9', titulo: 'Votación del modo de clase', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E9Votacion'), 'E9Votacion') },
  { codigo: 'e10', titulo: 'Misión en equipo', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E10Mision'), 'E10Mision') },
  { codigo: 'e11', titulo: 'Resumen semanal', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E11Resumen'), 'E11Resumen') },
  { codigo: 'e12', titulo: 'Perfil', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E12Perfil'), 'E12Perfil') },
  { codigo: 'e13', titulo: 'Votación en vivo', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E13VotacionVivo'), 'E13VotacionVivo') },
  { codigo: 'd1', titulo: 'Panel del curso', grupo: 'Docente', componente: cargar(() => import('./pantallas/D1Panel'), 'D1Panel') },
  { codigo: 'd2', titulo: 'Diagnóstico y rutas', grupo: 'Docente', componente: cargar(() => import('./pantallas/D2DiagnosticoRutas'), 'D2DiagnosticoRutas') },
  { codigo: 'd3', titulo: 'Entregas', grupo: 'Docente', componente: cargar(() => import('./pantallas/D3Entregas'), 'D3Entregas') },
  { codigo: 'd4', titulo: 'Corrección de una entrega', grupo: 'Docente', componente: cargar(() => import('./pantallas/D4Correccion'), 'D4Correccion') },
  { codigo: 'd5', titulo: 'Formularios', grupo: 'Docente', componente: cargar(() => import('./pantallas/D5Formularios'), 'D5Formularios') },
  { codigo: 'd6', titulo: 'Calendario y plazos', grupo: 'Docente', componente: cargar(() => import('./pantallas/D6CalendarioDocente'), 'D6CalendarioDocente') },
  { codigo: 'd7', titulo: 'Equipos', grupo: 'Docente', componente: cargar(() => import('./pantallas/D7Equipos'), 'D7Equipos') },
  { codigo: 'd8', titulo: 'Ficha de estudiante', grupo: 'Docente', componente: cargar(() => import('./pantallas/D8Estudiantes'), 'D8Estudiantes') },
  { codigo: 'd9', titulo: 'Material', grupo: 'Docente', componente: cargar(() => import('./pantallas/D9Material'), 'D9Material') },
  { codigo: 'd15', titulo: 'Banco de preguntas', grupo: 'Docente', componente: cargar(() => import('./pantallas/D15Banco'), 'D15Banco') },
  { codigo: 'd16', titulo: 'Asistencia', grupo: 'Docente', componente: cargar(() => import('./pantallas/D16Asistencia'), 'D16Asistencia') },
  { codigo: 'asistir', titulo: 'Registrar asistencia', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/Asistir'), 'Asistir') },
  { codigo: 'trabajo', titulo: 'Detalle de un trabajo', grupo: 'Transversal', componente: cargar(() => import('./pantallas/DetalleTrabajo'), 'DetalleTrabajoPantalla') },
  { codigo: 'd10', titulo: 'Configuración', grupo: 'Docente', componente: cargar(() => import('./pantallas/D10Configuracion'), 'D10Configuracion') },
  { codigo: 'd11', titulo: 'En clase (relámpago y QR)', grupo: 'Docente', componente: cargar(() => import('./pantallas/D11EnClase'), 'D11EnClase') },
  { codigo: 'o1', titulo: 'Resumen por grupo', grupo: 'Observador', componente: cargar(() => import('./pantallas/O1ResumenGrupos'), 'O1ResumenGrupos') },
  { codigo: 'o2', titulo: 'Dimensiones y trabajos', grupo: 'Observador', componente: cargar(() => import('./pantallas/O2DimensionesTrabajos'), 'O2DimensionesTrabajos') },
  { codigo: 'o3', titulo: 'Qué puede ver', grupo: 'Observador', componente: cargar(() => import('./pantallas/O3QueVeObservador'), 'O3QueVeObservador') },
  { codigo: 'e26', titulo: 'Estados del sistema', grupo: 'Transversal', componente: cargar(() => import('./pantallas/E26Estados'), 'E26Estados') },
  { codigo: 'e27', titulo: 'Práctica con fallos', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E27PracticaFallos'), 'E27PracticaFallos') },
  { codigo: 'e28', titulo: 'Relámpago incorrecta', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E28RelampagoIncorrecta'), 'E28RelampagoIncorrecta') },
  { codigo: 'e29', titulo: 'Entrega con problemas', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E29EntregaConProblemas'), 'E29EntregaConProblemas') },
  { codigo: 'e30', titulo: 'Mis resultados (histórico)', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E30Historico'), 'E30Historico') },
  { codigo: 'e31', titulo: 'Liga del modo competitivo', grupo: 'Estudiante', componente: cargar(() => import('./pantallas/E31Liga'), 'E31Liga') },
  { codigo: 'd12', titulo: 'Resultados de formularios', grupo: 'Docente', componente: cargar(() => import('./pantallas/D12Resultados'), 'D12Resultados') },
  { codigo: 'd13', titulo: 'Personas y grupos', grupo: 'Docente', componente: cargar(() => import('./pantallas/D13Personas'), 'D13Personas') },
  { codigo: 'd14', titulo: 'Trabajos del curso', grupo: 'Docente', componente: cargar(() => import('./pantallas/D14Trabajos'), 'D14Trabajos') },
  { codigo: 'inicio', titulo: 'Inicio (según el rol)', grupo: 'Transversal', componente: InicioPorRol },
  { codigo: 'inicio-observador', titulo: 'Inicio del observador', grupo: 'Observador', componente: InicioObservador },
  { codigo: 'inicio-estudiante', titulo: 'Inicio del estudiante', grupo: 'Estudiante', componente: InicioEstudiante },
  { codigo: 'ayuda', titulo: 'Ayuda del docente', grupo: 'Docente', componente: AyudaDocente },
  { codigo: 'curso', titulo: 'Detalle del curso', grupo: 'Transversal', componente: cargar(() => import('./pantallas/CursoDetalle'), 'CursoDetalle') },
  { codigo: 'guia-nueva', titulo: 'El jaguar presenta una sección', grupo: 'Transversal', componente: MuestraGuiaDesbloqueo },
  { codigo: 'cursos', titulo: 'Mis cursos', grupo: 'Transversal', componente: cargar(() => import('./pantallas/Cursos'), 'Cursos') },
  { codigo: 'e33', titulo: 'Inicio sin curso (estudiante nuevo)', grupo: 'Transversal', componente: InicioSinCurso },
  { codigo: 'e32', titulo: 'Galería de sonidos', grupo: 'Transversal', componente: cargar(() => import('./pantallas/E32Sonidos'), 'E32Sonidos') },
];
