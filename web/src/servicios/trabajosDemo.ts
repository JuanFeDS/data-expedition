import { trabajos as trabajosDeEjemplo } from '../datos';
import type { EntregaPropia, EntregaVista, ServicioTrabajos, TrabajoCurso } from './trabajos';

const MESES: Record<string, number> = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };

const aFecha = (largo: string) => {
  const [, dia, mes] = /(\d+) (\w+)$/.exec(largo) ?? [];
  return new Date(2026, MESES[mes] ?? 0, Number(dia), 23, 59).toISOString();
};

export function crearServicioTrabajosDemo(): ServicioTrabajos {
  let trabajos: TrabajoCurso[] = trabajosDeEjemplo.map((trabajo) => ({ id: trabajo.codigo, nombre: trabajo.titulo, tema: trabajo.tema, semana: trabajo.semana, venceEn: aFecha(trabajo.vence.largo), minPylint: trabajo.minPylint }));
  const entregas: EntregaPropia[] = [
    { trabajoId: 'T1', estado: 'calificada', modoIa: 'con_ia', enlacePr: 'https://github.com/camilo-r/trabajo-1/pull/1', entregadaEn: new Date(2026, 10, 12, 20, 0).toISOString(), nota: 4.2 },
    { trabajoId: 'T2', estado: 'calificada', modoIa: 'sin_ia', enlacePr: 'https://github.com/camilo-r/trabajo-2/pull/1', entregadaEn: new Date(2026, 10, 20, 18, 0).toISOString(), nota: 3.8 },
  ];
  const vistas: EntregaVista[] = [];

  return {
    cargarTrabajos: async () => ({ edicionId: 'ed-demo', trabajos: [...trabajos] }),
    crearTrabajo: async (_edicion, datos) => { trabajos = [...trabajos, { id: `demo-${trabajos.length + 1}`, ...datos }]; return null; },
    eliminarTrabajo: async (id) => { trabajos = trabajos.filter((trabajo) => trabajo.id !== id); return null; },
    misEntregas: async () => [...entregas],
    entregar: async (entrega) => {
      const indice = entregas.findIndex((existente) => existente.trabajoId === entrega.trabajoId);
      const nueva: EntregaPropia = { trabajoId: entrega.trabajoId, estado: 'entregada', modoIa: entrega.modoIa, enlacePr: entrega.enlacePr, entregadaEn: new Date().toISOString(), nota: null };
      if (indice >= 0) entregas[indice] = nueva; else entregas.push(nueva);
      return null;
    },
    entregasDelCurso: async () => [...vistas],
  };
}
