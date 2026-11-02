import { useEffect, useState } from 'react';
import { BotonSalir } from './BotonSalir';
import { CabeceraMundo } from './CabeceraMundo';
import { Dock } from './Dock';
import { Jaguar, type PoseJaguar } from './Jaguar';
import { useCurso } from './curso';
import { enCurso } from './navegacion';
import { Tarjeta } from './panel';
import { useSesion } from './sesion';
import { Pantalla } from './ui';
import { useServicioTrabajos } from '../servicios/trabajos';

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
    <Pantalla clase="p-inicio">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Tu expedición empieza aquí" titulo={`Hola, ${persona?.nombre?.split(' ')[0] ?? persona?.usuario ?? ''}`} subtitulo="Aún no estás en ningún curso." objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          <Tarjeta kicker="Tu estado" titulo="Esperando invitación">
            <p className="meta">Tu docente debe invitarte a un curso con el correo <b>{persona?.correo}</b>. Cuando lo haga, aparecerá aquí.</p>
            <button className="acceso__boton acceso__boton--principal" disabled={revisando || cargando} onClick={() => void revisar()}>{revisando ? 'Revisando…' : 'Ya me invitaron, actualizar'}</button>
          </Tarjeta>
          <Tutorial pasos={PASOS_ESTUDIANTE} />
          <MiPerfil />
          <BotonSalir clase="inicio__salir">Cerrar sesión</BotonSalir>
        </div>
      </div>
    </Pantalla>
  );
}

function PrimerosPasos() {
  const { cursos, reciente: curso, conteos } = useCurso();
  const servicio = useServicioTrabajos();
  const [trabajos, setTrabajos] = useState<number | null>(null);

  useEffect(() => {
    if (!curso) { setTrabajos(0); return; }
    void servicio.cargarTrabajos(curso.id).then((lista) => setTrabajos(lista.length)).catch(() => setTrabajos(null));
  }, [servicio, curso]);

  const conteo = curso ? conteos[curso.id] : undefined;
  const pasos = [
    { hecho: cursos.length > 0, texto: 'Crear tu primer curso', ruta: '#/cursos' },
    { hecho: (conteo?.grupos ?? 0) > 0, texto: 'Crear los grupos del curso', ruta: '#/d13' },
    { hecho: (conteo?.estudiantes ?? 0) > 0, texto: 'Invitar a tus estudiantes', ruta: '#/d13' },
    { hecho: (trabajos ?? 0) > 0, texto: 'Publicar el primer trabajo', ruta: '#/d14' },
  ];
  const completos = pasos.filter((paso) => paso.hecho).length;

  return (
    <Tarjeta kicker={`${completos} de ${pasos.length} listos`} titulo="Primeros pasos">
      <ul className="inicio__lista">
        {pasos.map((paso) => (
          <li key={paso.texto} className={paso.hecho ? 'hecho' : ''}>
            <span className="inicio__marca" aria-hidden="true">{paso.hecho ? '✓' : ''}</span>
            <a href={curso ? enCurso(paso.ruta, curso.id) : paso.ruta}>{paso.texto}</a>
          </li>
        ))}
      </ul>
      {completos === pasos.length && <p className="meta">Todo listo. Desde Entregas puedes seguir lo que llega.</p>}
    </Tarjeta>
  );
}

export function InicioDocente() {
  const { persona } = useSesion();
  return (
    <Pantalla rol="docente" clase="p-inicio">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Panel del docente" titulo={`Hola, ${persona?.nombre?.split(' ')[0] ?? persona?.usuario ?? ''}`} subtitulo="Esto es lo que necesitas para arrancar el curso." objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          <PrimerosPasos />
          <Tutorial pasos={PASOS_DOCENTE} />
          <MiPerfil />
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
