import { Kicker, Pantalla, Pill } from '../componentes/ui';

const METRICAS = [
  { valor: '+30', etiqueta: 'XP', detalle: 'Por esta lección. El XP no es nota.' },
  { valor: '+1.5', etiqueta: 'Validación', detalle: 'Práctica verificada ligera · tope de 5 por semana (te quedan 3.5)' },
];

export function E8ResultadoLeccion() {
  return (
    <Pantalla tono="menta">
      <div className="pantalla__cuerpo contenido" style={{ padding: '80px 24px 24px', gap: 12 }}>
        <Kicker estilo={{ color: 'var(--deep)' }}>Correcto</Kicker>
        <h1 className="titulo" style={{ fontSize: 46, lineHeight: 1, color: 'var(--deep)' }}>Buen ojo: la exactitud engaña.</h1>
        <p style={{ fontSize: 15, fontWeight: 600, lineHeight: '21px', color: 'var(--deep)' }}>Con clases muy desbalanceadas, un modelo que nunca predice la clase rara ya parece bueno. Mira precisión, sensibilidad y la matriz de confusión.</p>
        <hr className="sep" style={{ background: 'var(--deep)' }} />
        {METRICAS.map((metrica) => (
          <div className="metrica" key={metrica.etiqueta}>
            <span className="num">{metrica.valor}</span>
            <div><strong style={{ fontSize: 14, fontWeight: 800, display: 'block' }}>{metrica.etiqueta}</strong><span style={{ fontSize: 12, fontWeight: 600, opacity: .8 }}>{metrica.detalle}</span></div>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <a href="#/e1"><Pill variante="deep" grande>Siguiente</Pill></a>
      </div>
    </Pantalla>
  );
}
