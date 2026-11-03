import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { BarraDato, Estado, Tarjeta } from '../componentes/panel';
import { Pantalla, Segmentado } from '../componentes/ui';
import { listarFormularios, resultadosFormulario, type Formulario, type Resultados, type TipoFormulario } from '../servicios/formularios';

const TIPOS: TipoFormulario[] = ['encuesta', 'votacion', 'relampago'];
const ETIQUETAS = ['Encuestas', 'Votaciones', 'Relámpagos'];
const LETRAS = 'ABCDEFGH';

const promedioEscala = (conteos: Record<string, number>) => {
  const total = Object.values(conteos).reduce((suma, cantidad) => suma + cantidad, 0);
  return total === 0 ? 0 : Object.entries(conteos).reduce((suma, [valor, cantidad]) => suma + Number(valor) * cantidad, 0) / total;
};

const aCsv = (formulario: Formulario, resultados: Resultados) => {
  const celda = (valor: string | number) => `"${String(valor).replace(/"/g, '""')}"`;
  const filas = [['pregunta', 'respuesta', 'cantidad'].map(celda).join(',')];
  resultados.preguntas.forEach((pregunta) => {
    if (pregunta.tipo === 'texto') pregunta.textos.forEach((texto) => filas.push([pregunta.enunciado, texto, 1].map(celda).join(',')));
    else Object.entries(pregunta.conteos).forEach(([clave, cantidad]) => filas.push([pregunta.enunciado, pregunta.tipo === 'opcion' ? pregunta.opciones[Number(clave)] ?? clave : clave, cantidad].map(celda).join(',')));
  });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(new Blob([`﻿${filas.join('\n')}`], { type: 'text/csv;charset=utf-8' }));
  enlace.download = `${formulario.titulo.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'resultados'}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
};

export function D12ResultadosReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [vista, setVista] = useState(0);
  const [formularios, setFormularios] = useState<Formulario[] | null>(null);
  const [resultados, setResultados] = useState<Record<string, Resultados>>({});
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    listarFormularios(curso.id).then(async (lista) => {
      const conRespuestas = lista.filter((formulario) => formulario.estado !== 'borrador');
      setFormularios(lista);
      const pares = await Promise.all(conRespuestas.map((formulario) => resultadosFormulario(formulario.id).then((datos) => [formulario.id, datos] as const).catch(() => null)));
      setResultados(Object.fromEntries(pares.filter((par): par is readonly [string, Resultados] => par !== null)));
    }).catch(() => setFallo(true));
  }, [curso]);

  const delTipo = (formularios ?? []).filter((formulario) => formulario.tipo === TIPOS[vista] && formulario.estado !== 'borrador');
  const exportable = delTipo.find((formulario) => resultados[formulario.id]);

  return (
    <Pantalla rol="docente" clase="p-d12">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Formularios', ruta: rutaCurso('#/d5') ?? '#/d5' }} kicker="Histórico del curso" titulo="Resultados" subtitulo="Lo que respondió el grupo, formulario a formulario." objeto="carta" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar los resultados. Intenta de nuevo en un momento.</p>}
          <Segmentado opciones={ETIQUETAS} activa={vista} alCambiar={setVista} />
          <div className="d5__columnas" key={vista}>
            {formularios && delTipo.length === 0 && <Tarjeta kicker="Por ahora" titulo="Sin resultados"><p className="meta">Todavía no hay {ETIQUETAS[vista].toLowerCase()} abiertas ni cerradas. Créalas en <a href={rutaCurso('#/d5') ?? '#/d5'}><u>Formularios</u></a>.</p></Tarjeta>}
            {delTipo.map((formulario) => {
              const datos = resultados[formulario.id];
              return (
                <Tarjeta key={formulario.id} kicker={`${formulario.anonimo ? 'Anónima · ' : ''}${datos?.total ?? formulario.participantes} respuestas`} titulo={formulario.titulo} accion={<Estado tipo={formulario.estado === 'abierto' ? 'ok' : 'pendiente'}>{formulario.estado === 'abierto' ? 'Abierto' : 'Cerrado'}</Estado>}>
                  {!datos && <p className="meta">Cargando…</p>}
                  {datos?.preguntas.map((pregunta) => {
                    if (pregunta.tipo === 'texto') return <div key={pregunta.preguntaId}><strong>{pregunta.enunciado}</strong>{pregunta.textos.length === 0 ? <p className="meta">Sin comentarios.</p> : <ul className="resultados__textos">{pregunta.textos.map((texto, indice) => <li key={indice}>{texto}</li>)}</ul>}</div>;
                    if (pregunta.tipo === 'escala') return <BarraDato key={pregunta.preguntaId} etiqueta={pregunta.enunciado} valor={Math.round(promedioEscala(pregunta.conteos) * 10) / 10} maximo={5} sufijo=" / 5" />;
                    const total = Object.values(pregunta.conteos).reduce((suma, cantidad) => suma + cantidad, 0);
                    return (
                      <div key={pregunta.preguntaId} className="resultados__pregunta">
                        <strong>{pregunta.enunciado}</strong>
                        {formulario.tipo === 'relampago' && pregunta.correcta !== null && total > 0 && <small className="meta">{Math.round(((pregunta.conteos[String(pregunta.correcta)] ?? 0) / total) * 100)} % acertó</small>}
                        {pregunta.opciones.map((opcion, indice) => {
                          const cantidad = pregunta.conteos[String(indice)] ?? 0;
                          return <BarraDato key={opcion} etiqueta={`${LETRAS[indice]} · ${opcion}${pregunta.correcta === indice ? ' ✓' : ''}`} valor={total ? Math.round((cantidad / total) * 100) : 0} tono={pregunta.correcta !== null && pregunta.correcta !== indice ? 'azul' : undefined} />;
                        })}
                      </div>
                    );
                  })}
                  {datos && <button className="cursos__secundaria" onClick={() => aCsv(formulario, datos)}>Exportar a CSV</button>}
                </Tarjeta>
              );
            })}
          </div>
        </div>
      </div>
      <Dock accion={exportable && resultados[exportable.id] ? { etiqueta: 'Histórico', texto: 'Exportar el más reciente', alPulsar: () => aCsv(exportable, resultados[exportable.id]) } : undefined} />
    </Pantalla>
  );
}
