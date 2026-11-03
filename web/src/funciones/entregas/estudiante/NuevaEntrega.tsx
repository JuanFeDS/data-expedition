import { useEffect, useRef, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { Jaguar } from '../../../compartido/ui/Jaguar';
import { sonar } from '../../../compartido/ui/sonidos';
import { Kicker, Pantalla } from '../../../compartido/ui/ui';
import { useCurso } from '../../../compartido/estado/curso';
import { useSesion } from '../../../compartido/estado/sesion';
import { formatoFecha, trabajoPorEntregar, useServicioTrabajos, type TrabajoCurso } from '../../../servicios/trabajos';

type Modo = 'sin_ia' | 'con_ia';
type Verificacion = 'inicial' | 'verificando' | 'ok' | 'ajeno';

const USUARIO_GITHUB = 'camilo-r';
const PATRON_PR = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)\/?$/;

const OPCIONES: { modo: Modo; titulo: string; descripcion: string }[] = [
  { modo: 'sin_ia', titulo: 'Sin IA', descripcion: 'Lo hice yo solo. Se evalúan tus habilidades de base.' },
  { modo: 'con_ia', titulo: 'Con IA', descripcion: 'Usé IA. Mismo tope de nota: aquí se evalúa cómo la diriges.' },
];

const BITACORA = [
  { etiqueta: '¿Qué le pediste a la IA?', ejemplo: 'Ej: sugiere variables para predecir la deserción…' },
  { etiqueta: '¿Qué aceptaste?', ejemplo: 'Lo que usaste tal cual o con ajustes…' },
  { etiqueta: '¿Qué descartaste y por qué?', ejemplo: 'Lo que no usaste y la razón…' },
];

const COMPROBACIONES = ['Buscando el PR en GitHub', 'Comprobando que es tu usuario', 'Leyendo el último commit'];
const TITULOS: Record<string, string> = {
  Enlace: 'Enlaza tu entrega',
  Declarar: 'Declara cómo lo hiciste',
  Bitácora: 'Cuenta tu bitácora',
  Confirmar: 'Revisa y entrega',
};

const CONFETI = Array.from({ length: 16 }, (_, i) => {
  const angulo = (i / 16) * Math.PI * 2;
  const distancia = 90 + (i % 4) * 22;
  return { dx: Math.round(Math.cos(angulo) * distancia), dy: Math.round(Math.sin(angulo) * distancia) - 20, giro: (i % 2 ? 1 : -1) * (120 + i * 25) };
});

const shaDe = (texto: string) => {
  let valor = 5381;
  for (const caracter of texto) valor = ((valor * 33) ^ caracter.charCodeAt(0)) >>> 0;
  return valor.toString(16).padStart(7, '0').slice(0, 7);
};

