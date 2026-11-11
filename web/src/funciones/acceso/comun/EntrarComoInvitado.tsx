import { useState } from 'react';
import { Jaguar } from '../../../compartido/ui/Jaguar';
import { parametroDeRuta } from '../../../compartido/navegacion/navegacion';
import { Kicker, Pantalla } from '../../../compartido/ui/ui';
import { entrarComoInvitado, limpiarCodigo, recargarApp } from '../../../servicios/invitados';
import { Marca } from './EstadosDeAcceso';

export function EntrarComoInvitadoPantalla() {
  const [codigo, setCodigo] = useState(() => limpiarCodigo(parametroDeRuta('codigo') ?? ''));
  const [apodo, setApodo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entrar = async () => {
    setError(null);
    setEnviando(true);
    const resultado = await entrarComoInvitado(codigo, apodo);
    if (!resultado.ok) {
      setEnviando(false);
      setError(resultado.mensaje);
      return;
    }
    // La sesión se acaba de crear y el apodo se guardó después: se recarga para que la app lea el perfil completo.
    window.location.hash = `#/c/${resultado.cursoId}/e20`;
    recargarApp();
  };

  const listo = codigo.length === 5 && apodo.trim().length >= 2 && !enviando;

  return (
    <Pantalla tono="oscura" clase="pantalla--acceso p-e0">
      <div className="pantalla__cuerpo acceso">
        <header className="acceso__titulo">
          <Kicker estilo={{ color: 'var(--accent)' }}>Clase abierta</Kicker>
          <Marca />
          <p>Entra con el código que tu docente proyecta. Sin correo ni registro: solo un apodo.</p>
        </header>
        <div className="acceso__escena">
          <Marca visual />
          <Jaguar pose="saluda" ancho={150} clase="acceso__guia" />
        </div>
        <div className="acceso__hoja">
          <input className="acceso__campo" inputMode="text" autoCapitalize="characters" autoComplete="off" placeholder="Código de la clase" value={codigo} maxLength={5} disabled={enviando} onChange={(evento) => setCodigo(limpiarCodigo(evento.target.value))} aria-label="Código de la clase" />
          <input className="acceso__campo" autoComplete="nickname" placeholder="Tu apodo" value={apodo} maxLength={20} disabled={enviando} onChange={(evento) => setApodo(evento.target.value)} onKeyDown={(evento) => { if (evento.key === 'Enter' && listo) void entrar(); }} aria-label="Tu apodo" autoFocus={codigo.length === 5} />
          {error && <p className="acceso__error" role="alert">{error}</p>}
          <button className="acceso__boton acceso__boton--principal" disabled={!listo} onClick={() => void entrar()}>{enviando ? 'Entrando…' : 'Entrar a la clase'}</button>
          <small>Tu apodo lo verá la clase en el marcador. No guardamos correo ni datos personales.</small>
          <a className="acceso__boton" href="#/e0">Tengo una cuenta</a>
        </div>
      </div>
    </Pantalla>
  );
}
