import { useState } from 'react';
import { Jaguar } from '../componentes/Jaguar';
import { Kicker, Pantalla, Pill } from '../componentes/ui';

export function E0Acceso() {
  const [correo, setCorreo] = useState('');
  return (
    <Pantalla tono="oscura" clase="pantalla--acceso">
      <div className="pantalla__cuerpo acceso">
        <header className="acceso__titulo">
          <Kicker estilo={{ color: 'var(--accent)' }}>Cursos de ciencia de datos</Kicker>
          <h1 className="titulo">data-expedicion</h1>
          <p>Cada semana, una isla nueva. Entra y sigue tu ruta hasta el volcán.</p>
        </header>
        <div className="acceso__escena">
          <Jaguar pose="saluda" ancho={150} clase="acceso__guia" />
        </div>
        <div className="acceso__hoja">
          <p>Entra con tu correo institucional. Te enviamos un enlace, sin contraseña.</p>
          <input className="acceso__campo" type="email" placeholder="tu.nombre@universidad.edu.co" value={correo} onChange={(evento) => setCorreo(evento.target.value)} aria-label="Correo institucional" />
          <a href="#/home"><Pill variante="accent" grande>Enviarme el enlace</Pill></a>
          <small>Guardamos solo tu nombre, correo y grupo. Nada es público. Ley 1581 de 2012.</small>
        </div>
      </div>
    </Pantalla>
  );
}
