import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Estado, Tarjeta } from '../componentes/panel';
import { useSesion } from '../componentes/sesion';
import { E17DiagnosticoReal } from './E17DiagnosticoReal';
import { Kicker, Pantalla, Segmentado } from '../componentes/ui';

const PASOS = [
  { titulo: 'Autoinforme', detalle: 'Cuánto crees dominar cada dimensión, de 1 a 5.', fecha: 'Hecho el 3 nov', minutos: '5 min' },
  { titulo: 'Tarea con IA permitida', detalle: 'En casa, con las herramientas que quieras. Declaras cuáles usaste.', fecha: 'Entregada el 4 nov', minutos: '60 min' },
  { titulo: 'Verificación sin IA', detalle: 'Por videollamada, con cámara encendida, al inicio de la S2.', fecha: 'Hecha el 5 nov', minutos: '20 min' },
];

export function E17DiagnosticoEjemplo() {
  const [forma, setForma] = useState(0);
  return (
    <Pantalla clase="p-e17">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Radar', ruta: '#/e2' }} kicker="Semana 1 · tu punto de partida" titulo="Diagnóstico" subtitulo="Dos momentos para ver qué haces con IA y qué haces sin ella." objeto="brujula" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Forma A · inicio', 'Forma B · final']} activa={forma} alCambiar={setForma} />
          {forma === 0 ? (
            <>
              <Tarjeta kicker="Forma A" titulo="Completado" accion={<Estado tipo="ok">Listo</Estado>} clase="diag__pasos">
                <ol className="diag__lista">
                  {PASOS.map((paso, indice) => (
                    <li key={paso.titulo} style={{ '--i': indice } as React.CSSProperties}>
                      <b>{indice + 1}</b>
                      <div><strong>{paso.titulo}</strong><span>{paso.detalle}</span><small>{paso.fecha} · {paso.minutos}</small></div>
                      <Estado tipo="ok">Hecho</Estado>
                    </li>
                  ))}
                </ol>
              </Tarjeta>
              <Tarjeta tono="menta" kicker="Para qué sirve" titulo="Tu punto de partida">
                <p className="meta">No cuenta para aprobar. Con la tarea y la verificación se calcula tu radar de entrada, y la diferencia entre las dos muestra dónde la IA te ayuda y dónde aún no dominas el tema.</p>
                <a className="boton" href="#/e19">Ver mi resultado</a>
              </Tarjeta>
            </>
          ) : (
            <Tarjeta kicker="Forma B" titulo="Aún no disponible" accion={<Estado tipo="pendiente">Semana 7</Estado>}>
              <p className="meta">Es un ejercicio distinto, pero de igual dificultad que la forma A. Se hace con la tarea de la S14 y la verificación sin IA de la S15, para comparar tu radar final con el de entrada.</p>
              <Kicker>Se abre el jue 17 dic</Kicker>
            </Tarjeta>
          )}
        </div>
      </div>
      <Dock accion={{ etiqueta: forma === 0 ? 'Diagnóstico completo' : 'Forma B', texto: forma === 0 ? 'Ver mi resultado' : 'Ver el calendario', ruta: forma === 0 ? '#/e19' : '#/e22' }} />
    </Pantalla>
  );
}

export function E17Diagnostico() {
  const { modoDemo } = useSesion();
  return modoDemo ? <E17DiagnosticoEjemplo /> : <E17DiagnosticoReal />;
}
