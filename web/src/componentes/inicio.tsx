import { useState } from 'react';
import { BotonSalir } from './BotonSalir';
import { CabeceraMundo } from './CabeceraMundo';
import { Jaguar, type PoseJaguar } from './Jaguar';
import { useCurso } from './curso';
import { Tarjeta } from './panel';
import { useSesion } from './sesion';
import { Pantalla } from './ui';

const USUARIO_VALIDO = /^[a-z0-9_]{3,20}$/;

const PASOS: { pose: PoseJaguar; titulo: string; texto: string }[] = [
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

function Tutorial() {
  const [paso, setPaso] = useState(0);
  const actual = PASOS[paso];
  return (
    <Tarjeta kicker={`Paso ${paso + 1} de ${PASOS.length}`} titulo="Cómo funciona">
      <div className="inicio__tuto">
        <Jaguar pose={actual.pose} ancho={96} clase="inicio__guia" />
        <div>
          <strong>{actual.titulo}</strong>
          <p>{actual.texto}</p>
        </div>
      </div>
      <div className="inicio__pasos" aria-hidden="true">
        {PASOS.map((_, indice) => <i key={indice} className={indice === paso ? 'actual' : ''} />)}
      </div>
      <div className="d13__fila">
        <button className="acceso__boton" disabled={paso === 0} onClick={() => setPaso(paso - 1)}>Atrás</button>
        <button className="acceso__boton acceso__boton--principal" disabled={paso === PASOS.length - 1} onClick={() => setPaso(paso + 1)}>Siguiente</button>
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
          <Tutorial />
          <MiPerfil />
          <BotonSalir clase="inicio__salir">Cerrar sesión</BotonSalir>
        </div>
      </div>
    </Pantalla>
  );
}
