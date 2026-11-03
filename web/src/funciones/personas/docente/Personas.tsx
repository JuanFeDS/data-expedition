import { useCallback, useEffect, useMemo, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import type { Rol } from '../../../compartido/navegacion/navegacion';
import { useConfirmar } from '../../../compartido/estado/confirmar';
import { Selector } from '../../../compartido/ui/Selector';
import { useCurso } from '../../../compartido/estado/curso';
import { Tarjeta } from '../../../compartido/ui/panel';
import { useSesion } from '../../../compartido/estado/sesion';
import { Pantalla } from '../../../compartido/ui/ui';
import { CORREO_VALIDO, correosDeTexto, servicioSupabase, type DatosPersonas, type PersonaCurso, type ServicioPersonas } from '../../../servicios/personas';
import { leerCsv, PLANTILLA_CSV, type ResultadoCsv } from '../../../servicios/csv';
import { crearServicioDemo } from '../../../demo/personasDemo';

const ROLES: { valor: Rol; etiqueta: string }[] = [
  { valor: 'estudiante', etiqueta: 'Estudiante' },
  { valor: 'observador', etiqueta: 'Observador' },
  { valor: 'docente', etiqueta: 'Docente' },
];

const iniciales = (persona: PersonaCurso) => (persona.nombre ?? persona.correo).trim().slice(0, 2).toUpperCase();

export function D13Personas() {
  const { modoDemo, persona: yo } = useSesion();
  const { curso, crear: crearCurso, cargando: cargandoCursos } = useCurso();
  const confirmar = useConfirmar();
  const servicio = useMemo<ServicioPersonas>(() => (modoDemo ? crearServicioDemo() : servicioSupabase), [modoDemo]);
  const [datos, setDatos] = useState<DatosPersonas | null>(null);
  const [fallo, setFallo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [nombreCurso, setNombreCurso] = useState('');
  const [texto, setTexto] = useState('');
  const [rolInvitado, setRolInvitado] = useState<Rol>('estudiante');
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
    for (const rol of ROLES.map((opcion) => opcion.valor)) {
      const correos = importacion.filas.filter((fila) => fila.rol === rol).map((fila) => fila.correo);
      if (correos.length === 0) continue;
      const error = await servicio.invitar(curso.id, correos, rol, null);
      if (error) { setAviso(error); break; }
    }
    setImportando(false);
    setImportacion(null);
    await recargar();
  };

  const quitarDelCurso = async (persona: PersonaCurso) => {
    if (!curso) return;
    const aceptado = await confirmar({
      titulo: '¿Quitar del curso?',
      texto: `${persona.nombre ?? persona.correo} dejará de ver este curso. Su cuenta y sus entregas no se borran.`,
      confirmar: 'Quitar del curso',
    });
    if (aceptado) await ejecutar(servicio.sacarDelCurso(curso.id, persona));
  };

  const invitar = async () => {
    if (!curso || correosNuevos.length === 0) return;
    if (invalidos.length > 0) { setAviso(`Revisa estos correos: ${invalidos.join(', ')}`); return; }
    if (await ejecutar(servicio.invitar(curso.id, correosNuevos, rolInvitado, null))) setTexto('');
  };

  return (
    <Pantalla rol="docente" clase="p-d13">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker={curso ? curso.nombre : 'Curso'} titulo="Personas" subtitulo="Invita por correo y asigna roles." objeto="carta" />
        <div className="contenido cuerpo-mundo panel">
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {!cargandoCursos && !curso && (
            <Tarjeta kicker="Primer paso" titulo="Crea tu primer curso">
              <form className="d13__formulario" onSubmit={(evento) => { evento.preventDefault(); if (nombreCurso.trim()) void crearCurso({ nombre: nombreCurso.trim(), periodo: '' }).then((error) => { setAviso(error); if (!error) setNombreCurso(''); }); }}>
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
                    <Selector valor={rolInvitado} opciones={ROLES} alCambiar={setRolInvitado} etiqueta="Rol" clase="d13__selector" />
                  </div>
                  <button className="acceso__boton acceso__boton--principal" disabled={correosNuevos.length === 0} onClick={() => void invitar()}>
                    {correosNuevos.length > 1 ? `Invitar a ${correosNuevos.length} personas` : 'Invitar'}
                  </button>
                  <small className="d13__nota">No se envía ningún correo: entran por su cuenta con Google o con enlace y quedan en el curso. Avísales tú.</small>
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
                      <small className="d13__nota">Columnas: <b>correo</b> y <b>rol</b> (opcional). <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(PLANTILLA_CSV)}`} download="plantilla-personas.csv">Descargar plantilla</a></small>
                    </>
                  )}
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
                        <Selector valor={persona.rol} opciones={ROLES} deshabilitado={esYo} alCambiar={(rol) => void ejecutar(servicio.cambiarRol(persona, rol))} etiqueta={`Rol de ${persona.nombre ?? persona.correo}`} clase="d13__selector" />
                        {persona.rol !== 'docente' && <button className="d13__quitar" aria-label={`Quitar a ${persona.nombre ?? persona.correo} del curso`} onClick={() => void quitarDelCurso(persona)}>Quitar</button>}
                      </li>
                    );
                  })}
                  {datos?.invitaciones.map((invitacion) => (
                    <li key={invitacion.correo} className="d13__pendiente">
                      <span className="avatar avatar--claro">?</span>
                      <span className="d13__datos"><strong>{invitacion.correo}</strong><small>Invitada · {ROLES.find((rol) => rol.valor === invitacion.rol)?.etiqueta}</small></span>
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
