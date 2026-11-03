import { describe, expect, it } from 'vitest';
import { dinamicaATexto, fechaAEntrada, textoADinamica } from './calendario';
import { notaPonderada, type CriterioCalificable } from './calificaciones';
import { leerCsv } from './csv';
import { armarSesion, dificultadPara, leerBanco, type PreguntaBanco } from './practica';
import { UMBRAL_NIVELACION, UMBRAL_PROFUNDIZACION, calcularRadar, rutaDeEstudiante, rutaPropuestaDelCurso } from './radar';
import { finDelDia, formatoFecha, trabajoPorEntregar, type EntregaPropia, type TrabajoCurso } from './trabajos';

const criterio = (id: string, peso: number): CriterioCalificable => ({ id, nombre: id, dimension: 'Datos', peso, descriptores: ['', '', '', '', ''] });

describe('notaPonderada', () => {
  it('promedia los niveles ponderando por el peso de cada criterio', () => {
    const criterios = [criterio('a', 2), criterio('b', 1)];
    expect(notaPonderada(criterios, { a: 4, b: 2.5 })).toBe(3.5);
  });

  it('redondea a un decimal', () => {
    expect(notaPonderada([criterio('a', 1), criterio('b', 1), criterio('c', 1)], { a: 4, b: 4, c: 3.5 })).toBe(3.8);
  });

  it('usa nivel 1 para un criterio sin calificar y devuelve 0 sin criterios', () => {
    expect(notaPonderada([criterio('a', 1)], {})).toBe(1);
    expect(notaPonderada([], {})).toBe(0);
  });
});

describe('leerBanco', () => {
  const dimensiones = [{ id: 'd1', nombre: 'Validación' }, { id: 'd2', nombre: 'Datos' }];

  it('acepta JSON de opción múltiple y reconoce la dimensión sin importar mayúsculas', () => {
    const resultado = leerBanco(JSON.stringify([{ dimension: 'validación', tipo: 'opciones', enunciado: 'x', opciones: ['a', 'b'], correcta: 1 }]), dimensiones);
    expect(resultado.errores).toEqual([]);
    expect(resultado.filas).toHaveLength(1);
    expect(resultado.filas[0]).toMatchObject({ dimensionId: 'd1', dificultad: 'estandar', formato: 'opciones' });
  });

  it('rechaza dimensiones inexistentes, tipos inválidos y respuestas fuera de rango con el motivo', () => {
    const resultado = leerBanco(JSON.stringify([
      { dimension: 'Nada', tipo: 'opciones' },
      { dimension: 'Datos', tipo: 'otro' },
      { dimension: 'Datos', tipo: 'opciones', enunciado: 'x', opciones: ['a', 'b'], correcta: 5 },
    ]), dimensiones);
    expect(resultado.filas).toHaveLength(0);
    expect(resultado.errores).toHaveLength(3);
    expect(resultado.errores[0]).toContain('Nada');
  });

  it('lee CSV de opción múltiple con comillas y comas dentro del enunciado', () => {
    const csv = 'dimension,dificultad,enunciado,a,b,c,d,correcta,explicacion\nDatos,reto,"¿Qué, es?",uno,dos,tres,,b,porque';
    const resultado = leerBanco(csv, dimensiones);
    expect(resultado.errores).toEqual([]);
    expect(resultado.filas[0]).toMatchObject({ dificultad: 'reto', contenido: { enunciado: '¿Qué, es?', opciones: ['uno', 'dos', 'tres'], correcta: 1 } });
  });

  it('informa cuando no hay texto o el JSON está roto', () => {
    expect(leerBanco('   ', dimensiones).errores).toHaveLength(1);
    expect(leerBanco('[{"a":', dimensiones).errores[0]).toContain('JSON');
  });

  it('valida los cinco formatos', () => {
    const base = { dimension: 'Datos' };
    const resultado = leerBanco(JSON.stringify([
      { ...base, tipo: 'vf', enunciado: 'x', verdadera: true, justificaciones: ['a', 'b'], correctaJustificacion: 0 },
      { ...base, tipo: 'unir', enunciado: 'x', pares: [{ concepto: 'a', definicion: 'b' }, { concepto: 'c', definicion: 'd' }] },
      { ...base, tipo: 'ordenar', enunciado: 'x', pasos: ['uno', 'dos'] },
      { ...base, tipo: 'completar', antes: 'a', despues: 'b', opciones: ['x', 'y'], correcta: 0 },
    ]), dimensiones);
    expect(resultado.errores).toEqual([]);
    expect(resultado.filas.map((fila) => fila.formato)).toEqual(['vf', 'unir', 'ordenar', 'completar']);
  });
});

