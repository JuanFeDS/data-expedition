import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { CodigoQR } from '../componentes/CodigoQR';
import { Dock } from '../componentes/Dock';
import { ResultadosFormulario, useResultados } from '../componentes/ResultadosFormulario';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { BarraDato, Cuenta, Dato, Estado, Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import { servicioSupabase as servicioPersonas, type PersonaCurso } from '../servicios/personas';
import { abrirFormulario, cerrarFormulario, listarFormularios, participantesFormulario, type Formulario } from '../servicios/formularios';

const NOMBRE_TIPO = { relampago: 'Relámpago', votacion: 'Votación', encuesta: 'Encuesta' } as const;

const segundosRestantes = (cierraEn: string | null) => (cierraEn ? Math.max(0, Math.round((new Date(cierraEn).getTime() - Date.now()) / 1000)) : null);

export function D11EnClaseReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [formularios, setFormularios] = useState<Formulario[] | null>(null);
  const [estudiantes, setEstudiantes] = useState<PersonaCurso[]>([]);
  const [participaron, setParticiparon] = useState<Set<string>>(new Set());
  const [aviso, setAviso] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  const abierto = formularios?.find((formulario) => formulario.estado === 'abierto' && (formulario.cierraEn === null || new Date(formulario.cierraEn).getTime() > Date.now())) ?? null;
  const { resultados, fallo: falloResultados } = useResultados(abierto?.id ?? null, true);

  const cargar = useCallback(async () => {
    if (!curso) return;
    try {
      const [lista, personas] = await Promise.all([listarFormularios(curso.id), servicioPersonas.cargar(curso.id)]);
      setFormularios(lista);
      setEstudiantes(personas.personas.filter((persona) => persona.rol === 'estudiante'));
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [curso]);

  useEffect(() => { void cargar(); }, [cargar]);

  useEffect(() => {
    if (!abierto) return undefined;
    const reloj = window.setInterval(() => {
      void cargar();
      participantesFormulario(abierto.id).then((lista) => setParticiparon(new Set(lista.map((participante) => participante.perfilId)))).catch(() => undefined);
    }, 3000);
    participantesFormulario(abierto.id).then((lista) => setParticiparon(new Set(lista.map((participante) => participante.perfilId)))).catch(() => undefined);
    return () => window.clearInterval(reloj);
  }, [abierto?.id, cargar]);

  const abrir = async (formulario: Formulario) => {
    if (!curso) return;
    setAviso(await abrirFormulario(curso.id, formulario.id));
    setParticiparon(new Set());
    await cargar();
  };

  const cerrar = async () => {
    if (!curso || !abierto) return;
    setAviso(await cerrarFormulario(curso.id, abierto.id));
    await cargar();
  };

  const abribles = (formularios ?? []).filter((formulario) => formulario.estado !== 'abierto' || formulario.id !== abierto?.id);
  const restante = abierto ? segundosRestantes(abierto.cierraEn) : null;
  const enlace = curso && abierto ? `${window.location.origin}${window.location.pathname}${rutaCurso('#/e20')}` : '';

  return (
    <Pantalla rol="docente" clase="p-d11">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="En vivo" titulo="En clase" subtitulo="Abre un formulario y los estudiantes lo ven en su pantalla." objeto="linterna" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar la clase. <button onClick={() => void cargar()}>Reintentar</button></p>}
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          <div className="d11__columnas">
            {abierto ? (
              <Tarjeta tono="oscura" kicker="Abierto ahora" titulo={abierto.titulo} accion={<Estado tipo="ok">En vivo</Estado>}>
                <div className="d11__qr">
                  {enlace && <CodigoQR valor={enlace} etiqueta="Código QR para responder el formulario" />}
                  <div className="d11__lado-qr">
                    <small>Escanea el QR o comparte este enlace</small>
                    <input className="d13__campo" readOnly value={enlace} onFocus={(evento) => evento.target.select()} aria-label="Enlace para responder" />
                    {restante !== null && <Cuenta key={abierto.id + String(abierto.cierraEn)} segundos={restante} total={abierto.duracionSegundos ?? restante} />}
                  </div>
                </div>
                <button className="boton boton--accent" onClick={() => void cerrar()}>Cerrar ahora</button>
              </Tarjeta>
            ) : (
              <Tarjeta kicker="Listos para abrir" titulo="¿Qué abres ahora?">
                {abribles.map((formulario) => (
                  <button key={formulario.id} className="d11__opcion" onClick={() => void abrir(formulario)}>
                    <strong>{formulario.titulo}</strong>
                    <small>{NOMBRE_TIPO[formulario.tipo]} · {formulario.duracionSegundos ? `${formulario.duracionSegundos} s` : 'sin límite'} · {formulario.anonimo ? 'anónima' : 'identificada'}{formulario.estado === 'cerrado' ? ' · ya se cerró, se reabre' : ''}</small>
                  </button>
                ))}
                {abribles.length === 0 && <p className="meta">No hay formularios. Crea uno en <a href={rutaCurso('#/d5') ?? '#/d5'}><u>Formularios</u></a>.</p>}
              </Tarjeta>
            )}
            <div className="d11__lado">
              {abierto && (
                <>
                  <Tarjeta>
                    <Dato valor={`${resultados?.total ?? abierto.participantes}/${estudiantes.length}`} etiqueta="Respuestas" nota="La presencia queda registrada" />
                    <BarraDato etiqueta="Participación" valor={estudiantes.length ? Math.round(((resultados?.total ?? 0) / estudiantes.length) * 100) : 0} />
                  </Tarjeta>
                  <Tarjeta kicker="Quién falta" titulo="Presencia">
                    <ul className="d11__presencia">
                      {estudiantes.map((estudiante) => (
                        <li key={estudiante.id} className={participaron.has(estudiante.id) ? 'si' : ''}>
                          <span className="avatar avatar--verde">{(estudiante.nombre ?? estudiante.correo).slice(0, 2).toUpperCase()}</span>
                          <small>{(estudiante.nombre ?? estudiante.correo).split(' ')[0]}</small>
                        </li>
                      ))}
                    </ul>
                  </Tarjeta>
                  <Tarjeta kicker="En vivo" titulo="Resultado">
                    <ResultadosFormulario resultados={resultados} fallo={falloResultados} />
                  </Tarjeta>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dock accion={abierto ? { etiqueta: 'En vivo', texto: 'Cerrar ahora', alPulsar: () => void cerrar() } : undefined} />
    </Pantalla>
  );
}
