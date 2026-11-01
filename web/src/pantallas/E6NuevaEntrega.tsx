import { useEffect, useRef, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { Kicker, Pantalla } from '../componentes/ui';

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
    setVerificacion('verificando');
    setFase(0);
    temporizadores.current.forEach(window.clearTimeout);
    temporizadores.current = [
      window.setTimeout(() => setFase(1), 750),
      window.setTimeout(() => setFase(2), 1500),
      window.setTimeout(() => setFase(3), 2250),
      window.setTimeout(() => setVerificacion(dueno === USUARIO_GITHUB ? 'ok' : 'ajeno'), 2550),
    ];
  };

  const cambiarEnlace = () => {
    setVerificacion('inicial');
    setFase(0);
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
    if (nombrePaso === 'Confirmar') return { etiqueta, texto: 'Entregar trabajo', alPulsar: () => setEnviado(true) };
    return { etiqueta, texto: 'Continuar', alPulsar: () => ir(paso + 1) };
  })();

  return (
    <Pantalla clase="p-e6">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Entregas', ruta: '#/e5' }} kicker="Trabajo 2 · Modelo predictivo" titulo={enviado ? 'Entrega registrada' : TITULOS[nombrePaso]} objeto="cuaderno" />
        <div className="contenido cuerpo-mundo centrar" style={{ gap: 12 }}>
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
                <p className="meta">Quedó guardada la versión <b>{sha}</b> de tu PR en {repo || 'tu repo'}. Si sigues empujando commits, tu entrega es esta.</p>
                <Jaguar pose="celebra" ancho={150} clase="entrega__guia" />
              </div>
            ) : nombrePaso === 'Enlace' ? (
              <>
                <Kicker>Enlace de tu pull request</Kicker>
                <p className="meta" style={{ fontSize: 13 }}>Pega el PR de tu repo público donde está la entrega final.</p>
                <div className={`campo campo--url ${errorEnlace ? 'campo--error' : ''}`} key={errorEnlace ? 'e' : 'n'}>
                  <label htmlFor="pr">Enlace del PR</label>
                  <input id="pr" value={enlace} placeholder="https://github.com/camilo-r/trabajo-2/pull/1" disabled={verificacion === 'verificando'} onChange={(evento) => { setEnlace(evento.target.value); setErrorEnlace(false); if (verificacion !== 'inicial') setVerificacion('inicial'); }} />
                </div>
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
                {verificacion === 'ok' && (
                  <div className="verif__tarjeta">
                    <strong>{dueno}/{repo} <span>#{numero}</span></strong>
                    <dl>
                      <div><dt>Autor</dt><dd>@{dueno} <em>es tu usuario</em></dd></div>
                      <div><dt>Estado</dt><dd>Abierto</dd></div>
                      <div><dt>Último commit</dt><dd><code>{sha}</code> · hace 2 h</dd></div>
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
                {modo === 'sin_ia' && <p className="meta" style={{ fontSize: 13 }}>Sin IA no necesitas bitácora. Al entregar responderás las preguntas de decisión del trabajo.</p>}
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
                <div className="verif__tarjeta">
                  <strong>{dueno}/{repo} <span>#{numero}</span></strong>
                  <dl>
                    <div><dt>Autor</dt><dd>@{dueno}</dd></div>
                    <div><dt>Versión</dt><dd><code>{sha}</code> · hace 2 h</dd></div>
                    <div><dt>Declaración</dt><dd>{modo === 'con_ia' ? 'Con IA' : 'Sin IA'}</dd></div>
                    <div><dt>Bitácora</dt><dd>{modo === 'con_ia' ? 'Completa' : 'No aplica'}</dd></div>
                  </dl>
                </div>
                <p className="meta" style={{ fontSize: 13 }}>Al entregar se guarda esta versión (<b>{sha}</b>). Si empujas más commits después, la revisión usa esta.</p>
              </>
            )}
          </div>
        </div>
      </div>
      <Dock accion={accion} />
    </Pantalla>
  );
}
