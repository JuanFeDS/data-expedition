import { useState } from 'react';
import { Jaguar } from '../../../compartido/ui/Jaguar';
import { inicioDeRol, type Rol } from '../../../compartido/navegacion/navegacion';
import { Vacio } from '../../../compartido/ui/panel';
import { useSesion } from '../../../compartido/estado/sesion';
import { Kicker, Pantalla } from '../../../compartido/ui/ui';

export function Marca({ visual = false }: { visual?: boolean }) {
  const [sinLetras, setSinLetras] = useState(false);
  const [sinLogo, setSinLogo] = useState(false);
  const base = import.meta.env.BASE_URL;
  const Titulo = visual ? 'div' : 'h1';
  return (
    <div className={`marca ${visual ? 'marca--escena' : 'marca--cabecera'}`} aria-hidden={visual || undefined}>
      {!sinLogo && <img className="marca__logo" src={`${base}marca/logo.webp`} alt="" onError={() => setSinLogo(true)} />}
      {sinLetras ? (
        <Titulo className="titulo marca__texto">Data Expedition</Titulo>
      ) : (
        <>
          {!visual && <h1 className="marca__lectores">Data Expedition</h1>}
          <img className="marca__letras" src={`${base}marca/letras.webp`} alt="" onError={() => setSinLetras(true)} />
        </>
      )}
    </div>
  );
}

export const PASOS_DE_ACCESO = [
  { numero: '1', titulo: 'Entra', texto: 'Con tu correo, sin contraseña.' },
  { numero: '2', titulo: 'Explora', texto: 'Una isla nueva cada semana.' },
  { numero: '3', titulo: 'Gana gemas', texto: 'Cada reto pulido suma al radar.' },
];

export const INICIO_REAL: Record<Rol, string> = { estudiante: '#/home', docente: '#/d1', observador: '#/inicio' };

const USUARIO_VALIDO = /^[a-z0-9_]{3,20}$/;

export function CompletarPerfil() {
  const { persona, guardarPerfil, cerrarSesion } = useSesion();
  const [nombre, setNombre] = useState(persona?.nombre ?? '');
  const [usuario, setUsuario] = useState(persona?.usuario ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (nombre.trim().length < 2) {
      setError('Escribe tu nombre.');
      return;
    }
    if (!USUARIO_VALIDO.test(usuario.trim().toLowerCase())) {
      setError('El usuario lleva de 3 a 20 letras minúsculas, números o guion bajo.');
      return;
    }
    setError(null);
    setGuardando(true);
    const resultado = await guardarPerfil(nombre, usuario);
    setGuardando(false);
    if (!resultado.ok) setError(resultado.mensaje);
  };

  return (
    <Pantalla tono="oscura" clase="pantalla--acceso p-e0">
      <div className="pantalla__cuerpo acceso">
        <header className="acceso__titulo">
          <Kicker estilo={{ color: 'var(--accent)' }}>Tu primer ingreso</Kicker>
          <h1 className="titulo">Completa tu perfil</h1>
          <p>Así te verán tu docente y tu equipo. Lo puedes cambiar después.</p>
        </header>
        <div className="acceso__escena">
          <Jaguar pose="saluda" ancho={150} clase="acceso__guia" />
        </div>
        <div className="acceso__hoja">
          <label className="acceso__etiqueta" htmlFor="perfil-nombre">Nombre</label>
          <input id="perfil-nombre" className="acceso__campo" autoComplete="name" placeholder="Ana Gómez" value={nombre} disabled={guardando} onChange={(evento) => { setNombre(evento.target.value); setError(null); }} />
          <label className="acceso__etiqueta" htmlFor="perfil-usuario">Usuario</label>
          <input id="perfil-usuario" className="acceso__campo" autoComplete="username" autoCapitalize="none" placeholder="ana_datos" value={usuario} disabled={guardando} onChange={(evento) => { setUsuario(evento.target.value); setError(null); }} onKeyDown={(evento) => { if (evento.key === 'Enter') void guardar(); }} />
          {error && <p className="acceso__error" role="alert">{error}</p>}
          <button className="acceso__boton acceso__boton--principal" disabled={guardando || nombre.trim() === '' || usuario.trim() === ''} onClick={() => void guardar()}>{guardando ? 'Guardando…' : 'Entrar a la expedición'}</button>
          <button className="acceso__boton" onClick={() => void cerrarSesion()}>Usar otro correo</button>
        </div>
      </div>
    </Pantalla>
  );
}

export function Cargando() {
  return (
    <div className="cargando" role="status" aria-label="Cargando">
      <img className="cargando__logo" src={`${import.meta.env.BASE_URL}marca/logo.webp`} alt="" />
      <span className="cargando__rueda" aria-hidden="true" />
      <span>Entrando a la expedición…</span>
    </div>
  );
}

export function InsigniaDemo() {
  const salir = () => `${window.location.pathname}${window.location.hash}`;
  return (
    <div className="insignia-demo" role="note">
      <span>Modo demostración · datos de ejemplo</span>
      <a href={salir()}>Salir de la demo</a>
    </div>
  );
}

export function SinDatos({ rol }: { rol: Rol }) {
  return (
    <Pantalla clase="p-e26">
      <div className="pantalla__cuerpo contenido panel" style={{ justifyContent: 'center' }}>
        <Vacio
          titulo="Esta sección aún no está conectada"
          texto="Todavía no usa datos reales del curso. La estamos conectando por partes."
          pose="pensando"
          accion={<a className="boton boton--suave" href={INICIO_REAL[rol]}>Ir a lo que ya funciona</a>}
        />
      </div>
    </Pantalla>
  );
}

export function OtroRol({ rol }: { rol: Rol }) {
  return (
    <Pantalla clase="p-e26">
      <div className="pantalla__cuerpo contenido panel" style={{ justifyContent: 'center' }}>
        <Vacio
          titulo="Esta pantalla es de otro rol"
          texto="Con tu cuenta no puedes abrirla. Si crees que es un error, avisa a tu docente."
          pose="pensando"
          accion={<a className="boton boton--suave" href={inicioDeRol[rol]}>Volver a mi inicio</a>}
        />
      </div>
    </Pantalla>
  );
}
