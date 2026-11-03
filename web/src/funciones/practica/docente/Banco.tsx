import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { useConfirmar } from '../../../compartido/estado/confirmar';
import { useCurso } from '../../../compartido/estado/curso';
import { Estado, Tarjeta } from '../../../compartido/ui/panel';
import { useSesion } from '../../../compartido/estado/sesion';
import { Pantalla } from '../../../compartido/ui/ui';
import { alternarPregunta, eliminarPregunta, importarBanco, leerBanco, listarBanco, NOMBRE_DIFICULTAD, type FilaBanco, type ResultadoImportacion } from '../../../servicios/practica';
import { dimensionesDelCurso, type DimensionCurso } from '../../../servicios/radar';

const EJEMPLO = `[
  {
    "dimension": "Validación",
    "dificultad": "estandar",
    "tipo": "opciones",
    "enunciado": "Un modelo acierta el 98 % pero solo el 2 % de los casos son positivos. ¿Qué concluyes?",
    "opciones": ["Es excelente.", "La exactitud no basta: compáralo con un baseline.", "Hay que subir el umbral."],
    "correcta": 1,
    "explicacion": "Con clases muy desbalanceadas, siempre decir «negativo» ya acierta 98 %."
  }
]`;

function D15BancoReal() {
  const { curso } = useCurso();
  const confirmar = useConfirmar();
  const [dimensiones, setDimensiones] = useState<DimensionCurso[]>([]);
  const [banco, setBanco] = useState<FilaBanco[] | null>(null);
  const [texto, setTexto] = useState('');
  const [revision, setRevision] = useState<ResultadoImportacion | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);
  const [importando, setImportando] = useState(false);

  const cargar = useCallback(async () => {
    if (!curso) return;
    try {
      const [dims, filas] = await Promise.all([dimensionesDelCurso(curso.id), listarBanco(curso.id)]);
      setDimensiones(dims);
      setBanco(filas);
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [curso]);

  useEffect(() => { void cargar(); }, [cargar]);

  const revisar = () => setRevision(leerBanco(texto, dimensiones));

  const alSubir = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    const contenido = await archivo.text();
    setTexto(contenido);
    setRevision(leerBanco(contenido, dimensiones));
    evento.target.value = '';
  };

  const importar = async () => {
    if (!curso || !revision || revision.filas.length === 0) return;
    setImportando(true);
    const error = await importarBanco(curso.id, revision.filas);
    setImportando(false);
    setAviso(error);
    if (!error) { setTexto(''); setRevision(null); }
    await cargar();
  };

  const alternar = async (fila: FilaBanco) => {
    setAviso(await alternarPregunta(fila.id, !fila.activa));
    await cargar();
  };

  const quitar = async (fila: FilaBanco) => {
    const aceptado = await confirmar({ titulo: '¿Quitar la pregunta?', texto: 'Se borra del banco. Si ya tiene respuestas, mejor desactívala.', confirmar: 'Quitar pregunta' });
    if (!aceptado) return;
    setAviso(await eliminarPregunta(fila.id));
    await cargar();
  };

  const nombreDe = (id: string) => dimensiones.find((dimension) => dimension.id === id)?.nombre ?? '—';

  return (
    <Pantalla rol="docente" clase="p-d15">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Práctica" titulo="Banco de preguntas" subtitulo="Lo que tus estudiantes practican, por dimensión y dificultad." objeto="cuaderno" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar el banco. <button onClick={() => void cargar()}>Reintentar</button></p>}
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {dimensiones.length === 0 && !fallo && <Tarjeta kicker="Primer paso" titulo="Define las dimensiones"><p className="meta">Cárgalas en Rúbricas: cada pregunta pertenece a una dimensión.</p></Tarjeta>}
          {dimensiones.length > 0 && (
            <div className="d5__columnas">
              <div className="d5__lado">
                <Tarjeta kicker="Importar" titulo="Pega o sube tus preguntas">
                  <p className="meta">JSON con una lista de preguntas (tipos: opciones, vf, unir, ordenar, completar) o CSV de opción múltiple con las columnas <code>dimension,dificultad,enunciado,a,b,c,d,correcta,explicacion</code>. Dimensiones del curso: {dimensiones.map((dimension) => dimension.nombre).join(', ')}.</p>
                  <textarea className="d13__campo rubrica__nivel banco__texto" rows={10} value={texto} onChange={(evento) => { setTexto(evento.target.value); setRevision(null); }} placeholder={EJEMPLO} aria-label="Preguntas en JSON o CSV" />
                  <div className="d13__fila">
                    <button className="acceso__boton acceso__boton--principal" disabled={texto.trim() === ''} onClick={revisar}>Revisar</button>
                    <label className="acceso__boton banco__subir">Subir archivo<input type="file" accept=".json,.csv,.txt" hidden onChange={(evento) => void alSubir(evento)} /></label>
                  </div>
                  {revision && (
                    <div className="banco__revision">
                      {revision.errores.length > 0 && <ul className="acceso__error">{revision.errores.slice(0, 8).map((error) => <li key={error}>{error}</li>)}{revision.errores.length > 8 && <li>… y {revision.errores.length - 8} más</li>}</ul>}
                      {revision.filas.length > 0 && (
                        <>
                          <Estado tipo="ok">{revision.filas.length} {revision.filas.length === 1 ? 'pregunta lista' : 'preguntas listas'} para importar</Estado>
                          <button className="acceso__boton acceso__boton--principal" disabled={importando} onClick={() => void importar()}>{importando ? 'Importando…' : `Importar ${revision.filas.length}`}</button>
                        </>
                      )}
                    </div>
                  )}
                </Tarjeta>
              </div>
              <div className="d5__lado">
                <Tarjeta kicker={`${banco?.length ?? 0} preguntas`} titulo="Banco del curso">
                  <ul className="d13__personas">
                    {banco?.map((fila) => (
                      <li key={fila.id}>
                        <span className="d13__datos"><strong>{fila.enunciado}</strong><small>{nombreDe(fila.dimensionId)} · {NOMBRE_DIFICULTAD[fila.dificultad]} · {fila.formato}</small></span>
                        <button className="estado-boton" onClick={() => void alternar(fila)} aria-label={fila.activa ? 'Desactivar' : 'Activar'}>{fila.activa ? <Estado tipo="ok">Activa</Estado> : <Estado tipo="pendiente">Inactiva</Estado>}</button>
                        <button className="d13__quitar" aria-label="Quitar pregunta" onClick={() => void quitar(fila)}>Quitar</button>
                      </li>
                    ))}
                    {banco?.length === 0 && <li><span className="d13__datos"><small>Aún no hay preguntas. Importa las primeras.</small></span></li>}
                  </ul>
                </Tarjeta>
              </div>
            </div>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}

export function D15Banco() {
  const { modoDemo } = useSesion();
  if (!modoDemo) return <D15BancoReal />;
  return (
    <Pantalla rol="docente" clase="p-d15">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Práctica" titulo="Banco de preguntas" subtitulo="Disponible en la versión con datos reales." objeto="cuaderno" />
      </div>
      <Dock />
    </Pantalla>
  );
}
