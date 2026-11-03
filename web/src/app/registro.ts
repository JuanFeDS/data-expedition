import { lazy, type ComponentType } from 'react';
import { MuestraGuiaDesbloqueo } from '../compartido/navegacion/GuiaDesbloqueo';
import { AyudaDocente, InicioEstudiante, InicioObservador, InicioPorRol, InicioSinCurso } from '../funciones/inicio/comun/Inicio';

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
  { codigo: 'e0', titulo: 'Acceso', grupo: 'Estudiante', componente: cargar(() => import('../funciones/acceso/comun/Acceso'), 'E0Acceso') },
  { codigo: 'home', titulo: 'Inicio (campamento)', grupo: 'Estudiante', componente: cargar(() => import('../funciones/inicio/estudiante/Campamento'), 'E1Home') },
  { codigo: 'tutorial', titulo: 'Tutorial', grupo: 'Estudiante', componente: cargar(() => import('../funciones/ayuda/estudiante/Tutorial'), 'E14Tutorial') },
  { codigo: 'e1', titulo: 'Ruta', grupo: 'Estudiante', componente: cargar(() => import('../funciones/progreso/estudiante/MapaCurso'), 'E1Ruta') },
  { codigo: 'e2', titulo: 'Radar', grupo: 'Estudiante', componente: cargar(() => import('../funciones/progreso/estudiante/Radar'), 'E2Radar') },
  { codigo: 'e3', titulo: 'Notas', grupo: 'Estudiante', componente: cargar(() => import('../funciones/entregas/estudiante/Notas'), 'E3Notas') },
  { codigo: 'e4', titulo: 'Detalle de nota', grupo: 'Estudiante', componente: cargar(() => import('../funciones/entregas/estudiante/DetalleNota'), 'E4DetalleNota') },
  { codigo: 'e5', titulo: 'Entregas', grupo: 'Estudiante', componente: cargar(() => import('../funciones/entregas/estudiante/Entregas'), 'E5Entregas') },
  { codigo: 'e6', titulo: 'Nueva entrega', grupo: 'Estudiante', componente: cargar(() => import('../funciones/entregas/estudiante/NuevaEntrega'), 'E6NuevaEntrega') },
  { codigo: 'e17', titulo: 'Diagnóstico', grupo: 'Estudiante', componente: cargar(() => import('../funciones/diagnostico/estudiante/Diagnostico'), 'E17Diagnostico') },
  { codigo: 'e18', titulo: 'Diagnóstico: ejercicio', grupo: 'Estudiante', componente: cargar(() => import('../funciones/diagnostico/estudiante/EjercicioDiagnostico'), 'E18EjercicioDiagnostico') },
  { codigo: 'e19', titulo: 'Diagnóstico: resultado', grupo: 'Estudiante', componente: cargar(() => import('../funciones/diagnostico/estudiante/ResultadoDiagnostico'), 'E19ResultadoDiagnostico') },
  { codigo: 'e20', titulo: 'Relámpago y pulso', grupo: 'Estudiante', componente: cargar(() => import('../funciones/formularios/estudiante/Relampago'), 'E20Relampago') },
  { codigo: 'e21', titulo: 'Resultado de relámpago', grupo: 'Estudiante', componente: cargar(() => import('../funciones/formularios/estudiante/ResultadoRelampago'), 'E21ResultadoRelampago') },
  { codigo: 'e22', titulo: 'Calendario', grupo: 'Estudiante', componente: cargar(() => import('../funciones/calendario/estudiante/Calendario'), 'E22Calendario') },
  { codigo: 'e23', titulo: 'Detalle de sesión', grupo: 'Estudiante', componente: cargar(() => import('../funciones/calendario/estudiante/DetalleSesion'), 'E23DetalleSesion') },
  { codigo: 'e24', titulo: 'Mi ruta y equipo', grupo: 'Estudiante', componente: cargar(() => import('../funciones/equipos/estudiante/RutaEquipo'), 'E24RutaEquipo') },
  { codigo: 'e25', titulo: 'Votación de herramienta', grupo: 'Estudiante', componente: cargar(() => import('../funciones/formularios/estudiante/VotacionHerramienta'), 'E25VotacionHerramienta') },
  { codigo: 'e15', titulo: 'Practicar (álbum)', grupo: 'Estudiante', componente: cargar(() => import('../funciones/practica/estudiante/Practicar'), 'E15Practicar') },
  { codigo: 'e7', titulo: 'Lección', grupo: 'Estudiante', componente: cargar(() => import('../funciones/practica/estudiante/Leccion'), 'E7Leccion') },
  { codigo: 'e16', titulo: 'Lección · unir conceptos', grupo: 'Estudiante', componente: cargar(() => import('../funciones/practica/estudiante/UnirConceptos'), 'E16UnirConceptos') },
  { codigo: 'e8', titulo: 'Resultado de lección', grupo: 'Estudiante', componente: cargar(() => import('../funciones/practica/estudiante/ResultadoLeccion'), 'E8ResultadoLeccion') },
  { codigo: 'e9', titulo: 'Votación del modo de clase', grupo: 'Estudiante', componente: cargar(() => import('../funciones/formularios/estudiante/Votacion'), 'E9Votacion') },
  { codigo: 'e10', titulo: 'Misión en equipo', grupo: 'Estudiante', componente: cargar(() => import('../funciones/equipos/estudiante/Mision'), 'E10Mision') },
  { codigo: 'e11', titulo: 'Resumen semanal', grupo: 'Estudiante', componente: cargar(() => import('../funciones/progreso/estudiante/Resumen'), 'E11Resumen') },
  { codigo: 'e12', titulo: 'Perfil', grupo: 'Estudiante', componente: cargar(() => import('../funciones/progreso/estudiante/Perfil'), 'E12Perfil') },
  { codigo: 'e13', titulo: 'Votación en vivo', grupo: 'Estudiante', componente: cargar(() => import('../funciones/formularios/estudiante/VotacionVivo'), 'E13VotacionVivo') },
  { codigo: 'd1', titulo: 'Panel del curso', grupo: 'Docente', componente: cargar(() => import('../funciones/cursos/docente/Panel'), 'D1Panel') },
  { codigo: 'd2', titulo: 'Diagnóstico y rutas', grupo: 'Docente', componente: cargar(() => import('../funciones/diagnostico/docente/DiagnosticoRutas'), 'D2DiagnosticoRutas') },
  { codigo: 'd3', titulo: 'Entregas', grupo: 'Docente', componente: cargar(() => import('../funciones/entregas/docente/Entregas'), 'D3Entregas') },
  { codigo: 'd4', titulo: 'Corrección de una entrega', grupo: 'Docente', componente: cargar(() => import('../funciones/entregas/docente/Correccion'), 'D4Correccion') },
  { codigo: 'd5', titulo: 'Formularios', grupo: 'Docente', componente: cargar(() => import('../funciones/formularios/docente/Formularios'), 'D5Formularios') },
  { codigo: 'd6', titulo: 'Calendario y plazos', grupo: 'Docente', componente: cargar(() => import('../funciones/calendario/docente/Calendario'), 'D6CalendarioDocente') },
  { codigo: 'd7', titulo: 'Equipos', grupo: 'Docente', componente: cargar(() => import('../funciones/equipos/docente/Equipos'), 'D7Equipos') },
  { codigo: 'd8', titulo: 'Ficha de estudiante', grupo: 'Docente', componente: cargar(() => import('../funciones/progreso/docente/Estudiantes'), 'D8Estudiantes') },
  { codigo: 'd9', titulo: 'Material', grupo: 'Docente', componente: cargar(() => import('../funciones/calendario/docente/Material'), 'D9Material') },
  { codigo: 'd15', titulo: 'Banco de preguntas', grupo: 'Docente', componente: cargar(() => import('../funciones/practica/docente/Banco'), 'D15Banco') },
  { codigo: 'd16', titulo: 'Asistencia', grupo: 'Docente', componente: cargar(() => import('../funciones/asistencia/docente/Asistencia'), 'D16Asistencia') },
  { codigo: 'asistir', titulo: 'Registrar asistencia', grupo: 'Estudiante', componente: cargar(() => import('../funciones/asistencia/estudiante/Asistir'), 'Asistir') },
  { codigo: 'trabajo', titulo: 'Detalle de un trabajo', grupo: 'Transversal', componente: cargar(() => import('../funciones/trabajos/comun/DetalleTrabajo'), 'DetalleTrabajoPantalla') },
  { codigo: 'd10', titulo: 'Configuración', grupo: 'Docente', componente: cargar(() => import('../funciones/rubricas/docente/Configuracion'), 'D10Configuracion') },
  { codigo: 'd11', titulo: 'En clase (relámpago y QR)', grupo: 'Docente', componente: cargar(() => import('../funciones/formularios/docente/EnClase'), 'D11EnClase') },
  { codigo: 'o1', titulo: 'Resumen por grupo', grupo: 'Observador', componente: cargar(() => import('../funciones/observacion/observador/ResumenGrupos'), 'O1ResumenGrupos') },
  { codigo: 'o2', titulo: 'Dimensiones y trabajos', grupo: 'Observador', componente: cargar(() => import('../funciones/observacion/observador/DimensionesTrabajos'), 'O2DimensionesTrabajos') },
  { codigo: 'o3', titulo: 'Qué puede ver', grupo: 'Observador', componente: cargar(() => import('../funciones/observacion/observador/QueVeObservador'), 'O3QueVeObservador') },
  { codigo: 'e26', titulo: 'Estados del sistema', grupo: 'Transversal', componente: cargar(() => import('../funciones/ayuda/estudiante/Estados'), 'E26Estados') },
  { codigo: 'e27', titulo: 'Práctica con fallos', grupo: 'Estudiante', componente: cargar(() => import('../funciones/practica/estudiante/PracticaFallos'), 'E27PracticaFallos') },
  { codigo: 'e28', titulo: 'Relámpago incorrecta', grupo: 'Estudiante', componente: cargar(() => import('../funciones/formularios/estudiante/RelampagoIncorrecta'), 'E28RelampagoIncorrecta') },
  { codigo: 'e29', titulo: 'Entrega con problemas', grupo: 'Estudiante', componente: cargar(() => import('../funciones/entregas/estudiante/EntregaConProblemas'), 'E29EntregaConProblemas') },
  { codigo: 'e30', titulo: 'Mis resultados (histórico)', grupo: 'Estudiante', componente: cargar(() => import('../funciones/progreso/estudiante/Historico'), 'E30Historico') },
  { codigo: 'e31', titulo: 'Liga del modo competitivo', grupo: 'Estudiante', componente: cargar(() => import('../funciones/practica/estudiante/Liga'), 'E31Liga') },
  { codigo: 'd12', titulo: 'Resultados de formularios', grupo: 'Docente', componente: cargar(() => import('../funciones/formularios/docente/Resultados'), 'D12Resultados') },
  { codigo: 'd13', titulo: 'Personas y grupos', grupo: 'Docente', componente: cargar(() => import('../funciones/personas/docente/Personas'), 'D13Personas') },
  { codigo: 'd14', titulo: 'Trabajos del curso', grupo: 'Docente', componente: cargar(() => import('../funciones/trabajos/docente/Trabajos'), 'D14Trabajos') },
  { codigo: 'inicio', titulo: 'Inicio (según el rol)', grupo: 'Transversal', componente: InicioPorRol },
  { codigo: 'inicio-observador', titulo: 'Inicio del observador', grupo: 'Observador', componente: InicioObservador },
  { codigo: 'inicio-estudiante', titulo: 'Inicio del estudiante', grupo: 'Estudiante', componente: InicioEstudiante },
  { codigo: 'ayuda', titulo: 'Ayuda del docente', grupo: 'Docente', componente: AyudaDocente },
  { codigo: 'curso', titulo: 'Detalle del curso', grupo: 'Transversal', componente: cargar(() => import('../funciones/cursos/comun/CursoDetalle'), 'CursoDetalle') },
  { codigo: 'guia-nueva', titulo: 'El jaguar presenta una sección', grupo: 'Transversal', componente: MuestraGuiaDesbloqueo },
  { codigo: 'cursos', titulo: 'Mis cursos', grupo: 'Transversal', componente: cargar(() => import('../funciones/cursos/comun/Cursos'), 'Cursos') },
  { codigo: 'e33', titulo: 'Inicio sin curso (estudiante nuevo)', grupo: 'Transversal', componente: InicioSinCurso },
  { codigo: 'e32', titulo: 'Galería de sonidos', grupo: 'Transversal', componente: cargar(() => import('../funciones/ayuda/comun/Sonidos'), 'E32Sonidos') },
];
