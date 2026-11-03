import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { ResultadosFormulario, useResultados } from '../componentes/ResultadosFormulario';
import { useCurso } from '../componentes/curso';
import { Cuenta, Estado, Tarjeta } from '../componentes/panel';
import { sonar } from '../componentes/sonidos';
import { Pantalla } from '../componentes/ui';
import { formulariosAbiertos, responderFormulario, type Formulario, type Pregunta, type Respuesta } from '../servicios/formularios';

const LETRAS = 'ABCDEFGH';
const NOMBRE_TIPO = { relampago: 'Pregunta relámpago', votacion: 'Votación', encuesta: 'Encuesta' } as const;

function CampoPregunta({ pregunta, respuesta, alCambiar }: { pregunta: Pregunta; respuesta: Respuesta | undefined; alCambiar: (respuesta: Respuesta) => void }) {
  if (pregunta.tipo === 'opcion') {
    return (
      <div className="rel__opciones">
        {pregunta.opciones.map((opcion, indice) => (
          <button type="button" key={opcion} className="opcion" aria-pressed={respuesta?.opcion === indice} onClick={() => alCambiar({ preguntaId: pregunta.id, opcion: indice })}>
            <span className="opcion__punto" />
            <span><strong>{LETRAS[indice]} · {opcion}</strong></span>
          </button>
        ))}
      </div>
    );
  }
  if (pregunta.tipo === 'escala') {
    return (
      <div className="rel__estrellas" role="radiogroup" aria-label={pregunta.enunciado}>
        {[1, 2, 3, 4, 5].map((valor) => (
          <button type="button" key={valor} role="radio" aria-checked={respuesta?.escala === valor} className={valor <= (respuesta?.escala ?? 0) ? 'on' : ''} onClick={() => alCambiar({ preguntaId: pregunta.id, escala: valor })}>{valor}</button>
        ))}
      </div>
    );
  }
  return <textarea className="d13__campo" rows={3} value={respuesta?.texto ?? ''} onChange={(evento) => alCambiar({ preguntaId: pregunta.id, texto: evento.target.value })} placeholder="Escribe lo que quieras… o déjalo vacío." />;
}

