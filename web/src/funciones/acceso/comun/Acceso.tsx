import { useEffect, useState } from 'react';
import { Marca, PASOS_DE_ACCESO } from './EstadosDeAcceso';
import { Jaguar } from '../../../compartido/ui/Jaguar';
import { useSesion } from '../../../compartido/estado/sesion';
import { Kicker, Pantalla, Pill } from '../../../compartido/ui/ui';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ESPERA_REENVIO = 60;

type Modo = 'entrar' | 'registrar';
type Fase = 'formulario' | 'enviando' | 'enviado';

export function E0Acceso() {
  const { modoDemo, errorDeEnlace, enviarEnlace, entrarConGoogle } = useSesion();
  const [correo, setCorreo] = useState('');
  const [modo, setModo] = useState<Modo>('entrar');
  const [fase, setFase] = useState<Fase>('formulario');
  const [error, setError] = useState<string | null>(null);
  const [espera, setEspera] = useState(0);

  useEffect(() => {
    if (espera <= 0) return undefined;
    const reloj = window.setTimeout(() => setEspera((actual) => actual - 1), 1000);
    return () => window.clearTimeout(reloj);
  }, [espera]);

  const enviar = async () => {
    if (!CORREO_VALIDO.test(correo.trim())) {
      setError('Revisa el correo: no parece válido.');
      return;
    }
    setError(null);
    setFase('enviando');
    const resultado = await enviarEnlace(correo, modo === 'registrar');
    if (resultado.ok) {
      setFase('enviado');
      setEspera(ESPERA_REENVIO);
    } else {
      setFase('formulario');
      setError(resultado.mensaje);
    }
  };

  return (
    <Pantalla tono="oscura" clase="pantalla--acceso p-e0">
      <div className="pantalla__cuerpo acceso">
        <header className="acceso__titulo">
          <Kicker estilo={{ color: 'var(--accent)' }}>Cursos de ciencia de datos</Kicker>
          <Marca />
          <p>Cada semana, una isla nueva. Entra y sigue tu ruta hasta el volcán.</p>
        </header>
        <div className="acceso__escena">
          <Marca visual />
          <Jaguar pose={fase === 'enviado' ? 'celebra' : 'saluda'} ancho={150} clase="acceso__guia" />
          <img className="acceso__mapa" src={`${import.meta.env.BASE_URL}objetos/mapa.webp`} alt="" />
        </div>
        <div className="acceso__hoja">
          {modoDemo ? (
            <>
              <p>Entra con tu correo institucional. Te enviamos un enlace, sin contraseña.</p>
              <input className="acceso__campo" type="email" placeholder="tu.nombre@universidad.edu.co" value={correo} onChange={(evento) => setCorreo(evento.target.value)} aria-label="Correo institucional" />
              <a href="#/home"><Pill variante="accent" grande>Enviarme el enlace</Pill></a>
              <div className="acceso__roles"><span>Entrar como</span><a href="#/home">Estudiante</a><a href="#/d1">Docente</a><a href="#/o1">Observador</a></div>
            </>
          ) : fase === 'enviado' ? (
            <>
              <p className="acceso__ok"><b>Revisa tu correo.</b> Te enviamos un enlace a <b>{correo.trim()}</b>. Ábrelo en este mismo navegador. Si no llega en un minuto, mira la carpeta de spam.</p>
              <button className="acceso__boton" disabled={espera > 0} onClick={() => { setFase('formulario'); setError(null); }}>{espera > 0 ? `Pedir otro enlace en ${espera} s` : 'Pedir otro enlace o cambiar el correo'}</button>
            </>
          ) : (
            <>
              <div className="acceso__pestanas" role="tablist">
                <button role="tab" aria-selected={modo === 'entrar'} onClick={() => { setModo('entrar'); setError(null); }}>Iniciar sesión</button>
                <button role="tab" aria-selected={modo === 'registrar'} onClick={() => { setModo('registrar'); setError(null); }}>Crear cuenta</button>
              </div>
              <p>{modo === 'entrar' ? 'Escribe el correo con el que te registraste. Te enviamos un enlace para entrar, sin contraseña.' : 'Usa tu correo institucional. Te enviamos un enlace y, al abrirlo, eliges tu nombre y usuario.'}</p>
              {errorDeEnlace && <p className="acceso__error" role="alert">{errorDeEnlace}</p>}
              <button className="acceso__boton acceso__boton--google" onClick={() => void entrarConGoogle().then((resultado) => { if (!resultado.ok) setError(resultado.mensaje); })}>
                <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.100 0 24s.9 7.600 2.600 10.800l7.900-6.100z"/><path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/></svg>
                Continuar con Google
              </button>
              <div className="acceso__o"><span>o con un enlace al correo</span></div>
              <input className="acceso__campo" type="email" inputMode="email" autoComplete="email" placeholder="tu.nombre@universidad.edu.co" value={correo} disabled={fase === 'enviando'} onChange={(evento) => { setCorreo(evento.target.value); setError(null); }} onKeyDown={(evento) => { if (evento.key === 'Enter') void enviar(); }} aria-label="Correo institucional" aria-invalid={error !== null} />
              {error && <p className="acceso__error" role="alert">{error}</p>}
              <button className="acceso__boton acceso__boton--principal" disabled={fase === 'enviando' || correo.trim() === ''} onClick={() => void enviar()}>{fase === 'enviando' ? 'Enviando…' : modo === 'entrar' ? 'Entrar con enlace' : 'Crear mi cuenta'}</button>
            </>
          )}
          {!modoDemo && fase !== 'enviado' && <p className="acceso__invitado">¿Vienes a una clase abierta? <a href="#/entrar">Entra con un código</a></p>}
          <ol className="acceso__pasos">
            {PASOS_DE_ACCESO.map((paso) => <li key={paso.numero}><b>{paso.numero}</b><span><strong>{paso.titulo}</strong>{paso.texto}</span></li>)}
          </ol>
          <small>Guardamos solo tu nombre, correo y grupo. Nada es público. Ley 1581 de 2012. <a href={`${import.meta.env.BASE_URL}privacidad.html`}>Privacidad</a> · <a href={`${import.meta.env.BASE_URL}terminos.html`}>Condiciones</a></small>
        </div>
      </div>
    </Pantalla>
  );
}
