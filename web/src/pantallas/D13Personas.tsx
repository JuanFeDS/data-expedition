import { useCallback, useEffect, useMemo, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import type { Rol } from '../componentes/navegacion';
import { Tarjeta } from '../componentes/panel';
import { useSesion } from '../componentes/sesion';
import { Pantalla } from '../componentes/ui';
import { CORREO_VALIDO, correosDeTexto, servicioSupabase, type DatosPersonas, type PersonaCurso, type ServicioPersonas } from '../servicios/personas';
import { crearServicioDemo } from '../servicios/personasDemo';

const ROLES: { valor: Rol; etiqueta: string }[] = [
  { valor: 'estudiante', etiqueta: 'Estudiante' },
  { valor: 'observador', etiqueta: 'Observador' },
  { valor: 'docente', etiqueta: 'Docente' },
];

const iniciales = (persona: PersonaCurso) => (persona.nombre ?? persona.correo).trim().slice(0, 2).toUpperCase();

export function D13Personas() {
  const { modoDemo, persona: yo } = useSesion();
  const servicio = useMemo<ServicioPersonas>(() => (modoDemo ? crearServicioDemo() : servicioSupabase), [modoDemo]);
  const [datos, setDatos] = useState<DatosPersonas | null>(null);
  const [fallo, setFallo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState('');
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [texto, setTexto] = useState('');
  const [rolInvitado, setRolInvitado] = useState<Rol>('estudiante');
  const [grupoInvitado, setGrupoInvitado] = useState('');

  const recargar = useCallback(async () => {
    try {
      setDatos(await servicio.cargar());
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [servicio]);

  useEffect(() => { void recargar(); }, [recargar]);

  const ejecutar = async (accion: Promise<string | null>) => {
    const error = await accion;
    setAviso(error);
    await recargar();
    return error === null;
  };

  if (fallo) {
    return (
      <Pantalla rol="docente" clase="p-d13">
        <div className="pantalla__cuerpo">
          <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Curso" titulo="Personas" objeto="carta" />
          <div className="contenido cuerpo-mundo panel"><p className="acceso__error" role="alert">No pudimos cargar las personas. <button onClick={() => void recargar()}>Reintentar</button></p></div>
        </div>
        <Dock />
      </Pantalla>
    );
  }

  const edicion = datos?.edicion ?? null;
  const grupos = datos?.grupos ?? [];
  const nombreDeGrupo = (grupoId: string | null) => grupos.find((grupo) => grupo.id === grupoId)?.nombre ?? 'Sin grupo';
  const cuantos = (grupoId: string) => {
    const total = datos?.personas.filter((persona) => persona.grupoId === grupoId).length ?? 0;
    return `${total} ${total === 1 ? 'estudiante' : 'estudiantes'}`;
  };
  const correosNuevos = correosDeTexto(texto);
  const invalidos = correosNuevos.filter((correo) => !CORREO_VALIDO.test(correo));

  const invitar = async () => {
    if (!edicion || correosNuevos.length === 0) return;
    if (invalidos.length > 0) { setAviso(`Revisa estos correos: ${invalidos.join(', ')}`); return; }
    if (await ejecutar(servicio.invitar(edicion, correosNuevos, rolInvitado, grupoInvitado || null))) setTexto('');
  };

  return (
    <Pantalla rol="docente" clase="p-d13">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker={edicion ? edicion.nombre : 'Curso'} titulo="Personas" subtitulo="Invita por correo, asigna roles y arma los grupos." objeto="carta" />
        <div className="contenido cuerpo-mundo panel">
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {datos && !edicion && (
            <Tarjeta kicker="Primer paso" titulo="Crea la edición del curso">
              <form className="d13__formulario" onSubmit={(evento) => { evento.preventDefault(); if (nombreEdicion.trim()) void ejecutar(servicio.crearEdicion(nombreEdicion.trim())); }}>
                <input className="d13__campo" placeholder="Edición 2026-2" value={nombreEdicion} onChange={(evento) => setNombreEdicion(evento.target.value)} aria-label="Nombre de la edición" />
                <button className="acceso__boton acceso__boton--principal" disabled={!nombreEdicion.trim()}>Crear edición</button>
              </form>
            </Tarjeta>
          )}
          {edicion && (
            <div className="d13__columnas">
              <div className="d13__lado">
                <Tarjeta kicker="Nuevas personas" titulo="Invitar">
                  <textarea className="d13__campo d13__texto" rows={4} placeholder={'ana@gmail.com, luis@gmail.com\n(uno por línea o separados por coma)'} value={texto} onChange={(evento) => setTexto(evento.target.value)} aria-label="Correos a invitar" />
                  <div className="d13__fila">
                    <select className="d13__campo" value={rolInvitado} onChange={(evento) => setRolInvitado(evento.target.value as Rol)} aria-label="Rol">
                      {ROLES.map((rol) => <option key={rol.valor} value={rol.valor}>{rol.etiqueta}</option>)}
                    </select>
                    {rolInvitado === 'estudiante' && (
                      <select className="d13__campo" value={grupoInvitado} onChange={(evento) => setGrupoInvitado(evento.target.value)} aria-label="Grupo">
                        <option value="">Sin grupo</option>
                        {grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>)}
                      </select>
                    )}
                  </div>
                  <button className="acceso__boton acceso__boton--principal" disabled={correosNuevos.length === 0} onClick={() => void invitar()}>
                    {correosNuevos.length > 1 ? `Invitar a ${correosNuevos.length} personas` : 'Invitar'}
                  </button>
                  <small className="d13__nota">No se envía ningún correo: entran por su cuenta con Google o con enlace y quedan en su grupo. Avísales tú.</small>
                </Tarjeta>
                <Tarjeta kicker={`${grupos.length} en la edición`} titulo="Grupos">
                  <ul className="d13__grupos">
                    {grupos.map((grupo) => <li key={grupo.id}><strong>{grupo.nombre}</strong><small>{cuantos(grupo.id)}</small></li>)}
                    {grupos.length === 0 && <li><small>Aún no hay grupos.</small></li>}
                  </ul>
                  <form className="d13__fila" onSubmit={(evento) => { evento.preventDefault(); const nombre = nombreGrupo.trim(); if (nombre) void ejecutar(servicio.crearGrupo(edicion, nombre)).then((hecho) => { if (hecho) setNombreGrupo(''); }); }}>
                    <input className="d13__campo" placeholder="Nuevo grupo" value={nombreGrupo} onChange={(evento) => setNombreGrupo(evento.target.value)} aria-label="Nombre del grupo" />
                    <button className="acceso__boton" disabled={!nombreGrupo.trim()}>Crear</button>
                  </form>
                </Tarjeta>
              </div>
              <Tarjeta kicker={`${datos?.personas.length ?? 0} registradas · ${datos?.invitaciones.length ?? 0} por registrarse`} titulo="Personas del curso" clase="d13__lista">
                <ul className="d13__personas">
                  {datos?.personas.map((persona) => {
                    const esYo = persona.id === yo?.id;
                    return (
                      <li key={persona.id}>
                        <span className="avatar avatar--verde">{iniciales(persona)}</span>
                        <span className="d13__datos"><strong>{persona.nombre ?? 'Sin nombre'}{persona.usuario && <em> @{persona.usuario}</em>}</strong><small>{persona.correo}</small></span>
                        <select className="d13__campo" value={persona.rol} disabled={esYo} onChange={(evento) => void ejecutar(servicio.cambiarRol(persona, evento.target.value as Rol))} aria-label={`Rol de ${persona.nombre ?? persona.correo}`}>
                          {ROLES.map((rol) => <option key={rol.valor} value={rol.valor}>{rol.etiqueta}</option>)}
                        </select>
                        {persona.rol === 'estudiante' ? (
                          <select className="d13__campo" value={persona.grupoId ?? ''} onChange={(evento) => void ejecutar(servicio.moverDeGrupo(edicion, persona, evento.target.value || null))} aria-label={`Grupo de ${persona.nombre ?? persona.correo}`}>
                            <option value="">Sin grupo</option>
                            {grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>)}
                          </select>
                        ) : <span className="d13__sin" />}
                      </li>
                    );
                  })}
                  {datos?.invitaciones.map((invitacion) => (
                    <li key={invitacion.correo} className="d13__pendiente">
                      <span className="avatar avatar--claro">?</span>
                      <span className="d13__datos"><strong>{invitacion.correo}</strong><small>Invitada · {ROLES.find((rol) => rol.valor === invitacion.rol)?.etiqueta} · {invitacion.rol === 'estudiante' ? nombreDeGrupo(invitacion.grupoId) : 'sin grupo'}</small></span>
                      <button className="d13__quitar" onClick={() => void ejecutar(servicio.quitarInvitacion(invitacion.correo))}>Quitar</button>
                    </li>
                  ))}
                </ul>
              </Tarjeta>
            </div>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
