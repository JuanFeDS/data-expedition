import { useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { Estado, Tarjeta } from '../../../compartido/ui/panel';
import { conModoDemo } from '../../../compartido/ui/conModoDemo';
import { D7EquiposReal } from './EquiposReal';
import { Pantalla } from '../../../compartido/ui/ui';
import { ROLES_EQUIPO, equiposCurso, estudiantes } from '../../../demo/datosPlan';

export function D7EquiposEjemplo() {
  const [confirmado, setConfirmado] = useState(false);
  return (
    <Pantalla rol="docente" clase="p-d7">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Integrador · se forman en la semana 6" titulo="Equipos" subtitulo="La app propone equipos equilibrados con el radar de entrada; tú los ajustas." objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          <Tarjeta tono="menta" kicker="Propuesta asistida" titulo="3 equipos de 4" accion={confirmado ? <Estado tipo="ok">Confirmados</Estado> : <Estado tipo="tarde">Pendiente de confirmar</Estado>}>
            <p className="meta">Cada equipo mezcla niveles del radar y cubre los cuatro roles: {ROLES_EQUIPO.join(', ').toLowerCase()}. Puedes cambiar a cualquier persona de equipo o de rol.</p>
            <div className="acciones">
              <button className="boton boton--accent" disabled={confirmado} onClick={() => setConfirmado(true)}>{confirmado ? 'Equipos confirmados' : 'Confirmar equipos'}</button>
              <button className="boton boton--suave">Proponer de nuevo</button>
            </div>
          </Tarjeta>
          <div className="d7__equipos">
            {equiposCurso.map((equipo) => (
              <Tarjeta key={equipo.nombre} kicker={`Grupo ${equipo.grupo}`} titulo={`Equipo ${equipo.nombre}`} accion={<Estado tipo={equipo.balance === 'Equilibrado' ? 'ok' : 'tarde'}>{equipo.balance}</Estado>}>
                <ul className="d7__miembros">
                  {estudiantes.filter((estudiante) => estudiante.equipo === equipo.nombre).map((estudiante) => (
                    <li key={estudiante.id}>
                      <span className="avatar avatar--verde">{estudiante.iniciales}</span>
                      <div><strong>{estudiante.nombre}</strong><small>Datos {estudiante.datos} · {estudiante.ruta}</small></div>
                      <span className="d7__rol">{estudiante.rol}</span>
                    </li>
                  ))}
                </ul>
              </Tarjeta>
            ))}
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Semana 6', texto: confirmado ? 'Equipos confirmados' : 'Confirmar equipos', alPulsar: () => setConfirmado(true), deshabilitada: confirmado }} />
    </Pantalla>
  );
}

export const D7Equipos = conModoDemo(D7EquiposEjemplo, D7EquiposReal);
