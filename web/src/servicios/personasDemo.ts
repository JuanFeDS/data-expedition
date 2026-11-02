import type { DatosPersonas, ServicioPersonas } from './personas';

const idNuevo = () => `demo-${Math.random().toString(36).slice(2, 8)}`;

export function crearServicioDemo(): ServicioPersonas {
  const datos: DatosPersonas = {
    edicion: { id: 'ed-demo', nombre: 'Edición 2026-2' },
    grupos: [{ id: 'g-a', nombre: 'Grupo A' }, { id: 'g-b', nombre: 'Grupo B' }],
    personas: [
      { id: 'p-1', correo: 'docente@ejemplo.edu', nombre: 'Juanfe Martínez', usuario: 'juanfeds', rol: 'docente', grupoId: null },
      { id: 'p-2', correo: 'ana.gomez@ejemplo.edu', nombre: 'Ana Gómez', usuario: 'ana_datos', rol: 'estudiante', grupoId: 'g-a' },
      { id: 'p-3', correo: 'luis.rojas@ejemplo.edu', nombre: 'Luis Rojas', usuario: 'luis_r', rol: 'estudiante', grupoId: 'g-b' },
      { id: 'p-4', correo: 'obs@ejemplo.edu', nombre: 'Marta Observa', usuario: 'marta_obs', rol: 'observador', grupoId: null },
    ],
    invitaciones: [{ correo: 'paula.vargas@ejemplo.edu', rol: 'estudiante', grupoId: 'g-a' }],
  };
  const copia = (): DatosPersonas => structuredClone(datos);

  return {
    cargar: async () => copia(),
    crearEdicion: async (nombre) => { datos.edicion = { id: idNuevo(), nombre }; return null; },
    crearGrupo: async (_edicion, nombre) => {
      if (datos.grupos.some((grupo) => grupo.nombre === nombre)) return 'Ya existe un grupo con ese nombre.';
      datos.grupos.push({ id: idNuevo(), nombre });
      return null;
    },
    invitar: async (_edicion, correos, rol, grupoId) => {
      correos.forEach((correo) => {
        datos.invitaciones = datos.invitaciones.filter((invitacion) => invitacion.correo !== correo);
        datos.invitaciones.push({ correo, rol, grupoId: rol === 'estudiante' ? grupoId : null });
      });
      return null;
    },
    quitarInvitacion: async (correo) => { datos.invitaciones = datos.invitaciones.filter((invitacion) => invitacion.correo !== correo); return null; },
    cambiarRol: async (persona, rol) => { const destino = datos.personas.find((candidata) => candidata.id === persona.id); if (destino) destino.rol = rol; return null; },
    moverDeGrupo: async (_edicion, persona, grupoId) => { const destino = datos.personas.find((candidata) => candidata.id === persona.id); if (destino) destino.grupoId = grupoId; return null; },
  };
}
