import type { DatosPersonas, ServicioPersonas } from './personas';

const idNuevo = () => `demo-${Math.random().toString(36).slice(2, 8)}`;

const datosIniciales = (): DatosPersonas => ({
  grupos: [{ id: 'g-a', nombre: 'Grupo A' }, { id: 'g-b', nombre: 'Grupo B' }],
  personas: [
    { id: 'p-1', correo: 'docente@ejemplo.edu', nombre: 'Juanfe Martínez', usuario: 'juanfeds', rol: 'docente', grupoId: null },
    { id: 'p-2', correo: 'ana.gomez@ejemplo.edu', nombre: 'Ana Gómez', usuario: 'ana_datos', rol: 'estudiante', grupoId: 'g-a' },
    { id: 'p-3', correo: 'luis.rojas@ejemplo.edu', nombre: 'Luis Rojas', usuario: 'luis_r', rol: 'estudiante', grupoId: 'g-b' },
    { id: 'p-4', correo: 'obs@ejemplo.edu', nombre: 'Marta Observa', usuario: 'marta_obs', rol: 'observador', grupoId: null },
  ],
  invitaciones: [{ correo: 'paula.vargas@ejemplo.edu', rol: 'estudiante', grupoId: 'g-a' }],
});

export function crearServicioDemo(): ServicioPersonas {
  const porCurso = new Map<string, DatosPersonas>();
  const de = (cursoId: string) => {
    if (!porCurso.has(cursoId)) porCurso.set(cursoId, datosIniciales());
    return porCurso.get(cursoId)!;
  };

  return {
    cargar: async (cursoId) => structuredClone(de(cursoId)),
    crearGrupo: async (cursoId, nombre) => {
      const datos = de(cursoId);
      if (datos.grupos.some((grupo) => grupo.nombre === nombre)) return 'Ya existe un grupo con ese nombre.';
      datos.grupos.push({ id: idNuevo(), nombre });
      return null;
    },
    invitar: async (cursoId, correos, rol, grupoId) => {
      const datos = de(cursoId);
      correos.forEach((correo) => {
        datos.invitaciones = datos.invitaciones.filter((invitacion) => invitacion.correo !== correo);
        datos.invitaciones.push({ correo, rol, grupoId: rol === 'estudiante' ? grupoId : null });
      });
      return null;
    },
    quitarInvitacion: async (cursoId, correo) => {
      const datos = de(cursoId);
      datos.invitaciones = datos.invitaciones.filter((invitacion) => invitacion.correo !== correo);
      return null;
    },
    cambiarRol: async (persona, rol) => {
      porCurso.forEach((datos) => { const destino = datos.personas.find((candidata) => candidata.id === persona.id); if (destino) destino.rol = rol; });
      return null;
    },
    moverDeGrupo: async (cursoId, persona, grupoId) => {
      const destino = de(cursoId).personas.find((candidata) => candidata.id === persona.id);
      if (destino) destino.grupoId = grupoId;
      return null;
    },
    sacarDelCurso: async (cursoId, persona) => {
      const datos = de(cursoId);
      datos.personas = datos.personas.filter((candidata) => candidata.id !== persona.id);
      return null;
    },
  };
}