describe('práctica', () => {
  it('elige la dificultad según el nivel del radar', () => {
    expect(dificultadPara(UMBRAL_NIVELACION - 1)).toBe('base');
    expect(dificultadPara(UMBRAL_NIVELACION)).toBe('estandar');
    expect(dificultadPara(UMBRAL_PROFUNDIZACION)).toBe('estandar');
    expect(dificultadPara(UMBRAL_PROFUNDIZACION + 1)).toBe('reto');
  });

  const pregunta = (id: string, dimensionId: string): PreguntaBanco => ({ id, dimensionId, dificultad: 'estandar', datos: { tipo: 'completar', antes: '', despues: '', opciones: ['a', 'b'], correcta: 0, explicacion: '' } });

  it('arma sesiones sin repetir preguntas y sin pasarse del tamaño', () => {
    const banco = Array.from({ length: 12 }, (_, indice) => pregunta(`p${indice}`, indice % 2 ? 'd1' : 'd2'));
    for (let intento = 0; intento < 20; intento += 1) {
      const sesion = armarSesion(banco, [], 5);
      expect(sesion).toHaveLength(5);
      expect(new Set(sesion.map((fila) => fila.id)).size).toBe(5);
    }
  });

  it('usa todo el banco si tiene menos preguntas que el tamaño de la sesión', () => {
    expect(armarSesion([pregunta('a', 'd1'), pregunta('b', 'd1')], [], 5)).toHaveLength(2);
    expect(armarSesion([], [], 5)).toHaveLength(0);
  });
});

describe('radar y rutas', () => {
  const dimensiones = [{ id: 'd1', nombre: 'Datos' }, { id: 'd2', nombre: 'Análisis' }];

  it('calcula el punto de partida con el diagnóstico y el avance con todas las evidencias ponderadas', () => {
    const puntos = calcularRadar(dimensiones, [
      { dimension_id: 'd1', fuente: 'diagnostico_inicial', valor: 40, peso: 1 },
      { dimension_id: 'd1', fuente: 'trabajo', valor: 80, peso: 2 },
    ]);
    expect(puntos[0]).toMatchObject({ inicio: 40, ahora: 67, tieneInicio: true, tieneEvidencia: true });
    expect(puntos[1]).toMatchObject({ inicio: 0, ahora: 0, tieneInicio: false, tieneEvidencia: false });
  });

  it('asigna la ruta del estudiante por su resultado en Datos', () => {
    expect(rutaDeEstudiante(null)).toBeNull();
    expect(rutaDeEstudiante(UMBRAL_NIVELACION - 1)).toBe('nivelacion');
    expect(rutaDeEstudiante(65)).toBe('estandar');
    expect(rutaDeEstudiante(UMBRAL_PROFUNDIZACION + 1)).toBe('profundizacion');
  });

  it('propone la ruta del curso según el porcentaje que llega al nivel', () => {
    expect(rutaPropuestaDelCurso(30)).toBe('nivelacion');
    expect(rutaPropuestaDelCurso(65)).toBe('estandar');
    expect(rutaPropuestaDelCurso(90)).toBe('profundizacion');
  });
});

describe('trabajos', () => {
  const trabajo = (id: string): TrabajoCurso => ({ id, nombre: id, tema: '', semana: null, venceEn: null, minPylint: 8 });
  const entrega = (trabajoId: string, estado: EntregaPropia['estado']): EntregaPropia => ({ trabajoId, estado, modoIa: 'sin_ia', enlacePr: null, entregadaEn: null, nota: null });

  it('el trabajo por entregar es el primero sin entrega enviada; un borrador no cuenta', () => {
    const trabajos = [trabajo('t1'), trabajo('t2'), trabajo('t3')];
    expect(trabajoPorEntregar(trabajos, [entrega('t1', 'entregada'), entrega('t2', 'borrador')])?.id).toBe('t2');
    expect(trabajoPorEntregar(trabajos, trabajos.map((item) => entrega(item.id, 'calificada')))).toBeNull();
  });

  it('da formato a las fechas y cierra el día a las 11:59 p. m.', () => {
    expect(formatoFecha(null).largo).toBe('sin fecha');
    const fecha = new Date(finDelDia('2026-11-27'));
    expect([fecha.getHours(), fecha.getMinutes()]).toEqual([23, 59]);
  });
});

describe('calendario', () => {
  it('convierte la dinámica de una sesión de texto a momentos y de vuelta', () => {
    const texto = '0–10 | Preguntas | Lo que quedó\n10–70 | Trabajo del PR | En parejas';
    const momentos = textoADinamica(texto);
    expect(momentos).toEqual([{ min: '0–10', dinamica: 'Preguntas', detalle: 'Lo que quedó' }, { min: '10–70', dinamica: 'Trabajo del PR', detalle: 'En parejas' }]);
    expect(dinamicaATexto(momentos)).toBe(texto);
  });

  it('ignora líneas sin nombre de dinámica', () => {
    expect(textoADinamica('solo minutos\n\n5 |  | nada')).toEqual([]);
  });

  it('formatea la fecha para el campo local sin desfase', () => {
    expect(fechaAEntrada(null)).toBe('');
    expect(fechaAEntrada(new Date(2026, 10, 27, 18, 5).toISOString())).toBe('2026-11-27T18:05');
  });
});

describe('importación de personas por CSV', () => {
  it('lee correos con rol, detecta el separador y avisa de las líneas con error', () => {
    const resultado = leerCsv('correo;rol\nana@gmail.com;estudiante\nmal-correo;estudiante\nluis@gmail.com;marciano');
    expect(resultado.filas).toEqual([{ correo: 'ana@gmail.com', rol: 'estudiante' }]);
    expect(resultado.errores).toHaveLength(2);
  });

  it('sin encabezado asume correo y rol estudiante por defecto, y elimina duplicados', () => {
    const resultado = leerCsv('ana@gmail.com\nANA@gmail.com');
    expect(resultado.filas).toEqual([{ correo: 'ana@gmail.com', rol: 'estudiante' }]);
  });
});
