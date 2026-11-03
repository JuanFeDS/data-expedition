import { Kicker, Pantalla, Pill } from '../../../compartido/ui/ui';

const RESULTADOS = [
  { letra: 'A', texto: 'Exactitud', porcentaje: 12, correcta: false },
  { letra: 'B', texto: 'Precisión y sensibilidad', porcentaje: 68, correcta: true },
  { letra: 'C', texto: 'R²', porcentaje: 6, correcta: false },
  { letra: 'D', texto: 'Error cuadrático', porcentaje: 14, correcta: false },
];

export function E13VotacionVivo() {
  return (
    <Pantalla tono="oscura" clase="p-e13">
      <div className="pantalla__cuerpo contenido centrar" style={{ padding: '56px 24px 24px', gap: 12 }}>
        <Kicker estilo={{ color: 'var(--mint)' }}>En vivo · Validación</Kicker>
        <h1 className="titulo" style={{ fontSize: 'var(--fs-2xl)', lineHeight: 1.08 }}>¿Qué métrica mirarías primero con clases desbalanceadas?</h1>
        {RESULTADOS.map((resultado, indice) => (
          <div className="vivo__opcion" key={resultado.letra} style={{ '--i': indice } as React.CSSProperties}>
            <div className="vivo__fila">
              <strong>{resultado.letra} · {resultado.texto}</strong>
              {resultado.correcta && <Pill variante="accent" pequena>Correcta</Pill>}
              <span style={{ marginLeft: 'auto', fontWeight: 800 }}>{resultado.porcentaje} %</span>
            </div>
            <div className="vivo__barra"><i className={resultado.correcta ? 'vivo__barra--correcta' : ''} style={{ width: `${Math.max(2, resultado.porcentaje)}%` }} /></div>
          </div>
        ))}
        <div className="vivo__pie">
          <img src={`${import.meta.env.BASE_URL}objetos/binoculares.webp`} alt="" />
          <p>Mira cómo vota el grupo: todo agregado, sin nombres.</p>
        </div>
        <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, opacity: .65 }}>22 respuestas · lo ves agregado, sin nombres. El docente decide cuándo cerrar.</p>
      </div>
    </Pantalla>
  );
}
