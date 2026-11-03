import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso } from '../componentes/curso';
import { BarraDato, Estado, Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import { servicioSupabase as servicioPersonas, type PersonaCurso } from '../servicios/personas';
import {
  UMBRAL_NIVELACION, UMBRAL_PROFUNDIZACION, confirmarRuta, diagnosticosDelCurso, dimensionesDelCurso, registrarDiagnostico, rutaDeEstudiante, rutaGuardada, rutaPropuestaDelCurso,
  type Diagnostico, type DimensionCurso, type RutaCurso,
} from '../servicios/radar';

const RUTAS: { clave: RutaCurso; nombre: string }[] = [{ clave: 'nivelacion', nombre: 'Nivelación' }, { clave: 'estandar', nombre: 'Estándar' }, { clave: 'profundizacion', nombre: 'Profundización' }];

type Entrada = Record<string, { conIa: string; sinIa: string }>;

const aEntrada = (dimensiones: DimensionCurso[], filas: Diagnostico[]): Entrada => Object.fromEntries(dimensiones.map((dimension) => {
  const fila = filas.find((candidata) => candidata.dimensionId === dimension.id);
  return [dimension.id, { conIa: fila?.conIa != null ? String(fila.conIa) : '', sinIa: fila?.sinIa != null ? String(fila.sinIa) : '' }];
}));

const numeroOCero = (texto: string) => (texto.trim() === '' ? null : Math.min(100, Math.max(0, Number(texto))));

function EditorDiagnostico({ persona, dimensiones, filas, alGuardar, alCancelar }: { persona: PersonaCurso; dimensiones: DimensionCurso[]; filas: Diagnostico[]; alGuardar: (entrada: Entrada) => Promise<void>; alCancelar: () => void }) {
  const [entrada, setEntrada] = useState(() => aEntrada(dimensiones, filas));
  const [guardando, setGuardando] = useState(false);
  const cambiar = (id: string, campo: 'conIa' | 'sinIa', valor: string) => setEntrada((actual) => ({ ...actual, [id]: { ...actual[id], [campo]: valor } }));
  const valido = Object.values(entrada).every((par) => [par.conIa, par.sinIa].every((texto) => texto.trim() === '' || Number.isFinite(Number(texto))));
  return (
    <form className="d14__formulario rubrica__editor" onSubmit={(evento) => { evento.preventDefault(); if (!valido) return; setGuardando(true); void alGuardar(entrada).finally(() => setGuardando(false)); }}>
      <strong>{persona.nombre ?? persona.correo}</strong>
      <small className="meta">Resultado de 0 a 100 por dimensión. Si dejas «sin IA» vacío, el punto de partida del radar usa el de «con IA».</small>
      {dimensiones.map((dimension) => (
        <div className="d14__par" key={dimension.id}>
          <label className="d14__etiqueta">{dimension.nombre} · con IA<input className="d13__campo" type="number" min={0} max={100} value={entrada[dimension.id].conIa} onChange={(evento) => cambiar(dimension.id, 'conIa', evento.target.value)} /></label>
          <label className="d14__etiqueta">sin IA<input className="d13__campo" type="number" min={0} max={100} value={entrada[dimension.id].sinIa} onChange={(evento) => cambiar(dimension.id, 'sinIa', evento.target.value)} /></label>
        </div>
      ))}
      <div className="d13__fila">
        <button className="acceso__boton acceso__boton--principal" disabled={!valido || guardando}>{guardando ? 'Guardando…' : 'Guardar diagnóstico'}</button>
        <button type="button" className="acceso__boton" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export function D2DiagnosticoReal() {
  const { curso } = useCurso();
  const [dimensiones, setDimensiones] = useState<DimensionCurso[]>([]);
  const [estudiantes, setEstudiantes] = useState<PersonaCurso[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<Map<string, Diagnostico[]>>(new Map());
  const [guardada, setGuardada] = useState<RutaCurso | null>(null);
  const [elegida, setElegida] = useState<RutaCurso | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  const cargar = useCallback(async () => {
    if (!curso) return;
    try {
      const [dims, personas, mapa, ruta] = await Promise.all([dimensionesDelCurso(curso.id), servicioPersonas.cargar(curso.id), diagnosticosDelCurso(curso.id), rutaGuardada(curso.id)]);
      setDimensiones(dims);
      setEstudiantes(personas.personas.filter((persona) => persona.rol === 'estudiante'));
      setDiagnosticos(mapa);
      setGuardada(ruta);
      setElegida((actual) => actual ?? ruta);
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [curso]);

  useEffect(() => { void cargar(); }, [cargar]);

  const dimensionDatos = dimensiones.find((dimension) => dimension.nombre.toLowerCase() === 'datos');
  const valorDatos = (persona: PersonaCurso) => {
    const fila = diagnosticos.get(persona.id)?.find((candidata) => candidata.dimensionId === dimensionDatos?.id);
    return fila ? fila.sinIa ?? fila.conIa : null;
  };
  const conRegistro = estudiantes.filter((persona) => valorDatos(persona) !== null);
  const enNivel = conRegistro.filter((persona) => (valorDatos(persona) ?? 0) >= UMBRAL_NIVELACION).length;
  const porcentaje = conRegistro.length > 0 ? Math.round((enNivel / conRegistro.length) * 100) : 0;
  const propuesta = rutaPropuestaDelCurso(porcentaje);
  const ruta = elegida ?? propuesta;
  const cuenta = (clave: RutaCurso) => conRegistro.filter((persona) => rutaDeEstudiante(valorDatos(persona)) === clave).length;

  const confirmar = async () => {
    if (!curso) return;
    setAviso(await confirmarRuta(curso.id, ruta));
    await cargar();
  };

  const guardarDiagnostico = async (persona: PersonaCurso, entrada: Entrada) => {
    if (!curso) return;
    const error = await registrarDiagnostico(curso.id, persona.id, dimensiones.map((dimension) => ({ dimensionId: dimension.id, conIa: numeroOCero(entrada[dimension.id].conIa), sinIa: numeroOCero(entrada[dimension.id].sinIa) })));
    setAviso(error);
    if (!error) setEditandoId(null);
    await cargar();
  };

  const brecha = dimensiones.map((dimension) => {
    const filas = [...diagnosticos.values()].flat().filter((fila) => fila.dimensionId === dimension.id && fila.conIa !== null && fila.sinIa !== null);
    const media = (campo: 'conIa' | 'sinIa') => (filas.length ? Math.round(filas.reduce((total, fila) => total + (fila[campo] ?? 0), 0) / filas.length) : 0);
    return { nombre: dimension.nombre, conIa: media('conIa'), sinIa: media('sinIa'), n: filas.length };
  }).filter((fila) => fila.n > 0);

  return (
    <Pantalla rol="docente" clase="p-d2">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Forma A · semana 1" titulo="Diagnóstico y rutas" subtitulo="La ruta del curso sale de cuántos llegan con Datos." objeto="brujula" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar el diagnóstico. <button onClick={() => void cargar()}>Reintentar</button></p>}
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {dimensiones.length === 0 && !fallo && <Tarjeta kicker="Primer paso" titulo="Define las dimensiones"><p className="meta">Cárgalas en Rúbricas para poder registrar el diagnóstico.</p></Tarjeta>}
          {dimensiones.length > 0 && (
            <div className="d2__columnas">
              <Tarjeta kicker="Datos de entrada" titulo={conRegistro.length ? `${porcentaje} % llega a ${UMBRAL_NIVELACION} o más` : 'Aún sin resultados'} accion={<Estado tipo="info">Umbrales provisionales</Estado>}>
                <p className="meta">{dimensionDatos ? `Entre 50 % y 80 % de estudiantes en ${UMBRAL_NIVELACION} o más en Datos, el curso sigue el plan estándar.` : 'Necesitas una dimensión llamada «Datos» para proponer la ruta.'}</p>
                <div className="d2__rutas" role="radiogroup" aria-label="Ruta del curso">
                  {RUTAS.map((opcion) => (
                    <button key={opcion.clave} role="radio" aria-checked={ruta === opcion.clave} className="d2__ruta" onClick={() => setElegida(opcion.clave)}>
                      <strong>{opcion.nombre}</strong>
                      <small>{opcion.clave === propuesta && conRegistro.length > 0 ? 'Propuesta' : 'Alternativa'}</small>
                    </button>
                  ))}
                </div>
                <div className="acciones">
                  <button className="boton boton--accent" onClick={() => void confirmar()} disabled={guardada === ruta}>{guardada === ruta ? 'Ruta confirmada' : `Confirmar ruta ${RUTAS.find((opcion) => opcion.clave === ruta)?.nombre.toLowerCase()}`}</button>
                  {guardada === ruta && <Estado tipo="ok">Guardada para el curso</Estado>}
                </div>
              </Tarjeta>
              <Tarjeta kicker="Por estudiante" titulo="Ruta individual">
                <div className="rejilla rejilla--3">
                  {RUTAS.map((opcion) => <div className="dato" key={opcion.clave}><span className="num">{cuenta(opcion.clave)}</span><strong>{opcion.nombre}</strong></div>)}
                </div>
                <p className="meta">Cada estudiante recibe los ejercicios en Base, Estándar o Reto según su resultado en Datos, aunque la ruta del curso sea otra.</p>
                <ul className="d13__personas">
                  {estudiantes.map((persona) => (
                    <li key={persona.id}>
                      {editandoId === persona.id ? (
                        <EditorDiagnostico persona={persona} dimensiones={dimensiones} filas={diagnosticos.get(persona.id) ?? []} alGuardar={(entrada) => guardarDiagnostico(persona, entrada)} alCancelar={() => setEditandoId(null)} />
                      ) : (
                        <>
                          <span className="d13__datos"><strong>{persona.nombre ?? persona.correo}</strong><small>{valorDatos(persona) === null ? 'Sin resultado' : `Datos ${Math.round(valorDatos(persona) ?? 0)} · ${RUTAS.find((opcion) => opcion.clave === rutaDeEstudiante(valorDatos(persona)))?.nombre}`}</small></span>
                          <button className="cursos__secundaria" onClick={() => setEditandoId(persona.id)}>{diagnosticos.has(persona.id) ? 'Editar' : 'Registrar'}</button>
                        </>
                      )}
                    </li>
                  ))}
                  {estudiantes.length === 0 && <li><span className="d13__datos"><small>Aún no hay estudiantes en el curso.</small></span></li>}
                </ul>
              </Tarjeta>
              {brecha.length > 0 && (
                <Tarjeta kicker="Con IA frente a sin IA" titulo="Brecha por dimensión" clase="d2__brecha">
                  {brecha.map((fila) => (
                    <div className="d2__fila" key={fila.nombre}>
                      <BarraDato etiqueta={fila.nombre} valor={fila.conIa} sufijo="" tono="azul" />
                      <BarraDato etiqueta="sin IA" valor={fila.sinIa} sufijo={` −${fila.conIa - fila.sinIa}`} tono={fila.conIa - fila.sinIa > 15 ? 'alerta' : undefined} />
                    </div>
                  ))}
                </Tarjeta>
              )}
            </div>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
