import { useEffect, useState } from 'react';
import {
  NOMBRE_FORMATO, PreguntaCompletar, PreguntaOpciones, PreguntaOrdenar, PreguntaUnir, PreguntaVF, type PreguntaDatos, type Resultado,
} from '../componentes/preguntas';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { sonar } from '../componentes/sonidos';
import { ResultadoPractica } from '../componentes/ResultadoPractica';
import { Kicker, Pantalla } from '../componentes/ui';
import { armarSesion, cargarBancoActivo, miPractica, terminarPractica, type PreguntaBanco, type ResultadoSesion, type ResumenPractica } from '../servicios/practica';
import { dimensionesDelCurso, miRadar } from '../servicios/radar';

function Pregunta({ datos, alCambiar, bloqueada }: { datos: PreguntaDatos; alCambiar: (resultado: Resultado | null) => void; bloqueada: boolean }) {
  switch (datos.tipo) {
    case 'opciones': return <PreguntaOpciones datos={datos} alCambiar={alCambiar} bloqueada={bloqueada} />;
    case 'vf': return <PreguntaVF datos={datos} alCambiar={alCambiar} bloqueada={bloqueada} />;
    case 'unir': return <PreguntaUnir datos={datos} alCambiar={alCambiar} bloqueada={bloqueada} />;
    case 'ordenar': return <PreguntaOrdenar datos={datos} alCambiar={alCambiar} bloqueada={bloqueada} />;
    default: return <PreguntaCompletar datos={datos} alCambiar={alCambiar} bloqueada={bloqueada} />;
  }
}

export function E7PracticaReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const volver = rutaCurso('#/e15') ?? '#/e15';
  const [sesion, setSesion] = useState<PreguntaBanco[] | null>(null);
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const [vacio, setVacio] = useState(false);
  const [fallo, setFallo] = useState(false);
  const [cola, setCola] = useState<number[]>([]);
  const [fallidas, setFallidas] = useState<Set<number>>(new Set());
  const [hechas, setHechas] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [revisando, setRevisando] = useState(false);
  const [fin, setFin] = useState<(ResultadoSesion & { primeraVez: boolean[]; resumen: ResumenPractica | null; guardado: boolean }) | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!curso) return;
    setSesion(null); setVacio(false); setFallo(false); setCola([]); setFallidas(new Set()); setHechas(0); setResultado(null); setRevisando(false); setFin(null);
    Promise.all([cargarBancoActivo(curso.id), miRadar(curso.id), dimensionesDelCurso(curso.id)]).then(([banco, radar, dimensiones]) => {
      const elegidas = armarSesion(banco, radar);
      if (elegidas.length === 0) { setVacio(true); return; }
      setNombres(Object.fromEntries(dimensiones.map((dimension) => [dimension.id, dimension.nombre])));
      setSesion(elegidas);
      setCola(elegidas.map((_, indice) => indice));
    }).catch(() => setFallo(true));
  }, [curso, intento]);

  const terminar = async (aciertos: Set<number>, total: number) => {
    if (!curso || !sesion) return;
    const primeraVez = sesion.map((_, indice) => !aciertos.has(indice));
    const respuestas = sesion.map((pregunta, indice) => ({ preguntaId: pregunta.id, primerIntento: primeraVez[indice] }));
    const { resultado: guardado, error } = await terminarPractica(curso.id, respuestas);
    if (error || !guardado) { setFin({ xp: 0, aciertos: primeraVez.filter(Boolean).length, total, primeraVez, resumen: null, guardado: false }); return; }
    const resumen = await miPractica(curso.id).catch(() => null);
    setFin({ ...guardado, primeraVez, resumen, guardado: true });
    sonar('sesion');
  };

  const continuar = () => {
    if (!sesion) return;
    const actual = cola[0];
    const falla = resultado?.correcta === false && !fallidas.has(actual);
    const nuevasFallidas = falla ? new Set(fallidas).add(actual) : fallidas;
    const siguiente = falla ? [...cola.slice(1), actual] : cola.slice(1);
    if (falla) setFallidas(nuevasFallidas);
    else setHechas((previas) => previas + 1);
    if (siguiente.length === 0) { void terminar(nuevasFallidas, sesion.length); return; }
    setCola(siguiente);
    setResultado(null);
    setRevisando(false);
  };

  if (fin) {
    return (
      <Pantalla tono="menta" clase="p-resultado-practica">
        <div className="pantalla__cuerpo">
          <ResultadoPractica aciertos={fin.aciertos} total={fin.total} xp={fin.xp} primeraVez={fin.primeraVez} resumen={fin.resumen} guardado={fin.guardado} alOtraSesion={() => setIntento((previo) => previo + 1)} rutaVolver={volver} />
        </div>
      </Pantalla>
    );
  }

  if (vacio || fallo || !sesion) {
    return (
      <Pantalla clase="p-e7">
        <div className="pantalla__cuerpo contenido">
          <p className="meta">{fallo ? 'No pudimos cargar la práctica. Intenta de nuevo en un momento.' : vacio ? 'Tu docente aún no carga preguntas de práctica.' : 'Preparando tu sesión…'}</p>
          <a className="boton boton--suave" href={volver}>Volver</a>
        </div>
      </Pantalla>
    );
  }

  const actual = cola[0];
  const pregunta = sesion[actual];
  const esRepaso = fallidas.has(actual);

  return (
    <Pantalla tono="oscura" clase="p-e7">
      <div className="pantalla__cuerpo">
        <div className="leccion__barra">
          <a className="cerrar-practica" href={volver} aria-label="Salir de la práctica">✕</a>
          <div className="leccion__prog">{sesion.map((_, indice) => <i key={indice} className={indice < hechas ? 'ok' : ''} />)}</div>
        </div>
        <div className="contenido sesion__cuerpo" key={`${actual}-${esRepaso}`}>
          <Kicker estilo={{ color: 'var(--mint)' }}>{esRepaso ? 'Repaso de lo que fallaste' : `Práctica mixta · ${NOMBRE_FORMATO[pregunta.datos.tipo]} · pregunta ${hechas + 1} de ${sesion.length}`}</Kicker>
          <p className="leccion__nivel">{nombres[pregunta.dimensionId] ?? 'Práctica'}</p>
          <Pregunta datos={pregunta.datos} alCambiar={setResultado} bloqueada={revisando} />
        </div>
        {revisando && resultado ? (
          <div className={`sesion__fb ${resultado.correcta ? 'sesion__fb--ok' : 'sesion__fb--mal'}`} role="status">
            <strong>{resultado.correcta ? '¡Correcto!' : 'Casi. Lo repasamos al final.'}</strong>
            {pregunta.datos.explicacion && <p>{pregunta.datos.explicacion}</p>}
            <button className="boton boton--accent" onClick={continuar}>Continuar</button>
          </div>
        ) : (
          <div className="sesion__pie">
            <button className="boton boton--accent sesion__comprobar" disabled={resultado === null} onClick={() => { setRevisando(true); sonar(resultado?.correcta ? 'acierto' : 'error'); }}>Comprobar</button>
          </div>
        )}
      </div>
    </Pantalla>
  );
}
