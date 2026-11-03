import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Radar } from '../componentes/Radar';
import { useCurso } from '../componentes/curso';
import { Estado, Tarjeta } from '../componentes/panel';
import { Kicker, Pantalla } from '../componentes/ui';
import { guardarAutoinforme, miDiagnostico, type Diagnostico, type DimensionCurso } from '../servicios/radar';

const ESCALA = [1, 2, 3, 4, 5];

export function E17DiagnosticoReal() {
  const { curso } = useCurso();
  const [dimensiones, setDimensiones] = useState<DimensionCurso[]>([]);
  const [filas, setFilas] = useState<Diagnostico[]>([]);
  const [valores, setValores] = useState<Record<string, number>>({});
  const [cargado, setCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (!curso) return;
    miDiagnostico(curso.id).then(({ dimensiones: dims, filas: previas }) => {
      setDimensiones(dims);
      setFilas(previas);
      setValores(Object.fromEntries(previas.filter((fila) => fila.autoinforme !== null).map((fila) => [fila.dimensionId, fila.autoinforme as number])));
      setCargado(true);
    }).catch(() => { setAviso('No pudimos cargar tu diagnóstico.'); setCargado(true); });
  }, [curso]);

  const completo = dimensiones.length > 0 && dimensiones.every((dimension) => valores[dimension.id] !== undefined);
  const registrado = filas.filter((fila) => fila.sinIa !== null || fila.conIa !== null);
  const hayResultado = dimensiones.length > 0 && registrado.length > 0;

  const guardar = async () => {
    if (!curso) return;
    setGuardando(true);
    const error = await guardarAutoinforme(curso.id, valores);
    setGuardando(false);
    setAviso(error);
    setGuardado(error === null);
  };

  const radar = dimensiones.map((dimension) => {
    const fila = filas.find((candidata) => candidata.dimensionId === dimension.id);
    return { nombre: dimension.nombre, inicio: fila?.conIa ?? 0, ahora: fila?.sinIa ?? fila?.conIa ?? 0 };
  });
  const brechas = dimensiones.map((dimension) => {
    const fila = filas.find((candidata) => candidata.dimensionId === dimension.id);
    return { nombre: dimension.nombre, brecha: fila && fila.conIa !== null && fila.sinIa !== null ? Math.round(fila.conIa - fila.sinIa) : null, dijiste: fila?.autoinforme ?? null, real: fila?.sinIa !== null && fila?.sinIa !== undefined ? Math.round((fila.sinIa / 20) * 10) / 10 : null };
  });
  const mayor = [...brechas].filter((fila) => fila.brecha !== null).sort((a, b) => (b.brecha ?? 0) - (a.brecha ?? 0))[0];

  return (
    <Pantalla clase="p-e17">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Radar', ruta: '#/e2' }} kicker="Tu punto de partida" titulo="Diagnóstico" subtitulo="Qué haces con IA y qué haces sin ella." objeto="brujula" />
        <div className="contenido cuerpo-mundo panel">
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {cargado && dimensiones.length === 0 && <Tarjeta kicker="Por ahora" titulo="Sin dimensiones"><p className="meta">Tu docente aún no define las dimensiones del curso.</p></Tarjeta>}
          {dimensiones.length > 0 && (
            <Tarjeta kicker="Paso 1" titulo="Autoinforme" accion={guardado || filas.some((fila) => fila.autoinforme !== null) ? <Estado tipo="ok">Guardado</Estado> : <Estado tipo="tarde">Pendiente</Estado>}>
              <p className="meta">Cuánto crees dominar cada dimensión, de 1 a 5. No cuenta para aprobar: sirve para compararlo con lo que hagas después.</p>
              <ul className="diag__auto">
                {dimensiones.map((dimension) => (
                  <li key={dimension.id}>
                    <strong>{dimension.nombre}</strong>
                    <span className="rel__estrellas" role="radiogroup" aria-label={`Autoinforme de ${dimension.nombre}`}>
                      {ESCALA.map((valor) => <button type="button" key={valor} role="radio" aria-checked={valores[dimension.id] === valor} className={valor <= (valores[dimension.id] ?? 0) ? 'on' : ''} onClick={() => { setValores((actuales) => ({ ...actuales, [dimension.id]: valor })); setGuardado(false); }}>{valor}</button>)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="acciones"><button className="boton boton--accent" disabled={!completo || guardando} onClick={() => void guardar()}>{guardando ? 'Guardando…' : 'Guardar autoinforme'}</button></div>
            </Tarjeta>
          )}
          {dimensiones.length > 0 && (
            <Tarjeta kicker="Pasos 2 y 3" titulo="Tarea con IA y verificación sin IA" accion={hayResultado ? <Estado tipo="ok">Registrado</Estado> : <Estado tipo="pendiente">Lo registra tu docente</Estado>}>
              <p className="meta">Haces la tarea en casa con las herramientas que quieras y luego una verificación sin IA por videollamada. Tu docente registra aquí el resultado de cada dimensión.</p>
            </Tarjeta>
          )}
          {hayResultado && (
            <div className="diag__resultado">
              <Tarjeta kicker="Radar" titulo="Lo que haces sin ayuda" accion={<Estado tipo="info">Sin IA es la línea sólida</Estado>} clase="diag__radar">
                <div className="radar__marco"><Radar dimensiones={radar} ancho={342} alto={300} radio={100} /></div>
                <div className="radar__leyenda"><span><i className="ahora" />Sin IA (verificado)</span><span><i className="inicio" />Con IA (tarea)</span></div>
              </Tarjeta>
              <div className="diag__lado">
                {mayor && mayor.brecha !== null && (
                  <Tarjeta tono="menta" kicker="La brecha" titulo={`${mayor.nombre}: ${mayor.brecha} puntos`}>
                    <p className="meta">Es donde más te apoya la IA. No es malo: te dice qué conviene practicar sin ayuda.</p>
                  </Tarjeta>
                )}
                <Tarjeta kicker="Lo que dijiste, frente a lo que hiciste" titulo="Autoinforme">
                  <ul className="diag__auto">
                    {brechas.filter((fila) => fila.dijiste !== null && fila.real !== null).map((fila) => (
                      <li key={fila.nombre}>
                        <strong>{fila.nombre}</strong>
                        <span>dijiste {fila.dijiste} de 5</span>
                        <Estado tipo={Math.abs((fila.dijiste ?? 0) - (fila.real ?? 0)) <= 0.8 ? 'ok' : 'tarde'}>{fila.real} real</Estado>
                      </li>
                    ))}
                  </ul>
                </Tarjeta>
                <Kicker>Se compara con la forma B al final del curso</Kicker>
              </div>
            </div>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
