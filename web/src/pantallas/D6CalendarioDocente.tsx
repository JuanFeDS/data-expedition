import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Estado, Tabla, Tarjeta } from '../componentes/panel';
import { Pantalla, Segmentado } from '../componentes/ui';
import { conModoDemo } from '../componentes/conModoDemo';
import { D6CalendarioReal } from './D6CalendarioReal';
import { trabajos } from '../datos';
import { calendarioProvisional, presenciales, sesiones } from '../datosPlan';

const RANGOS = ['Semanas 1–2', 'Semanas 3–4', 'Semanas 5–6', 'Semanas 7–8'];

export function D6CalendarioDocenteEjemplo() {
  const [rango, setRango] = useState(1);
  const visibles = sesiones.filter((sesion) => sesion.semana > rango * 2 && sesion.semana <= rango * 2 + 2);
  return (
    <Pantalla rol="docente" clase="p-d6">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Sesiones y plazos" titulo="Calendario del curso" subtitulo="Lo que cargues aquí aparece a los estudiantes." objeto="mapa" />
        <div className="contenido cuerpo-mundo panel">
          <Tarjeta tono="aviso"><p className="meta">{calendarioProvisional} Importa las fechas cuando la universidad entregue el calendario.</p></Tarjeta>
          <Segmentado opciones={RANGOS} activa={rango} alCambiar={setRango} />
          <div className="d6__columnas">
            <Tarjeta kicker={RANGOS[rango]} titulo="Sesiones virtuales" accion={<button className="boton boton--suave">Agregar sesión</button>}>
              <Tabla
                etiqueta="Sesiones"
                columnas={[{ clave: 'codigo', titulo: 'Sesión', ancho: '70px' }, { clave: 'fecha', titulo: 'Fecha', ancho: '1fr' }, { clave: 'tema', titulo: 'Tema', ancho: '2fr' }, { clave: 'plazo', titulo: 'Entrega', ancho: '90px' }, { clave: 'estado', titulo: 'Estado', ancho: '90px' }]}
                filas={visibles.map((sesion) => ({
                  codigo: sesion.codigo,
                  fecha: `${sesion.fecha} · ${sesion.hora}`,
                  tema: sesion.tema,
                  plazo: sesion.trabajo ?? '—',
                  estado: <Estado tipo={sesion.estado === 'dada' ? 'ok' : sesion.estado === 'hoy' ? 'tarde' : 'pendiente'}>{sesion.estado === 'dada' ? 'Dada' : sesion.estado === 'hoy' ? 'Hoy' : 'Próxima'}</Estado>,
                }))}
              />
            </Tarjeta>
            <div className="d6__lado">
              <Tarjeta kicker="Plazos de los trabajos" titulo="Esta ventana">
                <ul className="cal__plazos">
                  {trabajos.filter((trabajo) => trabajo.semana > rango * 2 && trabajo.semana <= rango * 2 + 2).map((trabajo) => (
                    <li key={trabajo.codigo} className="cal__plazo"><b>{trabajo.vence.numero}<small>{trabajo.vence.dia}</small></b><div><strong>{trabajo.titulo} · 11:59 p. m.</strong><small>{trabajo.tema}</small></div><Estado tipo="info">Pylint {trabajo.minPylint}</Estado></li>
                  ))}
                </ul>
              </Tarjeta>
              <Tarjeta kicker="Sábados" titulo="Presenciales">
                <ul className="cal__plazos">
                  {presenciales.map((presencial) => <li key={presencial.codigo} className="cal__plazo"><b>{presencial.codigo}</b><div><strong>{presencial.fecha}</strong><small>{presencial.nota}</small></div><Estado tipo={presencial.estado === 'dada' ? 'ok' : 'tarde'}>{presencial.estado === 'dada' ? 'Dada' : 'Por decidir'}</Estado></li>)}
                </ul>
              </Tarjeta>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Importar fechas', texto: 'Agregar sesión', ruta: '#/d6' }} />
    </Pantalla>
  );
}

export const D6CalendarioDocente = conModoDemo(D6CalendarioDocenteEjemplo, D6CalendarioReal);
