import { useCallback, useEffect, useMemo, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import type { Rol } from '../componentes/navegacion';
import { useCurso } from '../componentes/curso';
import { Tarjeta } from '../componentes/panel';
import { useSesion } from '../componentes/sesion';
import { Pantalla } from '../componentes/ui';
import { CORREO_VALIDO, correosDeTexto, servicioSupabase, type DatosPersonas, type PersonaCurso, type ServicioPersonas } from '../servicios/personas';
import { leerCsv, PLANTILLA_CSV, type ResultadoCsv } from '../servicios/csv';
import { crearServicioDemo } from '../servicios/personasDemo';

const ROLES: { valor: Rol; etiqueta: string }[] = [
  { valor: 'estudiante', etiqueta: 'Estudiante' },
  { valor: 'observador', etiqueta: 'Observador' },
  { valor: 'docente', etiqueta: 'Docente' },
];

const iniciales = (persona: PersonaCurso) => (persona.nombre ?? persona.correo).trim().slice(0, 2).toUpperCase();

export function D13Personas() {
  const { modoDemo, persona: yo } = useSesion();
  const { curso, crear: crearCurso, cargando: cargandoCursos } = useCurso();
  const servicio = useMemo<ServicioPersonas>(() => (modoDemo ? crearServicioDemo() : servicioSupabase), [modoDemo]);
  const [datos, setDatos] = useState<DatosPersonas | null>(null);
  const [fallo, setFallo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [nombreCurso, setNombreCurso] = useState('');
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [texto, setTexto] = useState('');
  const [rolInvitado, setRolInvitado] = useState<Rol>('estudiante');
  const [grupoInvitado, setGrupoInvitado] = useState('');
  const [importacion, setImportacion] = useState<ResultadoCsv | null>(null);
  const [importando, setImportando] = useState(false);

  const recargar = useCallback(async () => {
    if (!curso) { setDatos(null); return; }
    try {
      setDatos(await servicio.cargar(curso.id));
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [servicio, curso]);

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

  const grupos = datos?.grupos ?? [];
  const nombreDeGrupo = (grupoId: string | null) => grupos.find((grupo) => grupo.id === grupoId)?.nombre ?? 'Sin grupo';
  const cuantos = (grupoId: string) => {
    const total = datos?.personas.filter((persona) => persona.grupoId === grupoId).length ?? 0;
    return `${total} ${total === 1 ? 'estudiante' : 'estudiantes'}`;
  };
  const correosNuevos = correosDeTexto(texto);
  const invalidos = correosNuevos.filter((correo) => !CORREO_VALIDO.test(correo));

  const elegirArchivo = async (archivo: File | undefined) => {
    if (!archivo) return;
    setAviso(null);
    setImportacion(leerCsv(await archivo.text()));
  };

  const importar = async () => {
    if (!curso || !importacion || importacion.filas.length === 0) return;
    setImportando(true);
    const existentes = new Set(grupos.map((grupo) => grupo.nombre.toLowerCase()));
    const nuevos = [...new Map(importacion.filas.filter((fila) => fila.grupo && !existentes.has(fila.grupo.toLowerCase())).map((fila) => [fila.grupo.toLowerCase(), fila.grupo])).values()];
    for (const nombre of nuevos) {
      const error = await servicio.crearGrupo(curso.id, nombre);
      if (error) { setAviso(error); setImportando(false); await recargar(); return; }
    }
    const actualizados = await servicio.cargar(curso.id);
    const idDe = new Map(actualizados.grupos.map((grupo) => [grupo.nombre.toLowerCase(), grupo.id]));
    const porDestino = new Map<string, { rol: Rol; grupoId: string | null; correos: string[] }>();
    importacion.filas.forEach((fila) => {
      const grupoId = fila.rol === 'estudiante' && fila.grupo ? idDe.get(fila.grupo.toLowerCase()) ?? null : null;
      const clave = `${fila.rol}|${grupoId ?? ''}`;
      const destino = porDestino.get(clave) ?? { rol: fila.rol, grupoId, correos: [] };
      destino.correos.push(fila.correo);
      porDestino.set(clave, destino);
    });
    for (const destino of porDestino.values()) {
      const error = await servicio.invitar(curso.id, destino.correos, destino.rol, destino.grupoId);
      if (error) { setAviso(error); break; }
    }
    setImportando(false);
    setImportacion(null);
    await recargar();
  };

  const invitar = async () => {
    if (!curso || correosNuevos.length === 0) return;
    if (invalidos.length > 0) { setAviso(`Revisa estos correos: ${invalidos.join(', ')}`); return; }
    if (await ejecutar(servicio.invitar(curso.id, correosNuevos, rolInvitado, grupoInvitado || null))) setTexto('');
  };

  return (
    <Pantalla rol="docente" clase="p-d13">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker={curso ? curso.nombre : 'Curso'} titulo="Personas" subtitulo="Invita por correo, asigna roles y arma los grupos." objeto="carta" />
        <div className="contenido cuerpo-mundo panel">
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {!cargandoCursos && !curso && (
            <Tarjeta kicker="Primer paso" titulo="Crea tu primer curso">
              <form className="d13__formulario" onSubmit={(evento) => { evento.preventDefault(); if (nombreCurso.trim()) void crearCurso(nombreCurso.trim()).then((error) => { setAviso(error); if (!error) setNombreCurso(''); }); }}>
                <input className="d13__campo" placeholder="Ciencia de datos 2026-2" value={nombreCurso} onChange={(evento) => setNombreCurso(evento.target.value)} aria-label="Nombre del curso" />
                <button className="acceso__boton acceso__boton--principal" disabled={!nombreCurso.trim()}>Crear curso</button>
              </form>
            </Tarjeta>
          )}
          {curso && (
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
                <Tarjeta kicker="Lista completa" titulo="Cargar un CSV">
                  {importacion ? (
                    <>
                      <p className="d13__resumen"><b>{importacion.filas.length}</b> {importacion.filas.length === 1 ? 'persona lista' : 'personas listas'} para invitar{importacion.errores.length > 0 && <> · <b>{importacion.errores.length}</b> con problemas</>}.</p>
                      {importacion.errores.length > 0 && <ul className="d13__errores">{importacion.errores.slice(0, 5).map((error) => <li key={error}>{error}</li>)}{importacion.errores.length > 5 && <li>…y {importacion.errores.length - 5} más.</li>}</ul>}
                      <div className="d13__fila">
                        <button className="acceso__boton acceso__boton--principal" disabled={importacion.filas.length === 0 || importando} onClick={() => void importar()}>{importando ? 'Importando…' : `Importar ${importacion.filas.length}`}</button>
                        <button className="acceso__boton" disabled={importando} onClick={() => setImportacion(null)}>Cancelar</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="acceso__boton d13__archivo">Elegir archivo .csv<input type="file" accept=".csv,text/csv,.txt" hidden onChange={(evento) => { void elegirArchivo(evento.target.files?.[0]); evento.target.value = ''; }} /></label>
                      <small className="d13__nota">Columnas: <b>correo</b>, <b>grupo</b> y <b>rol</b> (opcional). Los grupos que no existan se crean. <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(PLANTILLA_CSV)}`} download="plantilla-personas.csv">Descargar plantilla</a></small>
                    </>
                  )}
                </Tarjeta>
                <Tarjeta kicker={`${grupos.length} en el curso`} titulo="Grupos">
                  <ul className="d13__grupos">
                    {grupos.map((grupo) => <li key={grupo.id}><strong>{grupo.nombre}</strong><small>{cuantos(grupo.id)}</small></li>)}
                    {grupos.length === 0 && <li><small>Aún no hay grupos.</small></li>}
                  </ul>
                  <form className="d13__fila" onSubmit={(evento) => { evento.preventDefault(); const nombre = nombreGrupo.trim(); if (nombre && curso) void ejecutar(servicio.crearGrupo(curso.id, nombre)).then((hecho) => { if (hecho) setNombreGrupo(''); }); }}>
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
                          <select className="d13__campo" value={persona.grupoId ?? ''} onChange={(evento) => void ejecutar(servicio.moverDeGrupo(curso.id, persona, evento.target.value || null))} aria-label={`Grupo de ${persona.nombre ?? persona.correo}`}>
                            <option value="">Sin grupo</option>
                            {grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>)}
                          </select>
                        ) : <span className="d13__sin" />}
                        {persona.rol !== 'docente' && <button className="d13__quitar" onClick={() => { if (window.confirm(`¿Quitar a ${persona.nombre ?? persona.correo} del curso? Su cuenta y sus entregas no se borran.`)) void ejecutar(servicio.sacarDelCurso(curso.id, persona)); }}>Quitar del curso</button>}
                      </li>
                    );
                  })}
                  {datos?.invitaciones.map((invitacion) => (
                    <li key={invitacion.correo} className="d13__pendiente">
                      <span className="avatar avatar--claro">?</span>
                      <span className="d13__datos"><strong>{invitacion.correo}</strong><small>Invitada · {ROLES.find((rol) => rol.valor === invitacion.rol)?.etiqueta} · {invitacion.rol === 'estudiante' ? nombreDeGrupo(invitacion.grupoId) : 'sin grupo'}</small></span>
                      <button className="d13__quitar" onClick={() => void ejecutar(servicio.quitarInvitacion(curso.id, invitacion.correo))}>Quitar</button>
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