export function E20Responder() {
  const { curso } = useCurso();
  const [abiertos, setAbiertos] = useState<Formulario[] | null>(null);
  const [respondidos, setRespondidos] = useState<Set<string>>(new Set());
  const [eligeId, setEligeId] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, Respuesta>>({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<{ correctas: number; conClave: number } | null>(null);
  const [fallo, setFallo] = useState(false);

  const cargar = useCallback(async () => {
    if (!curso) return;
    try {
      const { abiertos: lista, respondidos: hechos } = await formulariosAbiertos(curso.id);
      setAbiertos(lista);
      setRespondidos(hechos);
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [curso]);

  useEffect(() => {
    void cargar();
    const reloj = window.setInterval(() => void cargar(), 4000);
    return () => window.clearInterval(reloj);
  }, [cargar]);

  const elegido = abiertos?.find((formulario) => formulario.id === eligeId) ?? null;
  const yaRespondio = elegido ? respondidos.has(elegido.id) : false;
  const { resultados, fallo: falloResultados } = useResultados(yaRespondio && elegido ? elegido.id : null, elegido?.tipo === 'votacion');
  const unicoPendiente = abiertos && abiertos.filter((formulario) => !respondidos.has(formulario.id)).length === 1 ? abiertos.find((formulario) => !respondidos.has(formulario.id))?.id ?? null : null;

  useEffect(() => {
    if (!elegido && unicoPendiente) setEligeId(unicoPendiente);
  }, [elegido, unicoPendiente]);

  useEffect(() => { if (elegido?.tipo === 'relampago' && !yaRespondio) sonar('relampago'); }, [elegido?.id, elegido?.tipo, yaRespondio]);

  const completo = elegido ? elegido.preguntas.every((pregunta) => pregunta.tipo === 'texto' || respuestas[pregunta.id] !== undefined) : false;

  const enviar = async () => {
    if (!curso || !elegido) return;
    setEnviando(true);
    setError(null);
    const lista = elegido.preguntas.map((pregunta) => respuestas[pregunta.id]).filter((respuesta): respuesta is Respuesta => respuesta !== undefined && (respuesta.texto === undefined || respuesta.texto.trim() !== ''));
    const resultado = await responderFormulario(curso.id, elegido, lista);
    setEnviando(false);
    if (resultado.error) { setError(resultado.error); void cargar(); return; }
    setResumen({ correctas: resultado.correctas, conClave: resultado.conClave });
    setRespuestas({});
    await cargar();
  };

  const restante = elegido?.cierraEn ? Math.max(0, Math.round((new Date(elegido.cierraEn).getTime() - Date.now()) / 1000)) : null;

  return (
    <Pantalla clase="p-e20">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker={elegido ? NOMBRE_TIPO[elegido.tipo] : 'En clase'} titulo={elegido ? elegido.titulo : 'Responder'} subtitulo={elegido ? (elegido.anonimo ? 'Tu respuesta es anónima.' : 'Cuenta solo si respondes a tiempo.') : 'Lo que tu docente abra en clase aparece aquí.'} objeto="linterna" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar los formularios. Intenta de nuevo en un momento.</p>}
          {abiertos && abiertos.length === 0 && (
            <Tarjeta kicker="Todo en calma" titulo="Nada abierto por ahora">
              <div className="rel__jaguar"><Jaguar pose="pensando" ancho={96} /><p>Cuando tu docente abra un relámpago, una votación o una encuesta, aparecerá aquí sin recargar.</p></div>
            </Tarjeta>
          )}
          {abiertos && abiertos.length > 1 && (
            <Tarjeta kicker="Abiertos ahora" titulo="Elige uno">
              <div className="rel__opciones">
                {abiertos.map((formulario) => (
                  <button type="button" key={formulario.id} className="opcion" aria-pressed={eligeId === formulario.id} onClick={() => { setEligeId(formulario.id); setResumen(null); setError(null); }}>
                    <span className="opcion__punto" />
                    <span><strong>{formulario.titulo}</strong><small> · {NOMBRE_TIPO[formulario.tipo]}{respondidos.has(formulario.id) ? ' · respondido' : ''}</small></span>
                  </button>
                ))}
              </div>
            </Tarjeta>
          )}
          {elegido && !yaRespondio && (
            <div className="rel__cuerpo">
              {restante !== null && (
                <Tarjeta tono="oscura" clase="rel__tiempo">
                  <Cuenta key={elegido.id} segundos={restante} total={elegido.duracionSegundos ?? restante} />
                  <div><strong>{elegido.duracionSegundos} segundos</strong><small>Un solo intento</small></div>
                </Tarjeta>
              )}
              {elegido.preguntas.map((pregunta, indice) => (
                <Tarjeta key={pregunta.id} kicker={`Pregunta ${indice + 1} de ${elegido.preguntas.length}`} titulo={pregunta.enunciado} accion={<Estado tipo="info">{elegido.anonimo ? 'Anónima' : 'Un intento'}</Estado>}>
                  <CampoPregunta pregunta={pregunta} respuesta={respuestas[pregunta.id]} alCambiar={(respuesta) => setRespuestas((actuales) => ({ ...actuales, [pregunta.id]: respuesta }))} />
                </Tarjeta>
              ))}
              {error && <p className="acceso__error" role="alert">{error}</p>}
            </div>
          )}
          {elegido && yaRespondio && (
            <Tarjeta tono="menta" kicker="Respuesta enviada" titulo="¡Gracias!">
              <div className="rel__jaguar">
                <Jaguar pose="celebra" ancho={96} />
                <p>
                  {resumen && resumen.conClave > 0 ? (resumen.correctas === resumen.conClave ? '¡Correcta! ' : 'Esta vez no fue. ') : ''}
                  {elegido.mostrarResultado ? (elegido.tipo === 'votacion' ? 'Mira cómo vota el grupo, sin nombres.' : 'El resultado se muestra cuando tu docente cierre.') : 'Tu docente verá el resumen de todo el grupo.'}
                </p>
              </div>
              {elegido.mostrarResultado && (elegido.tipo === 'votacion' || resultados) && <ResultadosFormulario resultados={resultados} fallo={falloResultados} />}
            </Tarjeta>
          )}
        </div>
      </div>
      <Dock accion={elegido && !yaRespondio ? { etiqueta: elegido.tipo === 'relampago' ? 'Un solo intento' : 'Antes de enviar', texto: enviando ? 'Enviando…' : 'Responder', alPulsar: () => void enviar(), deshabilitada: !completo || enviando } : undefined} />
    </Pantalla>
  );
}
