import { describe, expect, it } from 'vitest';
import { PANTALLAS } from '../registro';
import { rutaDeRol } from '../servicios/ruta';
import { anuncioDe } from './GuiaDesbloqueo';
import {
  CONECTADAS, ENCURSO, GRUPOS_CURSO, NAVEGACION, RUTAS_COMUNES, analizarRuta, codigoDeRuta, enCurso, gruposVisibles, parametroDeRuta, rutaDeCurso, separarBloqueadas, type Rol,
} from './navegacion';

const ROLES: Rol[] = ['estudiante', 'docente', 'observador'];
const curso = { id: 'c1', nombre: 'Prueba' };
const codigosRegistrados = new Set(PANTALLAS.map((pantalla) => pantalla.codigo));

describe('rutas', () => {
  it('separa el curso del código de pantalla y ignora los parámetros', () => {
    expect(analizarRuta('c/abc/e5')).toEqual({ cursoId: 'abc', codigo: 'e5' });
    expect(analizarRuta('c/abc/trabajo?trabajo=1')).toEqual({ cursoId: 'abc', codigo: 'trabajo' });
    expect(analizarRuta('cursos')).toEqual({ cursoId: null, codigo: 'cursos' });
  });

  it('lleva a una pantalla de curso solo si es de curso', () => {
    expect(enCurso('#/e5', 'c1')).toBe(rutaDeCurso('c1', 'e5'));
    expect(enCurso('#/ayuda', 'c1')).toBe('#/ayuda');
  });

  it('lee parámetros del fragmento', () => {
    window.location.hash = '#/c/c1/trabajo?trabajo=t9&x=1';
    expect(parametroDeRuta('trabajo')).toBe('t9');
    expect(parametroDeRuta('falta')).toBeNull();
  });
});

describe('consistencia del registro', () => {
  it('toda pantalla conectada o de curso está registrada', () => {
    [...CONECTADAS, ...ENCURSO].forEach((codigo) => expect(codigosRegistrados.has(codigo), codigo).toBe(true));
  });

  it('toda pantalla de curso está conectada', () => {
    ENCURSO.forEach((codigo) => expect(CONECTADAS.has(codigo), codigo).toBe(true));
  });

  it('las rutas comunes están conectadas', () => {
    RUTAS_COMUNES.forEach((codigo) => expect(CONECTADAS.has(codigo), codigo).toBe(true));
  });

  it('los códigos de pantalla no se repiten', () => {
    expect(codigosRegistrados.size).toBe(PANTALLAS.length);
  });
});

describe('panel lateral en modo real', () => {
  it('cada sección de un grupo existe, es de curso y pertenece a la ruta de desbloqueo de su rol', () => {
    ROLES.forEach((rol) => {
      const ruta = rutaDeRol(rol);
      GRUPOS_CURSO[rol].flatMap((grupo) => grupo.codigos).forEach((codigo) => {
        expect(ENCURSO.has(codigo), `${rol}:${codigo} de curso`).toBe(true);
        if (ruta.length > 0) expect(ruta.includes(codigo), `${rol}:${codigo} en la ruta`).toBe(true);
      });
    });
  });

  it('cada sección de la ruta de desbloqueo se ve en el panel y tiene mensaje del jaguar', () => {
    ['estudiante', 'docente'].forEach((rol) => {
      const enPanel = new Set(GRUPOS_CURSO[rol as Rol].flatMap((grupo) => grupo.codigos));
      rutaDeRol(rol).forEach((codigo) => {
        expect(enPanel.has(codigo), `${rol}:${codigo} en el panel`).toBe(true);
        expect(anuncioDe(rol as Rol, codigo), `${rol}:${codigo} con mensaje`).not.toBeNull();
      });
    });
  });

  it('las rutas de desbloqueo no repiten secciones', () => {
    ROLES.forEach((rol) => expect(new Set(rutaDeRol(rol)).size).toBe(rutaDeRol(rol).length));
  });

  it('los enlaces de cada grupo llevan al curso actual', () => {
    gruposVisibles('docente', true, curso, new Set(['d1'])).filter((grupo) => grupo.titulo !== 'General').flatMap((grupo) => grupo.enlaces).forEach((enlace) => {
      expect(enlace.ruta.startsWith('#/c/c1/'), enlace.ruta).toBe(true);
    });
  });

  it('sin curso solo hay navegación general', () => {
    expect(gruposVisibles('estudiante', true, null)).toHaveLength(1);
  });

  it('las secciones sin desbloquear salen de los grupos y pasan a «Descubrir», en el orden de la ruta', () => {
    const grupos = gruposVisibles('estudiante', true, curso, new Set(['home', 'e5']));
    const { abiertas, porDescubrir } = separarBloqueadas(grupos, rutaDeRol('estudiante'));
    const abiertasCodigos = abiertas.flatMap((grupo) => grupo.enlaces).map((enlace) => codigoDeRuta(enlace.ruta.replace('#/c/c1/', '#/')));
    expect(abiertasCodigos).toEqual(expect.arrayContaining(['home', 'e5']));
    expect(abiertasCodigos).not.toContain('e15');
    const porDescubrirCodigos = porDescubrir.map((enlace) => codigoDeRuta(enlace.ruta.replace('#/c/c1/', '#/')));
    const ruta = rutaDeRol('estudiante');
    expect(porDescubrirCodigos).toEqual([...porDescubrirCodigos].sort((a, b) => ruta.indexOf(a) - ruta.indexOf(b)));
  });

  it('sin «desbloqueadas» (mostrar todo) nada queda bloqueado', () => {
    const { porDescubrir } = separarBloqueadas(gruposVisibles('docente', true, curso, null), rutaDeRol('docente'));
    expect(porDescubrir).toHaveLength(0);
  });

  it('la navegación de demo sigue completa', () => {
    ROLES.forEach((rol) => expect(NAVEGACION[rol].length).toBeGreaterThan(0));
  });
});
