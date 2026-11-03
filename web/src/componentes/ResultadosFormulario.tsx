import { useEffect, useState } from 'react';
import { resultadosFormulario, type Resultados } from '../servicios/formularios';
import { BarraDato } from './panel';

const LETRAS = 'ABCDEFGH';

export function useResultados(formularioId: string | null, vivo: boolean) {
  const [resultados, setResultados] = useState<Resultados | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!formularioId) { setResultados(null); return undefined; }
    let activo = true;
    const cargar = () => resultadosFormulario(formularioId)
      .then((nuevos) => { if (activo) { setResultados(nuevos); setFallo(false); } })
      .catch(() => { if (activo) setFallo(true); });
    void cargar();
    if (!vivo) return () => { activo = false; };
    const reloj = window.setInterval(cargar, 3000);
    return () => { activo = false; window.clearInterval(reloj); };
  }, [formularioId, vivo]);

  return { resultados, fallo };
}

export function ResultadosFormulario({ resultados, fallo }: { resultados: Resultados | null; fallo: boolean }) {
  if (fallo) return <p className="meta">El resultado aún no está disponible.</p>;
  if (!resultados) return <p className="meta">Cargando resultados…</p>;
  return (
    <div className="resultados">
      <p className="meta">{resultados.total} {resultados.total === 1 ? 'respuesta' : 'respuestas'}</p>
      {resultados.preguntas.map((pregunta) => {
        const claves = pregunta.tipo === 'opcion' ? pregunta.opciones.map((_, indice) => String(indice)) : pregunta.tipo === 'escala' ? ['1', '2', '3', '4', '5'] : [];
        const maximo = Math.max(1, ...claves.map((clave) => pregunta.conteos[clave] ?? 0));
        return (
          <div className="resultados__pregunta" key={pregunta.preguntaId}>
            <strong>{pregunta.enunciado}</strong>
            {claves.map((clave) => {
              const cantidad = pregunta.conteos[clave] ?? 0;
              const etiqueta = pregunta.tipo === 'opcion' ? `${LETRAS[Number(clave)]} · ${pregunta.opciones[Number(clave)]}${pregunta.correcta === Number(clave) ? ' ✓' : ''}` : `${clave} de 5`;
              return <BarraDato key={clave} etiqueta={`${etiqueta} (${cantidad})`} valor={cantidad} maximo={maximo} sufijo="" tono={pregunta.correcta !== null && pregunta.correcta !== Number(clave) ? 'azul' : undefined} />;
            })}
            {pregunta.textos.length > 0 && (
              <ul className="resultados__textos">{pregunta.textos.map((texto, indice) => <li key={indice}>{texto}</li>)}</ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
