import type { Rol } from '../compartido/navegacion/navegacion';
import { CORREO_VALIDO } from './personas';

export interface FilaImportada { correo: string; rol: Rol }
export interface ResultadoCsv { filas: FilaImportada[]; errores: string[] }

const ROLES: Record<string, Rol> = { estudiante: 'estudiante', observador: 'observador', docente: 'docente' };
const COLUMNAS_CORREO = ['correo', 'email', 'e-mail', 'correo electronico', 'correo electrónico'];

const detectarSeparador = (linea: string) => {
  const conteo = (separador: string) => linea.split(separador).length;
  return [',', ';', '\t'].reduce((mejor, candidato) => (conteo(candidato) > conteo(mejor) ? candidato : mejor), ',');
};

const partirLinea = (linea: string, separador: string) => {
  const celdas: string[] = [];
  let actual = '';
  let entreComillas = false;
  for (let i = 0; i < linea.length; i += 1) {
    const caracter = linea[i];
    if (caracter === '"') {
      if (entreComillas && linea[i + 1] === '"') { actual += '"'; i += 1; } else entreComillas = !entreComillas;
    } else if (caracter === separador && !entreComillas) {
      celdas.push(actual);
      actual = '';
    } else actual += caracter;
  }
  celdas.push(actual);
  return celdas.map((celda) => celda.trim());
};

export function leerCsv(texto: string): ResultadoCsv {
  const lineas = texto.replace(/^﻿/, '').split(/\r?\n/).filter((linea) => linea.trim() !== '');
  if (lineas.length === 0) return { filas: [], errores: ['El archivo está vacío.'] };
  const separador = detectarSeparador(lineas[0]);
  const primera = partirLinea(lineas[0], separador).map((celda) => celda.toLowerCase());
  const conEncabezado = primera.some((celda) => COLUMNAS_CORREO.includes(celda));
  const indice = (nombres: string[]) => primera.findIndex((celda) => nombres.includes(celda));
  const columnaCorreo = conEncabezado ? indice(COLUMNAS_CORREO) : 0;
  const columnaRol = conEncabezado ? indice(['rol']) : 1;

  const filas = new Map<string, FilaImportada>();
  const errores: string[] = [];
  lineas.slice(conEncabezado ? 1 : 0).forEach((linea, posicion) => {
    const numero = posicion + (conEncabezado ? 2 : 1);
    const celdas = partirLinea(linea, separador);
    const correo = (celdas[columnaCorreo] ?? '').toLowerCase();
    const rolTexto = columnaRol >= 0 ? (celdas[columnaRol] ?? '').toLowerCase() : '';
    if (!CORREO_VALIDO.test(correo)) { errores.push(`Línea ${numero}: el correo «${correo || 'vacío'}» no es válido.`); return; }
    if (rolTexto && !ROLES[rolTexto]) { errores.push(`Línea ${numero}: el rol «${rolTexto}» no existe (usa estudiante, observador o docente).`); return; }
    filas.set(correo, { correo, rol: ROLES[rolTexto] ?? 'estudiante' });
  });
  return { filas: [...filas.values()], errores };
}

export const PLANTILLA_CSV = ['correo,rol', 'ana@gmail.com,estudiante', 'luis@gmail.com,estudiante', ''].join('\n');
