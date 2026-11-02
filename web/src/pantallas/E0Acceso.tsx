import { useEffect, useState } from 'react';
import { Jaguar } from '../componentes/Jaguar';
import { useSesion } from '../componentes/sesion';
import { Kicker, Pantalla, Pill } from '../componentes/ui';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ESPERA_REENVIO = 60;

type Fase = 'formulario' | 'enviando' | 'enviado';

export function E0Acceso() {
  const { modoDemo, errorDeEnlace, enviarEnlace } = useSesion();
  const [correo, setCorreo] = useState('');
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
    const resultado = await enviarEnlace(correo);
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
          <h1 className="titulo">data-expedicion</h1>
          <p>Cada semana, una isla nueva. Entra y sigue tu ruta hasta el volcán.</p>
        </header>
        <div className="acceso__escena">
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
              <p>Entra con tu correo institucional. Te enviamos un enlace, sin contraseña.</p>
              {errorDeEnlace && <p className="acceso__error" role="alert">{errorDeEnlace}</p>}
              <input className="acceso__campo" type="email" inputMode="email" autoComplete="email" placeholder="tu.nombre@universidad.edu.co" value={correo} disabled={fase === 'enviando'} onChange={(evento) => { setCorreo(evento.target.value); setError(null); }} onKeyDown={(evento) => { if (evento.key === 'Enter') void enviar(); }} aria-label="Correo institucional" aria-invalid={error !== null} />
              {error && <p className="acceso__error" role="alert">{error}</p>}
              <button className="acceso__boton acceso__boton--principal" disabled={fase === 'enviando' || correo.trim() === ''} onClick={() => void enviar()}>{fase === 'enviando' ? 'Enviando…' : 'Enviarme el enlace'}</button>
            </>
          )}
          <small>Guardamos solo tu nombre, correo y grupo. Nada es público. Ley 1581 de 2012.</small>
        </div>
      </div>
    </Pantalla>
  );
}
