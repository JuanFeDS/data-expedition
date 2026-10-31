import type { ComponentType } from 'react';
import { E1Ruta } from './pantallas/E1Ruta';
import { E2Radar } from './pantallas/E2Radar';
import { E3Notas } from './pantallas/E3Notas';
import { E4DetalleNota } from './pantallas/E4DetalleNota';
import { E5Entregas } from './pantallas/E5Entregas';
import { E6NuevaEntrega } from './pantallas/E6NuevaEntrega';
import { E7Leccion } from './pantallas/E7Leccion';
import { E8ResultadoLeccion } from './pantallas/E8ResultadoLeccion';

export interface RegistroPantalla {
  codigo: string;
  titulo: string;
  grupo: string;
  componente: ComponentType;
}

export const PANTALLAS: RegistroPantalla[] = [
  { codigo: 'e1', titulo: 'Ruta (inicio)', grupo: 'Estudiante · celular', componente: E1Ruta },
  { codigo: 'e2', titulo: 'Radar', grupo: 'Estudiante · celular', componente: E2Radar },
  { codigo: 'e3', titulo: 'Notas', grupo: 'Estudiante · celular', componente: E3Notas },
  { codigo: 'e4', titulo: 'Detalle de nota', grupo: 'Estudiante · celular', componente: E4DetalleNota },
  { codigo: 'e5', titulo: 'Entregas', grupo: 'Estudiante · celular', componente: E5Entregas },
  { codigo: 'e6', titulo: 'Nueva entrega', grupo: 'Estudiante · celular', componente: E6NuevaEntrega },
  { codigo: 'e7', titulo: 'Lección', grupo: 'Estudiante · celular', componente: E7Leccion },
  { codigo: 'e8', titulo: 'Resultado de lección', grupo: 'Estudiante · celular', componente: E8ResultadoLeccion },
];
