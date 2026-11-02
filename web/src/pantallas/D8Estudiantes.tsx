import { useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Estado, Tarjeta } from '../componentes/panel';
import { Radar } from '../componentes/Radar';
import { Pantalla, Pill } from '../componentes/ui';
import { dimensiones as radarBase, trabajos } from '../datos';
import { estudiantes, textoEntrega } from '../datosPlan';

export function D8Estudiantes() {
  const [id, setId] = useState('e1');
  const estudiante = estudiantes.find((candidato) => candidato.id === id)!;
  const ajuste = Math.round((estudiante.datos - 62) / 2);
  const radar = radarBase.map((dimension) => ({ ...dimension, ahora: Math.max(10, Math.min(95, dimension.ahora + ajuste)), inicio: Math.max(5, Math.min(90, dimension.inicio + ajuste)) }));
  return (
    <Pantalla rol="docente" clase="p-d8">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker={`Grupo ${estudiante.grupo} · @${estudiante.github} ✓`} titulo={estudiante.nombre} subtitulo={`Ruta ${estudiante.ruta.toLowerCase()} · equipo ${estudiante.equipo} · ${estudiante.rol}`} objeto="binoculares" />
        <div className="contenido cuerpo-mundo panel">
          <div className="d8__columnas">
            <Tarjeta kicker="12 estudiantes" titulo="Lista" clase="d8__lista">
              <ul>
                {estudiantes.map((candidato) => (
                  <li key={candidato.id}>
                    <button aria-pressed={candidato.id === id} onClick={() => setId(candidato.id)}>
                      <span className="avatar avatar--verde">{candidato.iniciales}</span>
                      <span>{candidato.nombre}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Tarjeta>
            <Tarjeta kicker="Radar frente a su punto de partida" titulo="Cómo va" clase="d8__radar">
              <div className="radar__marco"><Radar dimensiones={radar} ancho={342} alto={290} radio={96} /></div>
              <div className="radar__leyenda"><span><i className="ahora" />Ahora</span><span><i className="inicio" />Punto de partida</span></div>
            </Tarjeta>
            <div className="d8__lado">
              <Tarjeta kicker="Trabajos" titulo="Notas y declaraciones">
                <ul className="d8__notas">
                  {trabajos.slice(0, 3).map((trabajo) => (
                    <li key={trabajo.codigo}>
                      <strong>{trabajo.titulo}</strong>
                      <small>{trabajo.tema}</small>
                      {trabajo.estado === 'calificado' ? <><Pill variante="accent" pequena>{trabajo.nota}</Pill><Pill variante={trabajo.declaracion === 'Sin IA' ? 'azul' : 'suave'} pequena>{trabajo.declaracion}</Pill></> : <Estado tipo="tarde">{textoEntrega[estudiante.entrega]}</Estado>}
                    </li>
                  ))}
                </ul>
              </Tarjeta>
              <Tarjeta kicker="Evidencias" titulo="Lo que mueve su radar">
                <ul className="d8__notas">
                  <li><strong>Diagnóstico</strong><small>Con IA y sin IA</small><Estado tipo="ok">Forma A</Estado></li>
                  <li><strong>Lecciones</strong><small>6 esta semana · {estudiante.xp} XP</small><Estado tipo="info">Con tope</Estado></li>
                  <li><strong>Revisión en pareja</strong><small>Con {estudiante.pareja}</small><Estado tipo="pendiente">Pendiente</Estado></li>
                </ul>
              </Tarjeta>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: estudiante.nombre.split(' ')[0], texto: 'Corregir su entrega', ruta: '#/d4' }} />
    </Pantalla>
  );
}
