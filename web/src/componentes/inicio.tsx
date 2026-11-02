import { useEffect, useMemo, useState } from 'react';
import { BotonSalir } from './BotonSalir';
import { CabeceraMundo } from './CabeceraMundo';
import { Dock } from './Dock';
import { Jaguar, type PoseJaguar } from './Jaguar';
import { useCurso } from './curso';
import { enCurso } from './navegacion';
import { Tarjeta } from './panel';
import { useSesion } from './sesion';
import { Pantalla } from './ui';
import { servicioSupabase as personasReal, type DatosPersonas } from '../servicios/personas';
import { crearServicioDemo as personasDemo } from '../servicios/personasDemo';
import { formatoFecha, trabajoPorEntregar, useServicioTrabajos, type EntregaPropia, type EntregaVista, type TrabajoCurso } from '../servicios/trabajos';

const USUARIO_VALIDO = /^[a-z0-9_]{3,20}$/;

interface PasoTutorial { pose: PoseJaguar; titulo: string; texto: string }

const PASOS_ESTUDIANTE: PasoTutorial[] = [
  {
    pose: 'saluda',
    titulo: 'Bienvenida a Data Expedition',
    texto: 'Es la app de tu curso de ciencia de datos. Aquí verás tus trabajos, harás tus entregas y seguirás tu avance semana a semana, como una expedición por islas.',
  },
  {
    pose: 'guia',
    titulo: 'Así funciona un curso',
    texto: 'Tu docente te invita con tu correo y el curso aparece en la pestaña Cursos. Cada curso trae sus trabajos, y entregas pegando el enlace de tu Pull Request de GitHub.',
  },
  {
    pose: 'pensando',
    titulo: 'Mientras esperas',
    texto: 'Revisa que tu nombre y tu usuario estén bien (puedes cambiarlos aquí abajo). Si tu docente ya te invitó, pulsa «Ya me invitaron, actualizar».',
  },
];

const PASOS_DOCENTE: PasoTutorial[] = [
  {
    pose: 'saluda',
    titulo: 'Cada curso es una cohorte',
    texto: 'Un curso reúne a sus personas, sus grupos y sus trabajos. Puedes tener varios y cambiar de uno a otro desde el selector o desde la pestaña Cursos.',
  },
  {
    pose: 'guia',
    titulo: 'Invita y organiza',
    texto: 'En Personas invitas por correo o con un CSV y armas los grupos. Quien se registre con ese correo queda matriculado en el curso y en su grupo.',
  },
  {
    pose: 'pensando',
    titulo: 'Publica trabajos y revisa entregas',
    texto: 'En Trabajos creas lo que se entrega y su fecha. Los estudiantes entregan con el enlace de su PR, y tú lo ves en Entregas.',
  },
];

