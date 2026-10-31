import { useState } from 'react';
import { Jaguar } from '../componentes/Jaguar';
import { Kicker, Pantalla, Pill } from '../componentes/ui';

export function E0Acceso() {
  const [correo, setCorreo] = useState('');
  return (
    <Pantalla tono="verde">
      <div className="pantalla__cuerpo acceso">
        <Jaguar pose="saluda" ancho={150} clase="acceso__guia" />
        <div className="acceso__texto">
          <Kicker estilo={{ color: 'var(--accent)' }}>Cursos de ciencia de datos</Kicker>
          <h1 className="titulo" style={{ fontSize: 60, lineHeight: .95 }}>data-expedición</h1>
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: '22px', opacity: .92 }}>Entra con tu correo institucional. Te enviamos un enlace, sin contraseña.</p>
          <input className="acceso__campo" type="email" placeholder="tu.nombre@universidad.edu.co" value={correo} onChange={(evento) => setCorreo(evento.target.value)} aria-label="Correo institucional" />
        </div>
        <div className="acceso__pie">
          <a href="#/e1"><Pill grande>Enviarme el enlace</Pill></a>
          <p>Guardamos solo tu nombre, correo y grupo. Nada es público. Ley 1581 de 2012.</p>
        </div>
      </div>
    </Pantalla>
  );
}
