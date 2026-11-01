import type { ComponentType } from 'react';
import { E0Acceso } from './pantallas/E0Acceso';
import { E10Mision } from './pantallas/E10Mision';
import { E11Resumen } from './pantallas/E11Resumen';
import { E12Perfil } from './pantallas/E12Perfil';
import { E13VotacionVivo } from './pantallas/E13VotacionVivo';
import { E14Tutorial } from './pantallas/E14Tutorial';
import { E15Practicar } from './pantallas/E15Practicar';
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
  { codigo: 'e0', titulo: 'Acceso', grupo: 'Estudiante · celular', componente: E0Acceso },
  { codigo: 'home', titulo: 'Inicio (campamento)', grupo: 'Estudiante · celular', componente: E1Home },
  { codigo: 'tutorial', titulo: 'Tutorial', grupo: 'Estudiante · celular', componente: E14Tutorial },
  { codigo: 'e1', titulo: 'Ruta', grupo: 'Estudiante · celular', componente: E1Ruta },
  { codigo: 'e2', titulo: 'Radar', grupo: 'Estudiante · celular', componente: E2Radar },
  { codigo: 'e3', titulo: 'Notas', grupo: 'Estudiante · celular', componente: E3Notas },
  { codigo: 'e4', titulo: 'Detalle de nota', grupo: 'Estudiante · celular', componente: E4DetalleNota },
  { codigo: 'e5', titulo: 'Entregas', grupo: 'Estudiante · celular', componente: E5Entregas },
  { codigo: 'e6', titulo: 'Nueva entrega', grupo: 'Estudiante · celular', componente: E6NuevaEntrega },
  { codigo: 'e15', titulo: 'Practicar (álbum)', grupo: 'Estudiante · celular', componente: E15Practicar },
  { codigo: 'e7', titulo: 'Lección', grupo: 'Estudiante · celular', componente: E7Leccion },
  { codigo: 'e8', titulo: 'Resultado de lección', grupo: 'Estudiante · celular', componente: E8ResultadoLeccion },
  { codigo: 'e9', titulo: 'Votación del modo de clase', grupo: 'Estudiante · celular', componente: E9Votacion },
  { codigo: 'e10', titulo: 'Misión en equipo', grupo: 'Estudiante · celular', componente: E10Mision },
  { codigo: 'e11', titulo: 'Resumen semanal', grupo: 'Estudiante · celular', componente: E11Resumen },
  { codigo: 'e12', titulo: 'Perfil', grupo: 'Estudiante · celular', componente: E12Perfil },
  { codigo: 'e13', titulo: 'Votación en vivo', grupo: 'Estudiante · celular', componente: E13VotacionVivo },
];