function Tutorial({ pasos }: { pasos: PasoTutorial[] }) {
  const [paso, setPaso] = useState(0);
  return (
    <Tarjeta kicker={`Paso ${paso + 1} de ${pasos.length}`} titulo="Cómo funciona">
      <div className="inicio__tuto">
        {pasos.map((candidato, indice) => (
          <div key={candidato.titulo} className={`inicio__paso ${indice === paso ? 'activo' : ''}`} aria-hidden={indice !== paso}>
            <Jaguar pose={candidato.pose} ancho={96} clase="inicio__guia" />
            <div>
              <strong>{candidato.titulo}</strong>
              <p>{candidato.texto}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="inicio__pasos" aria-hidden="true">
        {pasos.map((_, indice) => <i key={indice} className={indice === paso ? 'actual' : ''} />)}
      </div>
      <div className="d13__fila">
        <button className="acceso__boton" disabled={paso === 0} onClick={() => setPaso(paso - 1)}>Atrás</button>
        <button className="acceso__boton acceso__boton--principal" disabled={paso === pasos.length - 1} onClick={() => setPaso(paso + 1)}>Siguiente</button>
      </div>
    </Tarjeta>
  );
}

function MiPerfil() {
  const { persona, guardarPerfil } = useSesion();
  const [nombre, setNombre] = useState(persona?.nombre ?? '');
  const [usuario, setUsuario] = useState(persona?.usuario ?? '');
  const [mensaje, setMensaje] = useState<{ error: boolean; texto: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (nombre.trim().length < 2) { setMensaje({ error: true, texto: 'Escribe tu nombre.' }); return; }
    if (!USUARIO_VALIDO.test(usuario.trim().toLowerCase())) { setMensaje({ error: true, texto: 'El usuario lleva de 3 a 20 letras minúsculas, números o guion bajo.' }); return; }
    setGuardando(true);
    const resultado = await guardarPerfil(nombre, usuario);
    setGuardando(false);
    setMensaje(resultado.ok ? { error: false, texto: 'Listo, guardamos tus datos.' } : { error: true, texto: resultado.mensaje });
  };

  return (
    <Tarjeta kicker="Tus datos" titulo="Tu perfil">
      <form className="d14__formulario" onSubmit={(evento) => void guardar(evento)}>
        <label className="d14__etiqueta">Nombre<input className="d13__campo" value={nombre} onChange={(evento) => { setNombre(evento.target.value); setMensaje(null); }} autoComplete="name" /></label>
        <label className="d14__etiqueta">Usuario<input className="d13__campo" value={usuario} onChange={(evento) => { setUsuario(evento.target.value); setMensaje(null); }} autoCapitalize="none" autoComplete="username" /></label>
        {mensaje && <p className={mensaje.error ? 'acceso__error' : 'inicio__ok'} role={mensaje.error ? 'alert' : 'status'}>{mensaje.texto}</p>}
        <button className="acceso__boton acceso__boton--principal" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
      </form>
    </Tarjeta>
  );
}

const LO_QUE_TE_ESPERA = [
  { titulo: 'Tus trabajos y entregas', texto: 'Pega el enlace de tu PR y mira en qué estado va cada trabajo.' },
  { titulo: 'Notas y retroalimentación', texto: 'La nota de cada trabajo con los comentarios de tu docente.' },
  { titulo: 'Practicar', texto: 'Preguntas de repaso con racha y XP, sin límite.' },
  { titulo: 'Tu radar de habilidades', texto: 'Cómo avanzas frente a tu punto de partida.' },
  { titulo: 'Gemas y álbum de la expedición', texto: 'Cada isla que cierras desbloquea una gema.' },
];

export function InicioSinCurso() {
  const { persona } = useSesion();
  const { recargar, cargando } = useCurso();
  const [revisando, setRevisando] = useState(false);

  const revisar = async () => {
    setRevisando(true);
    await recargar();
    setRevisando(false);
  };

  return (
    <Pantalla clase="p-inicio p-inicio--sin-curso">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Tu expedición empieza aquí" titulo={`Hola, ${persona?.nombre?.split(' ')[0] ?? persona?.usuario ?? ''}`} subtitulo="Aún no estás en ningún curso." objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          <Tarjeta kicker="Tu estado" titulo="Esperando invitación">
            <p className="meta">Tu docente debe invitarte a un curso con el correo <b>{persona?.correo}</b>. Cuando lo haga, aparecerá aquí.</p>
            <button className="acceso__boton acceso__boton--principal" disabled={revisando || cargando} onClick={() => void revisar()}>{revisando ? 'Revisando…' : 'Ya me invitaron, actualizar'}</button>
          </Tarjeta>
          <Tarjeta kicker="Lo que te espera" titulo="Cuando entres a un curso">
            <ul className="inicio__atencion">
              {LO_QUE_TE_ESPERA.map((item) => (
                <li key={item.titulo} className="pronto"><span>{item.titulo}<small>{item.texto}</small></span><em>Con tu primer curso</em></li>
              ))}
            </ul>
          </Tarjeta>
          <Tutorial pasos={PASOS_ESTUDIANTE} />
          <MiPerfil />
          <BotonSalir clase="inicio__salir">Cerrar sesión</BotonSalir>
        </div>
      </div>
    </Pantalla>
  );
}

function PrimerosPasos({ pasos }: { pasos: { hecho: boolean; texto: string; ruta: string }[] }) {
  const completos = pasos.filter((paso) => paso.hecho).length;
  return (
    <Tarjeta kicker={`${completos} de ${pasos.length} listos`} titulo="Primeros pasos">
      <ul className="inicio__lista">
        {pasos.map((paso) => (
          <li key={paso.texto} className={paso.hecho ? 'hecho' : ''}>
            <span className="inicio__marca" aria-hidden="true">{paso.hecho ? '✓' : ''}</span>
            <a href={paso.ruta}>{paso.texto}</a>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

const PROXIMAMENTE = ['Calificar con rúbrica', 'Relámpagos y votaciones en clase', 'Radar de habilidades del grupo'];

const diasHasta = (iso: string | null) => {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
};

export function InicioDocente() {
  const { persona, modoDemo } = useSesion();
  const { cursos, reciente: curso, conteos, cargando } = useCurso();
  const trabajosServicio = useServicioTrabajos();
  const personas = useMemo(() => (modoDemo ? personasDemo() : personasReal), [modoDemo]);
  const [trabajos, setTrabajos] = useState<TrabajoCurso[] | null>(null);
  const [entregas, setEntregas] = useState<EntregaVista[]>([]);
  const [datos, setDatos] = useState<DatosPersonas | null>(null);

  useEffect(() => {
    if (!curso) { setTrabajos(null); setEntregas([]); setDatos(null); return; }
    void trabajosServicio.cargarTrabajos(curso.id).then(setTrabajos).catch(() => setTrabajos(null));
    void trabajosServicio.entregasDelCurso(curso.id).then(setEntregas).catch(() => setEntregas([]));
    void personas.cargar(curso.id).then(setDatos).catch(() => setDatos(null));
  }, [curso, trabajosServicio, personas]);

  const conteo = curso ? conteos[curso.id] : undefined;
  const estudiantes = datos?.personas.filter((candidata) => candidata.rol === 'estudiante') ?? [];
  const porRevisar = entregas.filter((entrega) => entrega.estado === 'entregada').length;
  const porRegistrarse = datos?.invitaciones.length ?? 0;
  const proximos = (trabajos ?? []).filter((trabajo) => trabajo.venceEn && new Date(trabajo.venceEn).getTime() >= Date.now() - 86400000).slice(0, 4);
  const entregaron = (trabajoId: string) => new Set(entregas.filter((entrega) => entrega.trabajoId === trabajoId).map((entrega) => entrega.usuario ?? entrega.estudiante)).size;
  const ir = (ruta: string) => (curso ? enCurso(ruta, curso.id) : ruta);

  const pasos = [
    { hecho: cursos.length > 0, texto: 'Crear tu primer curso', ruta: '#/cursos' },
    { hecho: (conteo?.estudiantes ?? 0) > 0, texto: 'Invitar a tus estudiantes', ruta: ir('#/d13') },
    { hecho: (trabajos?.length ?? 0) > 0, texto: 'Publicar el primer trabajo', ruta: ir('#/d14') },
  ];
  const faltaArmar = pasos.some((paso) => !paso.hecho);

  const atencion = [
    { cantidad: porRevisar, texto: 'entregas por revisar', ruta: ir('#/d3') },
    { cantidad: porRegistrarse, texto: 'invitaciones sin registrarse', ruta: ir('#/d13') },
  ].filter((item) => item.cantidad > 0);

  return (
    <Pantalla rol="docente" clase="p-inicio p-inicio--tablero">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Tu panel" titulo={`Hola, ${persona?.nombre?.split(' ')[0] ?? persona?.usuario ?? ''}`} subtitulo={curso ? `Así va ${curso.nombre}.` : 'Crea un curso para empezar.'} objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          {faltaArmar && !cargando && <PrimerosPasos pasos={pasos} />}
          <Tarjeta kicker="Hoy" titulo="Requiere tu atención">
            <ul className="inicio__atencion">
              {atencion.map((item) => (
                <li key={item.texto}><a href={item.ruta}><b>{item.cantidad}</b><span>{item.texto}</span><i aria-hidden="true">›</i></a></li>
              ))}
              {atencion.length === 0 && <li className="vacio"><span>{curso ? 'Nada pendiente por ahora.' : 'Aún no hay un curso.'}</span></li>}
              <li className="pronto"><span>Estudiantes en riesgo</span><em>Próximamente</em></li>
            </ul>
          </Tarjeta>
          <Tarjeta kicker="Lo que viene" titulo="Próximos vencimientos" accion={curso ? <a className="cursos__secundaria" href={ir('#/d14')}>Trabajos</a> : undefined}>
            <ul className="inicio__atencion">
              {proximos.map((trabajo) => {
                const dias = diasHasta(trabajo.venceEn);
                return (
                  <li key={trabajo.id}>
                    <a href={ir('#/d3')}>
                      <b>{formatoFecha(trabajo.venceEn).numero}</b>
                      <span>{trabajo.nombre}<small>{dias !== null && dias >= 0 ? (dias === 0 ? 'vence hoy' : `en ${dias} ${dias === 1 ? 'día' : 'días'}`) : 'ya venció'} · {entregaron(trabajo.id)} de {estudiantes.length} entregaron</small></span>
                      <i aria-hidden="true">›</i>
                    </a>
                  </li>
                );
              })}
              {proximos.length === 0 && <li className="vacio"><span>{curso ? 'No hay trabajos próximos.' : 'Cuando tengas un curso, verás aquí lo que vence.'}</span></li>}
            </ul>
          </Tarjeta>
          <Tarjeta kicker="Tus cursos" titulo="Cursos" accion={<a className="cursos__secundaria" href="#/cursos">Ver todos</a>}>
            <ul className="inicio__atencion">
              {cursos.map((candidato) => (
                <li key={candidato.id}>
                  <a href={enCurso('#/curso', candidato.id)}>
                    <b>{conteos[candidato.id]?.estudiantes ?? 0}</b>
                    <span>{candidato.nombre}<small>{candidato.periodo ? `Periodo ${candidato.periodo} · ` : ''}{(conteos[candidato.id]?.estudiantes ?? 0) === 1 ? 'estudiante' : 'estudiantes'}</small></span>
                    <i aria-hidden="true">›</i>
                  </a>
                </li>
              ))}
              {cursos.length === 0 && <li className="vacio"><span>Aún no tienes cursos.</span></li>}
            </ul>
          </Tarjeta>
          <Tarjeta kicker="En camino" titulo="Próximamente">
            <ul className="inicio__atencion">
              {PROXIMAMENTE.map((texto) => <li key={texto} className="pronto"><span>{texto}</span><em>Próximamente</em></li>)}
            </ul>
          </Tarjeta>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}

export function AyudaDocente() {
  const { persona } = useSesion();
  return (
    <Pantalla rol={persona?.rol ?? 'docente'} clase="p-inicio p-inicio--tablero">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Ayuda" titulo="Cómo funciona" subtitulo="Un recorrido corto y tus datos de perfil." objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          <Tutorial pasos={PASOS_DOCENTE} />
          <MiPerfil />
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}

const AVANCE_ESTUDIANTE = [
  { titulo: 'Notas y retroalimentación', texto: 'La nota de cada trabajo con los comentarios de tu docente.' },
  { titulo: 'Racha y XP de práctica', texto: 'Preguntas de repaso para sumar todos los días.' },
  { titulo: 'Tu radar de habilidades', texto: 'Cómo avanzas frente a tu punto de partida.' },
  { titulo: 'Gemas y álbum', texto: 'Cada isla que cierras desbloquea una gema.' },
];

const ESTADO_ENTREGA = { entregada: 'En revisión', calificada: 'Calificada', borrador: 'Borrador', no_presento: 'No presentada' } as const;

const vencimiento = (iso: string | null) => {
  if (!iso) return 'sin fecha';
  const dias = diasHasta(iso);
  if (dias === null) return 'sin fecha';
  if (dias < 0) return 'ya venció';
  if (dias === 0) return 'vence hoy';
  return `vence en ${dias} ${dias === 1 ? 'día' : 'días'}`;
};

export function InicioEstudiante() {
  const { persona } = useSesion();
  const { cursos, reciente: curso } = useCurso();
  const servicio = useServicioTrabajos();
  const [trabajos, setTrabajos] = useState<TrabajoCurso[] | null>(null);
  const [entregas, setEntregas] = useState<EntregaPropia[]>([]);

  useEffect(() => {
    if (!curso) { setTrabajos(null); setEntregas([]); return; }
    void Promise.all([servicio.cargarTrabajos(curso.id), servicio.misEntregas(curso.id)])
      .then(([lista, propias]) => { setTrabajos(lista); setEntregas(propias); })
      .catch(() => { setTrabajos(null); setEntregas([]); });
  }, [curso, servicio]);

  const siguiente = trabajos ? trabajoPorEntregar(trabajos, entregas) : null;
  const hechas = entregas.filter((entrega) => entrega.estado !== 'borrador' && trabajos?.some((trabajo) => trabajo.id === entrega.trabajoId));
  const ir = (ruta: string) => (curso ? enCurso(ruta, curso.id) : ruta);
  const nombreDe = (id: string) => trabajos?.find((trabajo) => trabajo.id === id)?.nombre ?? 'Trabajo';

  return (
    <Pantalla clase="p-inicio p-inicio--tablero">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Tu expedición" titulo={`Hola, ${persona?.nombre?.split(' ')[0] ?? persona?.usuario ?? ''}`} subtitulo={curso ? `Esto es lo que sigue en ${curso.nombre}.` : 'Elige un curso para empezar.'} objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          <Tarjeta kicker="Lo siguiente" titulo="Qué entregar">
            {siguiente ? (
              <ul className="inicio__atencion">
                <li>
                  <a href={ir('#/e6')}>
                    <b>{formatoFecha(siguiente.venceEn).numero || '·'}</b>
                    <span>{siguiente.nombre}<small>{siguiente.tema ? `${siguiente.tema} · ` : ''}{vencimiento(siguiente.venceEn)}</small></span>
                    <i aria-hidden="true">›</i>
                  </a>
                </li>
              </ul>
            ) : (
              <ul className="inicio__atencion">
                <li className="vacio"><span>{!curso ? 'Aún no hay un curso.' : trabajos && trabajos.length > 0 ? 'Estás al día: entregaste todo lo publicado.' : 'Tu docente aún no publica trabajos.'}</span></li>
              </ul>
            )}
          </Tarjeta>
          <Tarjeta kicker={`${hechas.length} de ${trabajos?.length ?? 0} entregados`} titulo="Tus entregas" accion={curso ? <a className="cursos__secundaria" href={ir('#/e5')}>Ver todas</a> : undefined}>
            <ul className="inicio__atencion">
              {hechas.slice(0, 4).map((entrega) => (
                <li key={entrega.trabajoId}>
                  <a href={ir('#/e5')}>
                    <b>{entrega.nota !== null ? entrega.nota.toFixed(1) : '·'}</b>
                    <span>{nombreDe(entrega.trabajoId)}<small>{ESTADO_ENTREGA[entrega.estado]} · {entrega.modoIa === 'con_ia' ? 'Con IA' : 'Sin IA'}</small></span>
                    <i aria-hidden="true">›</i>
                  </a>
                </li>
              ))}
              {hechas.length === 0 && <li className="vacio"><span>Cuando entregues un trabajo, aparecerá aquí.</span></li>}
            </ul>
          </Tarjeta>
          <Tarjeta kicker="Tus cursos" titulo="Cursos" accion={<a className="cursos__secundaria" href="#/cursos">Ver todos</a>}>
            <ul className="inicio__atencion">
              {cursos.map((candidato) => (
                <li key={candidato.id}>
                  <a href={enCurso('#/curso', candidato.id)}>
                    <span>{candidato.nombre}{candidato.periodo && <small>Periodo {candidato.periodo}</small>}</span>
                    <i aria-hidden="true">›</i>
                  </a>
                </li>
              ))}
              {cursos.length === 0 && <li className="vacio"><span>Aún no estás en ningún curso.</span></li>}
            </ul>
          </Tarjeta>
          <Tarjeta kicker="En camino" titulo="Tu avance">
            <ul className="inicio__atencion">
              {AVANCE_ESTUDIANTE.map((item) => (
                <li key={item.titulo} className="pronto"><span>{item.titulo}<small>{item.texto}</small></span><em>Próximamente</em></li>
              ))}
            </ul>
          </Tarjeta>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}

export function InicioPorRol() {
  const { persona } = useSesion();
  const esObservador = persona?.rol === 'observador';

  useEffect(() => {
    if (esObservador) window.location.hash = '#/cursos';
  }, [esObservador]);

  if (esObservador) return null;
  return persona?.rol === 'estudiante' ? <InicioEstudiante /> : <InicioDocente />;
}