function Marca() {
  return (
    <svg className="marca" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.4 6.6 11.5 12.5 4.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function E6NuevaEntrega() {
  const servicio = useServicioTrabajos();
  const { modoDemo } = useSesion();
  const { curso } = useCurso();
  const [trabajo, setTrabajo] = useState<TrabajoCurso | null>(null);
  const [errorEntrega, setErrorEntrega] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [paso, setPaso] = useState(0);
  const [direccion, setDireccion] = useState(1);
  const [enlace, setEnlace] = useState('');
  const [errorEnlace, setErrorEnlace] = useState(false);
  const [verificacion, setVerificacion] = useState<Verificacion>('inicial');
  const [fase, setFase] = useState(0);
  const [modo, setModo] = useState<Modo>('con_ia');
  const [bitacora, setBitacora] = useState(['', '', '']);
  const [enviado, setEnviado] = useState(false);
  const temporizadores = useRef<number[]>([]);

  useEffect(() => () => temporizadores.current.forEach(window.clearTimeout), []);

  useEffect(() => {
    if (!curso) return;
    void Promise.all([servicio.cargarTrabajos(curso.id), servicio.misEntregas(curso.id)])
      .then(([lista, entregas]) => setTrabajo(trabajoPorEntregar(lista, entregas)))
      .catch(() => setTrabajo(null));
  }, [servicio, curso]);

  const coincidencia = PATRON_PR.exec(enlace.trim());
  const [, dueno = '', repo = '', numero = ''] = coincidencia ?? [];
  const sha = shaDe(enlace.trim());

  const pasos = ['Enlace', 'Declarar', ...(modo === 'con_ia' ? ['Bitácora'] : []), 'Confirmar'];
  const nombrePaso = pasos[paso];

  const ir = (nuevo: number) => {
    setDireccion(nuevo > paso ? 1 : -1);
    setPaso(nuevo);
  };

  const verificar = () => {
    if (!coincidencia) {
      setErrorEnlace(true);
      return;
    }
    setErrorEnlace(false);
    if (!modoDemo) {
      setVerificacion('ok');
      return;
    }
    setVerificacion('verificando');
    setFase(0);
    temporizadores.current.forEach(window.clearTimeout);
    temporizadores.current = [
      window.setTimeout(() => { setFase(1); sonar('verificacion', 0); }, 750),
      window.setTimeout(() => { setFase(2); sonar('verificacion', 1); }, 1500),
      window.setTimeout(() => { setFase(3); sonar('verificacion', 2); }, 2250),
      window.setTimeout(() => setVerificacion(dueno === USUARIO_GITHUB ? 'ok' : 'ajeno'), 2550),
    ];
  };

  const cambiarEnlace = () => {
    setVerificacion('inicial');
    setFase(0);
  };

  const entregar = async () => {
    if (!trabajo) return;
    setErrorEntrega(null);
    if (modoDemo) {
      await servicio.entregar({ trabajoId: trabajo.id, enlacePr: enlace.trim(), modoIa: modo, bitacora: null });
      setEnviado(true);
      sonar('entrega');
      return;
    }
    setGuardando(true);
    const textoBitacora = modo === 'con_ia' ? BITACORA.map((campo, indice) => `${campo.etiqueta}: ${bitacora[indice].trim()}`).join(' | ') : null;
    const error = await servicio.entregar({ trabajoId: trabajo.id, enlacePr: enlace.trim(), modoIa: modo, bitacora: textoBitacora });
    setGuardando(false);
    if (error) { setErrorEntrega(error); return; }
    setEnviado(true);
    sonar('entrega');
  };

  const accion = (() => {
    const etiqueta = `Paso ${paso + 1} de ${pasos.length}`;
    if (enviado) return { etiqueta: 'Entregado', texto: 'Ver mis entregas', ruta: '#/e5' };
    if (nombrePaso === 'Enlace') {
      if (verificacion === 'verificando') return { etiqueta, texto: 'Verificando…', alPulsar: () => undefined, deshabilitada: true };
      if (verificacion === 'ok') return { etiqueta, texto: 'Continuar', alPulsar: () => ir(1) };
      if (verificacion === 'ajeno') return { etiqueta, texto: 'Cambiar enlace', alPulsar: cambiarEnlace };
      return { etiqueta, texto: 'Verificar enlace', alPulsar: verificar, deshabilitada: enlace.trim() === '' };
    }
    if (nombrePaso === 'Bitácora') return { etiqueta, texto: 'Continuar', alPulsar: () => ir(paso + 1), deshabilitada: bitacora[0].trim() === '' };
    if (nombrePaso === 'Confirmar') return { etiqueta, texto: guardando ? 'Guardando…' : 'Entregar trabajo', alPulsar: () => void entregar(), deshabilitada: guardando || !trabajo };
    return { etiqueta, texto: 'Continuar', alPulsar: () => ir(paso + 1) };
  })();

  return (
    <Pantalla clase="p-e6">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Entregas', ruta: '#/e5' }} kicker={trabajo ? `${trabajo.nombre}${trabajo.tema ? ` · ${trabajo.tema}` : ''}` : 'Nueva entrega'} titulo={enviado ? 'Entrega registrada' : TITULOS[nombrePaso]} objeto="cuaderno" />
        <div className="contenido cuerpo-mundo" style={{ gap: 12 }}>
          <ol className="pasos" aria-label="Pasos de la entrega">
            {pasos.map((etiqueta, indice) => (
              <li key={etiqueta} className={enviado || indice < paso ? 'hecho' : indice === paso ? 'actual' : ''}>
                <b>{enviado || indice < paso ? <Marca /> : indice + 1}</b><span>{etiqueta}</span>
              </li>
            ))}
          </ol>

          {paso > 0 && !enviado && (
            <button className="entrega__atras" onClick={() => ir(paso - 1)}>‹ Paso anterior</button>
          )}

          <div className="entrega__paso" key={enviado ? 'ok' : nombrePaso} style={{ '--dir': direccion } as React.CSSProperties}>
            {enviado ? (
              <div className="entrega__ok">
                <div className="entrega__sello">
                  <svg width="84" height="84" viewBox="0 0 84 84" fill="none" aria-hidden="true">
                    <circle cx="42" cy="42" r="38" fill="var(--mint)" />
                    <path className="entrega__trazo" d="M25 43 37 55 60 30" stroke="var(--deep)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {CONFETI.map((pieza, indice) => (
                    <i key={indice} className="confeti" style={{ '--dx': `${pieza.dx}px`, '--dy': `${pieza.dy}px`, '--giro': `${pieza.giro}deg`, '--i': indice } as React.CSSProperties} />
                  ))}
                </div>
                <h2 className="titulo">Entregado</h2>
                <p className="meta">{modoDemo ? <>Quedó guardada la versión <b>{sha}</b> de tu PR en {repo || 'tu repo'}. Si sigues empujando commits, tu entrega es esta.</> : <>Quedó registrado tu PR de {repo || 'tu repo'}. Tu docente lo revisará.</>}</p>
                <Jaguar pose="celebra" ancho={150} clase="entrega__guia" />
              </div>
            ) : nombrePaso === 'Enlace' ? (
              <>
                <Kicker>Enlace de tu pull request</Kicker>
                <p className="meta" style={{ fontSize: 'var(--fs-sm)' }}>Pega el PR de tu repo público donde está la entrega final.</p>
                <div className={`campo campo--url ${errorEnlace ? 'campo--error' : ''}`} key={errorEnlace ? 'e' : 'n'}>
                  <label htmlFor="pr">Enlace del PR</label>
                  <input id="pr" value={enlace} placeholder="https://github.com/camilo-r/trabajo-2/pull/1" disabled={verificacion === 'verificando'} onChange={(evento) => { setEnlace(evento.target.value); setErrorEnlace(false); if (verificacion !== 'inicial') setVerificacion('inicial'); }} />
                </div>
                {verificacion === 'inicial' && !errorEnlace && !modoDemo && (
                  <div className="verif__previa">
                    <Kicker>Qué pasa al entregar</Kicker>
                    <ul>
                      <li><i>1</i>Guardamos el enlace de tu PR</li>
                      <li><i>2</i>Tu docente lo revisa y lo califica con la rúbrica</li>
                    </ul>
                  </div>
                )}
                {verificacion === 'inicial' && !errorEnlace && modoDemo && (
                  <div className="verif__previa">
                    <Kicker>Qué revisamos al verificar</Kicker>
                    <ul>
                      <li><i>1</i>Que el PR exista y sea de tu usuario de GitHub</li>
                      <li><i>2</i>Su estado y el último commit, que queda guardado como tu versión</li>
                      <li><i>3</i>Black y Pylint, con mínimo de {trabajo?.minPylint ?? 8} en este trabajo</li>
                      <li><i>4</i>Si tu pareja ya aprobó y quién fusiona</li>
                    </ul>
                  </div>
                )}
                {errorEnlace && <p className="entrega__error" role="alert">Ese enlace no parece un PR. Debe verse como github.com/usuario/repo/pull/1</p>}
                {verificacion !== 'inicial' && (
                  <ul className="verif" aria-live="polite">
                    {COMPROBACIONES.map((texto, indice) => (
                      <li key={texto} className={fase > indice ? 'hecha' : fase === indice && verificacion === 'verificando' ? 'activa' : ''} style={{ '--i': indice } as React.CSSProperties}>
                        <span className="verif__icono">{fase > indice ? <Marca /> : null}</span>{texto}
                      </li>
                    ))}
                  </ul>
                )}
                {verificacion === 'ok' && !modoDemo && (
                  <div className="verif__tarjeta">
                    <strong>{dueno}/{repo} <span>#{numero}</span></strong>
                    <dl>
                      <div><dt>Autor</dt><dd>@{dueno}</dd></div>
                      <div><dt>Comprobación</dt><dd>La revisa tu docente <em>aún no es automática</em></dd></div>
                      <div><dt>Plazo</dt><dd>{formatoFecha(trabajo?.venceEn ?? null).largo}, 11:59 p. m.</dd></div>
                    </dl>
                  </div>
                )}
                {verificacion === 'ok' && modoDemo && (
                  <div className="verif__tarjeta">
                    <strong>{dueno}/{repo} <span>#{numero}</span></strong>
                    <dl>
                      <div><dt>Autor</dt><dd>@{dueno} <em>es tu usuario</em></dd></div>
                      <div><dt>Estado</dt><dd>Abierto</dd></div>
                      <div><dt>Último commit</dt><dd><code>{sha}</code> · hace 2 h</dd></div>
                      <div><dt>Calidad de código</dt><dd>Black ✓ · Pylint 8.4 <em>mín. {trabajo?.minPylint ?? 8}</em></dd></div>
                      <div><dt>Tu pareja</dt><dd>Julián Arias <em>aún no aprueba</em></dd></div>
                      <div><dt>Plazo</dt><dd>{formatoFecha(trabajo?.venceEn ?? null).largo}, 11:59 p. m. <em>a tiempo</em></dd></div>
                    </dl>
                  </div>
                )}
                {verificacion === 'ajeno' && (
                  <div className="verif__tarjeta verif__tarjeta--aviso" role="alert">
                    <strong>Este PR es de @{dueno}</strong>
                    <p>Tu usuario de GitHub es @{USUARIO_GITHUB}. Cada persona entrega el PR de su propio repo.</p>
                  </div>
                )}
              </>
            ) : nombrePaso === 'Declarar' ? (
              <>
                {OPCIONES.map((opcion) => (
                  <button key={opcion.modo} className="opcion" aria-pressed={modo === opcion.modo} onClick={() => setModo(opcion.modo)}>
                    <span className="opcion__punto" />
                    <span><strong>{opcion.titulo}</strong><span>{opcion.descripcion}</span></span>
                  </button>
                ))}
                {modo === 'sin_ia' && <p className="meta" style={{ fontSize: 'var(--fs-sm)' }}>Sin IA no necesitas bitácora. Al entregar responderás las preguntas de decisión del trabajo.</p>}
              </>
            ) : nombrePaso === 'Bitácora' ? (
              <>
                <Kicker>Tu bitácora</Kicker>
                {BITACORA.map((campo, indice) => (
                  <div className="campo campo--numerado" key={campo.etiqueta} style={{ '--i': indice } as React.CSSProperties}>
                    <label><b>{indice + 1}</b>{campo.etiqueta}</label>
                    <textarea rows={2} value={bitacora[indice]} placeholder={campo.ejemplo} onChange={(evento) => setBitacora((actual) => actual.map((valor, posicion) => (posicion === indice ? evento.target.value : valor)))} />
                  </div>
                ))}
              </>
            ) : (
              <>
                <Kicker>Esto es lo que entregas</Kicker>
                {modoDemo ? (
                  <>
                <div className="verif__tarjeta">
                  <strong>{dueno}/{repo} <span>#{numero}</span></strong>
                  <dl>
                    <div><dt>Autor</dt><dd>@{dueno}</dd></div>
                    <div><dt>Versión</dt><dd><code>{sha}</code> · hace 2 h</dd></div>
                    <div><dt>Declaración</dt><dd>{modo === 'con_ia' ? 'Con IA' : 'Sin IA'}</dd></div>
                    <div><dt>Bitácora</dt><dd>{modo === 'con_ia' ? 'Completa' : 'No aplica'}</dd></div>
                    <div><dt>Plazo</dt><dd>A tiempo</dd></div>
                    <div><dt>Revisión</dt><dd>Tu pareja aprueba · el docente fusiona</dd></div>
                  </dl>
                </div>
                  </>
                ) : (
                  <div className="verif__tarjeta">
                    <strong>{dueno}/{repo} <span>#{numero}</span></strong>
                    <dl>
                      <div><dt>Autor</dt><dd>@{dueno}</dd></div>
                      <div><dt>Declaración</dt><dd>{modo === 'con_ia' ? 'Con IA' : 'Sin IA'}</dd></div>
                      <div><dt>Bitácora</dt><dd>{modo === 'con_ia' ? 'Completa' : 'No aplica'}</dd></div>
                      <div><dt>Plazo</dt><dd>{trabajo?.venceEn && new Date() > new Date(trabajo.venceEn) ? 'Fuera de plazo' : 'A tiempo'}</dd></div>
                    </dl>
                  </div>
                )}
                {errorEntrega && <p className="entrega__error" role="alert">{errorEntrega}</p>}
                <p className="meta" style={{ fontSize: 'var(--fs-sm)' }}>{modoDemo ? <>Al entregar se guarda esta versión (<b>{sha}</b>). Si empujas más commits después, la revisión usa esta.</> : 'Puedes volver a entregar mientras tu docente no lo califique.'}</p>
              </>
            )}
          </div>
        </div>
      </div>
      <Dock accion={accion} />
    </Pantalla>
  );
}
