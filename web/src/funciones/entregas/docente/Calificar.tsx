import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { useRutaCurso } from '../../../compartido/estado/curso';
import { parametroDeRuta } from '../../../compartido/navegacion/navegacion';
import { Estado, Tarjeta } from '../../../compartido/ui/panel';
import { Niveles, Pantalla } from '../../../compartido/ui/ui';
import { calificar, entregaParaCalificar, notaPonderada, type EntregaCalificable } from '../../../servicios/calificaciones';

export function D4Calificar() {
  const rutaCurso = useRutaCurso();
  const entregaId = parametroDeRuta('entrega');
  const volver = rutaCurso('#/d3') ?? '#/d3';
  const [entrega, setEntrega] = useState<EntregaCalificable | null>(null);
  const [niveles, setNiveles] = useState<Record<string, number>>({});
  const [retro, setRetro] = useState('');
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'vacio' | 'fallo'>('cargando');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entregaId) { setEstado('vacio'); return; }
    let activo = true;
    entregaParaCalificar(entregaId).then((encontrada) => {
      if (!activo) return;
      if (!encontrada) { setEstado('vacio'); return; }
      setEntrega(encontrada);
      setNiveles(Object.fromEntries(encontrada.criterios.map((criterio) => [criterio.id, encontrada.niveles[criterio.id] ?? 3])));
      setRetro(encontrada.retroalimentacion);
      setEstado('listo');
    }).catch(() => { if (activo) setEstado('fallo'); });
    return () => { activo = false; };
  }, [entregaId]);

  const nota = entrega ? notaPonderada(entrega.criterios, niveles) : 0;
  const mover = (id: string, delta: number) => setNiveles((actuales) => ({ ...actuales, [id]: Math.min(5, Math.max(1, (actuales[id] ?? 3) + delta)) }));

  const guardar = async () => {
    if (!entrega) return;
    setGuardando(true);
    const resultado = await calificar(entrega, niveles, retro);
    setGuardando(false);
    if (resultado.error) { setError(resultado.error); return; }
    window.location.hash = volver;
  };

  const sinCriterios = entrega !== null && entrega.criterios.length === 0;
  const puedeGuardar = entrega !== null && !sinCriterios && !guardando;

  return (
    <Pantalla rol="docente" clase="p-d4">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Entregas', ruta: volver }} kicker={entrega ? `${entrega.trabajo} · ${entrega.estudiante}` : 'Corrección'} titulo="Corrección" subtitulo="Rúbrica de 5 niveles, con medios puntos." objeto="trofeo">
          {entrega && <div className="cifra-mundo"><span className="num">{nota.toFixed(1)}</span><small>nota calculada<br />de 1.0 a 5.0</small></div>}
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo panel">
          {estado === 'cargando' && <p className="meta">Cargando la entrega…</p>}
          {estado === 'fallo' && <p className="acceso__error" role="alert">No pudimos cargar la entrega. <a href={volver}><u>Volver a Entregas</u></a></p>}
          {estado === 'vacio' && <Tarjeta kicker="Corrección" titulo="Elige una entrega"><p className="meta">Abre una desde <a href={volver}><u>Entregas</u></a> con el botón Calificar.</p></Tarjeta>}
          {entrega && (
            <div className="d4__columnas">
              <Tarjeta kicker="Rúbrica" titulo="Criterios" accion={<Estado tipo={entrega.estado === 'calificada' ? 'ok' : 'pendiente'}>{entrega.estado === 'calificada' ? 'Calificada' : 'Sin calificar'}</Estado>}>
                {sinCriterios && <p className="meta">Este trabajo no tiene criterios {entrega.modoIa === 'con_ia' ? 'con IA' : 'sin IA'}. Defínelos en <a href={rutaCurso('#/d10') ?? '#/d10'}><u>Rúbricas</u></a>.</p>}
                <ul className="d4__criterios">
                  {entrega.criterios.map((criterio) => {
                    const nivel = niveles[criterio.id] ?? 3;
                    return (
                      <li key={criterio.id}>
                        <div className="d4__nombre"><strong>{criterio.nombre}</strong><small>{criterio.dimension} · peso {criterio.peso}</small></div>
                        <div>
                          <Niveles nivel={nivel} />
                          <small className="meta">{criterio.descriptores[Math.floor(nivel) - 1]}</small>
                        </div>
                        <div className="d4__ajuste">
                          <button aria-label={`Bajar ${criterio.nombre}`} onClick={() => mover(criterio.id, -0.5)}>−</button>
                          <b>{nivel.toFixed(1)}</b>
                          <button aria-label={`Subir ${criterio.nombre}`} onClick={() => mover(criterio.id, 0.5)}>+</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="meta">Regla visible para el estudiante: promedio de los niveles, ponderado por el peso de cada criterio.</p>
              </Tarjeta>
              <div className="d4__lado">
                <Tarjeta kicker="Pull request" titulo={entrega.estudiante}>
                  <dl className="d4__datos">
                    <div><dt>Declaración</dt><dd>{entrega.modoIa === 'con_ia' ? 'Con IA' : 'Sin IA'}</dd></div>
                    <div><dt>Enlace</dt><dd>{entrega.enlacePr ? <a href={entrega.enlacePr} target="_blank" rel="noreferrer"><u>Abrir PR</u></a> : '—'}</dd></div>
                  </dl>
                  {entrega.bitacora && <p className="meta">{entrega.bitacora}</p>}
                </Tarjeta>
                <Tarjeta tono="menta" kicker="Retroalimentación" titulo={`Para ${entrega.estudiante}`}>
                  <div className="campo"><label htmlFor="retro">Comentario general</label><textarea id="retro" rows={3} value={retro} onChange={(evento) => setRetro(evento.target.value)} placeholder="Qué funcionó y qué mejorar…" /></div>
                  {error && <p className="acceso__error" role="alert">{error}</p>}
                  <div className="acciones">
                    <button className="boton boton--accent" disabled={!puedeGuardar} onClick={() => void guardar()}>{guardando ? 'Guardando…' : 'Guardar calificación'}</button>
                  </div>
                </Tarjeta>
              </div>
            </div>
          )}
        </div>
      </div>
      <Dock accion={puedeGuardar ? { etiqueta: `Nota ${nota.toFixed(1)}`, texto: 'Guardar calificación', alPulsar: () => void guardar() } : undefined} />
    </Pantalla>
  );
}
