import type { ComponentType } from 'react';
import { E0Acceso } from './pantallas/E0Acceso';
import { E10Mision } from './pantallas/E10Mision';
import { E11Resumen } from './pantallas/E11Resumen';
import { E12Perfil } from './pantallas/E12Perfil';
import { E13VotacionVivo } from './pantallas/E13VotacionVivo';
import { E14Tutorial } from './pantallas/E14Tutorial';
import { E15Practicar } from './pantallas/E15Practicar';
import { D1Panel } from './pantallas/D1Panel';
import { D2DiagnosticoRutas } from './pantallas/D2DiagnosticoRutas';
import { D3Entregas } from './pantallas/D3Entregas';
import { D4Correccion } from './pantallas/D4Correccion';
import { D5Formularios } from './pantallas/D5Formularios';
import { D6CalendarioDocente } from './pantallas/D6CalendarioDocente';
import { D7Equipos } from './pantallas/D7Equipos';
import { D8Estudiantes } from './pantallas/D8Estudiantes';
import { D9Material } from './pantallas/D9Material';
import { D10Configuracion } from './pantallas/D10Configuracion';
import { D11EnClase } from './pantallas/D11EnClase';
import { O1ResumenGrupos } from './pantallas/O1ResumenGrupos';
import { O2DimensionesTrabajos } from './pantallas/O2DimensionesTrabajos';
import { O3QueVeObservador } from './pantallas/O3QueVeObservador';
import { E26Estados } from './pantallas/E26Estados';
import { E27PracticaFallos } from './pantallas/E27PracticaFallos';
import { E28RelampagoIncorrecta } from './pantallas/E28RelampagoIncorrecta';
import { E29EntregaConProblemas } from './pantallas/E29EntregaConProblemas';
import { E30Historico } from './pantallas/E30Historico';
import { E31Liga } from './pantallas/E31Liga';
import { D12Resultados } from './pantallas/D12Resultados';
import { D13Personas } from './pantallas/D13Personas';
import { D14Trabajos } from './pantallas/D14Trabajos';
import { AyudaDocente, InicioDocente, InicioSinCurso } from './componentes/inicio';
import { Cursos } from './pantallas/Cursos';
import { CursoDetalle } from './pantallas/CursoDetalle';
import { E32Sonidos } from './pantallas/E32Sonidos';
import { E16UnirConceptos } from './pantallas/E16UnirConceptos';
import { E17Diagnostico } from './pantallas/E17Diagnostico';
import { E18EjercicioDiagnostico } from './pantallas/E18EjercicioDiagnostico';
import { E19ResultadoDiagnostico } from './pantallas/E19ResultadoDiagnostico';
import { E20Relampago } from './pantallas/E20Relampago';
import { E21ResultadoRelampago } from './pantallas/E21ResultadoRelampago';
import { E22Calendario } from './pantallas/E22Calendario';
import { E23DetalleSesion } from './pantallas/E23DetalleSesion';
import { E24RutaEquipo } from './pantallas/E24RutaEquipo';
import { E25VotacionHerramienta } from './pantallas/E25VotacionHerramienta';
import { E1Home } from './pantallas/E1Home';
import { E1Ruta } from './pantallas/E1Ruta';
import { E2Radar } from './pantallas/E2Radar';
import { E3Notas } from './pantallas/E3Notas';
import { E4DetalleNota } from './pantallas/E4DetalleNota';
import { E5Entregas } from './pantallas/E5Entregas';
import { E6NuevaEntrega } from './pantallas/E6NuevaEntrega';
import { E7Leccion } from './pantallas/E7Leccion';
import { E8ResultadoLeccion } from './pantallas/E8ResultadoLeccion';
import { E9Votacion } from './pantallas/E9Votacion';

export interface RegistroPantalla {
  codigo: string;
  titulo: string;
  grupo: string;
  componente: ComponentType;
}

