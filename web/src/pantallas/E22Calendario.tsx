import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Estado, Tarjeta } from '../componentes/panel';
import { Pantalla, Pill, Segmentado } from '../componentes/ui';
import { useSesion } from '../componentes/sesion';
import { E22CalendarioReal } from './E22CalendarioReal';
import { trabajos } from '../datos';
import { calendarioProvisional, presenciales, sesiones } from '../datosPlan';

export function E22CalendarioEjemplo() {
  const [vista, setVista] = useState(0);
  const semanas = [...new Set(sesiones.map((sesion) => sesion.semana))];
  return (
    <Pantalla clase="p-e22">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Noviembre y diciembre" titulo="Calendario" subtitulo="16 sesiones virtuales, 3 presenciales y 7 trabajos." objeto="mapa" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Sesiones', 'Plazos']} activa={vista} alCambiar={setVista} />
          <div className="cal__columnas">
            <Tarjeta clase={vista === 0 ? '' : 'vista--off'} kicker="Sesiones virtuales" titulo="Semana a semana">
              <div className="cal__semanas">
                {semanas.map((semana) => (
                  <div className="cal__semana" key={semana}>
                    <span className="cal__etiqueta">Semana {semana}</span>
                    {sesiones.filter((sesion) => sesion.semana === semana).map((sesion) => (
                      <a key={sesion.codigo} href={sesion.estado === 'hoy' ? '#/e23' : '#/e22'} className={`cal__sesion cal__sesion--${sesion.estado}`}>
                        <b>{sesion.codigo}</b>
                        <div><strong>{sesion.tema}</strong><small>{sesion.fecha} · {sesion.hora}{sesion.trabajo ? ` · entrega ${sesion.trabajo}` : ''}</small></div>
                        {sesion.estado === 'hoy' ? <Estado tipo="tarde">Hoy</Estado> : sesion.estado === 'dada' ? <Estado tipo="ok">Dada</Estado> : null}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
              <p className="meta cal__nota">{calendarioProvisional}</p>
            </Tarjeta>
            <div className={`cal__lado ${vista === 1 ? '' : 'vista--off'}`}>
              <Tarjeta kicker="Plazos" titulo="Trabajos">
                <ul className="cal__plazos">
                  {trabajos.map((trabajo) => (
                    <li key={trabajo.codigo} className={`cal__plazo cal__plazo--${trabajo.estado}`}>
                      <b>{trabajo.vence.numero}<small>{trabajo.vence.dia}</small></b>
                      <div><strong>{trabajo.titulo}</strong><small>{trabajo.tema}</small></div>
                      {trabajo.estado === 'calificado' ? <Pill variante="accent" pequena>{trabajo.nota}</Pill> : trabajo.estado === 'actual' ? <Estado tipo="tarde">En curso</Estado> : <Estado tipo="pendiente">Pendiente</Estado>}
                    </li>
                  ))}
                </ul>
              </Tarjeta>
              <Tarjeta kicker="Sábados" titulo="Sesiones presenciales">
                <ul className="cal__plazos">
                  {presenciales.map((presencial) => (
                    <li key={presencial.codigo} className="cal__plazo">
                      <b>{presencial.codigo}</b>
                      <div><strong>{presencial.fecha} · {presencial.hora}</strong><small>{presencial.nota}</small></div>
                    </li>
                  ))}
                </ul>
              </Tarjeta>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Hoy · S8', texto: 'Ver la sesión', ruta: '#/e23' }} />
    </Pantalla>
  );
}

export function E22Calendario() {
  const { modoDemo } = useSesion();
  return modoDemo ? <E22CalendarioEjemplo /> : <E22CalendarioReal />;
}