export const PANTALLAS: RegistroPantalla[] = [
  { codigo: 'e0', titulo: 'Acceso', grupo: 'Estudiante', componente: E0Acceso },
  { codigo: 'home', titulo: 'Inicio (campamento)', grupo: 'Estudiante', componente: E1Home },
  { codigo: 'tutorial', titulo: 'Tutorial', grupo: 'Estudiante', componente: E14Tutorial },
  { codigo: 'e1', titulo: 'Ruta', grupo: 'Estudiante', componente: E1Ruta },
  { codigo: 'e2', titulo: 'Radar', grupo: 'Estudiante', componente: E2Radar },
  { codigo: 'e3', titulo: 'Notas', grupo: 'Estudiante', componente: E3Notas },
  { codigo: 'e4', titulo: 'Detalle de nota', grupo: 'Estudiante', componente: E4DetalleNota },
  { codigo: 'e5', titulo: 'Entregas', grupo: 'Estudiante', componente: E5Entregas },
  { codigo: 'e6', titulo: 'Nueva entrega', grupo: 'Estudiante', componente: E6NuevaEntrega },
  { codigo: 'e17', titulo: 'Diagnóstico', grupo: 'Estudiante', componente: E17Diagnostico },
  { codigo: 'e18', titulo: 'Diagnóstico: ejercicio', grupo: 'Estudiante', componente: E18EjercicioDiagnostico },
  { codigo: 'e19', titulo: 'Diagnóstico: resultado', grupo: 'Estudiante', componente: E19ResultadoDiagnostico },
  { codigo: 'e20', titulo: 'Relámpago y pulso', grupo: 'Estudiante', componente: E20Relampago },
  { codigo: 'e21', titulo: 'Resultado de relámpago', grupo: 'Estudiante', componente: E21ResultadoRelampago },
  { codigo: 'e22', titulo: 'Calendario', grupo: 'Estudiante', componente: E22Calendario },
  { codigo: 'e23', titulo: 'Detalle de sesión', grupo: 'Estudiante', componente: E23DetalleSesion },
  { codigo: 'e24', titulo: 'Mi ruta y equipo', grupo: 'Estudiante', componente: E24RutaEquipo },
  { codigo: 'e25', titulo: 'Votación de herramienta', grupo: 'Estudiante', componente: E25VotacionHerramienta },
  { codigo: 'e15', titulo: 'Practicar (álbum)', grupo: 'Estudiante', componente: E15Practicar },
  { codigo: 'e7', titulo: 'Lección', grupo: 'Estudiante', componente: E7Leccion },
  { codigo: 'e16', titulo: 'Lección · unir conceptos', grupo: 'Estudiante', componente: E16UnirConceptos },
  { codigo: 'e8', titulo: 'Resultado de lección', grupo: 'Estudiante', componente: E8ResultadoLeccion },
  { codigo: 'e9', titulo: 'Votación del modo de clase', grupo: 'Estudiante', componente: E9Votacion },
  { codigo: 'e10', titulo: 'Misión en equipo', grupo: 'Estudiante', componente: E10Mision },
  { codigo: 'e11', titulo: 'Resumen semanal', grupo: 'Estudiante', componente: E11Resumen },
  { codigo: 'e12', titulo: 'Perfil', grupo: 'Estudiante', componente: E12Perfil },
  { codigo: 'e13', titulo: 'Votación en vivo', grupo: 'Estudiante', componente: E13VotacionVivo },
  { codigo: 'd1', titulo: 'Panel del curso', grupo: 'Docente', componente: D1Panel },
  { codigo: 'd2', titulo: 'Diagnóstico y rutas', grupo: 'Docente', componente: D2DiagnosticoRutas },
  { codigo: 'd3', titulo: 'Entregas', grupo: 'Docente', componente: D3Entregas },
  { codigo: 'd4', titulo: 'Corrección de una entrega', grupo: 'Docente', componente: D4Correccion },
  { codigo: 'd5', titulo: 'Formularios', grupo: 'Docente', componente: D5Formularios },
  { codigo: 'd6', titulo: 'Calendario y plazos', grupo: 'Docente', componente: D6CalendarioDocente },
  { codigo: 'd7', titulo: 'Equipos', grupo: 'Docente', componente: D7Equipos },
  { codigo: 'd8', titulo: 'Ficha de estudiante', grupo: 'Docente', componente: D8Estudiantes },
  { codigo: 'd9', titulo: 'Material', grupo: 'Docente', componente: D9Material },
  { codigo: 'd10', titulo: 'Configuración', grupo: 'Docente', componente: D10Configuracion },
  { codigo: 'd11', titulo: 'En clase (relámpago y QR)', grupo: 'Docente', componente: D11EnClase },
  { codigo: 'o1', titulo: 'Resumen por grupo', grupo: 'Observador', componente: O1ResumenGrupos },
  { codigo: 'o2', titulo: 'Dimensiones y trabajos', grupo: 'Observador', componente: O2DimensionesTrabajos },
  { codigo: 'o3', titulo: 'Qué puede ver', grupo: 'Observador', componente: O3QueVeObservador },
  { codigo: 'e26', titulo: 'Estados del sistema', grupo: 'Transversal', componente: E26Estados },
  { codigo: 'e27', titulo: 'Práctica con fallos', grupo: 'Estudiante', componente: E27PracticaFallos },
  { codigo: 'e28', titulo: 'Relámpago incorrecta', grupo: 'Estudiante', componente: E28RelampagoIncorrecta },
  { codigo: 'e29', titulo: 'Entrega con problemas', grupo: 'Estudiante', componente: E29EntregaConProblemas },
  { codigo: 'e30', titulo: 'Mis resultados (histórico)', grupo: 'Estudiante', componente: E30Historico },
  { codigo: 'e31', titulo: 'Liga del modo competitivo', grupo: 'Estudiante', componente: E31Liga },
  { codigo: 'd12', titulo: 'Resultados de formularios', grupo: 'Docente', componente: D12Resultados },
  { codigo: 'd13', titulo: 'Personas y grupos', grupo: 'Docente', componente: D13Personas },
  { codigo: 'd14', titulo: 'Trabajos del curso', grupo: 'Docente', componente: D14Trabajos },
  { codigo: 'inicio', titulo: 'Inicio del docente', grupo: 'Docente', componente: InicioDocente },
  { codigo: 'ayuda', titulo: 'Ayuda del docente', grupo: 'Docente', componente: AyudaDocente },
  { codigo: 'curso', titulo: 'Detalle del curso', grupo: 'Transversal', componente: CursoDetalle },
  { codigo: 'cursos', titulo: 'Mis cursos', grupo: 'Transversal', componente: Cursos },
  { codigo: 'e33', titulo: 'Inicio sin curso (estudiante nuevo)', grupo: 'Transversal', componente: InicioSinCurso },
  { codigo: 'e32', titulo: 'Galería de sonidos', grupo: 'Transversal', componente: E32Sonidos },
];
