import { Jaguar } from '../componentes/Jaguar';
import { Contador, Kicker, Pantalla, Pill } from '../componentes/ui';
import { temaDeRepaso } from '../datos';

const tema = temaDeRepaso();

const METRICAS = [
  { valor: 30, decimales: 0, etiqueta: 'XP', detalle: 'Por esta lección. El XP no es nota.' },
  { valor: 1.5, decimales: 1, etiqueta: tema.gema.dimension, gema: tema.gema.gema, detalle: 'Práctica verificada ligera · tope de 5 por semana (te quedan 3.5)' },
];

export function E8ResultadoLeccion() {
  return (
    <Pantalla tono="menta" clase="p-e8">
      <div className="pantalla__cuerpo contenido" style={{ padding: '80px 24px 24px', gap: 12 }}>
        <Kicker estilo={{ color: 'var(--deep)' }}>Correcto</Kicker>
        <h1 className="titulo" style={{ fontSize: 46, lineHeight: 1, color: 'var(--deep)' }}>Buen ojo: lo que no se reproduce no se entrega.</h1>
        <div className="resultado__remate">
          <p style={{ fontSize: 15, fontWeight: 600, lineHeight: '21px', color: 'var(--deep)' }}>Si otra persona no puede correr tu trabajo, nadie puede confiar en él. Fija las versiones y prueba el cuaderno de principio a fin antes de entregar.</p>
          <Jaguar pose="celebra" ancho={136} clase="resultado__guia" />
        </div>
        <hr className="sep" style={{ background: 'var(--deep)' }} />
        {METRICAS.map((metrica) => (
          <div className="metrica" key={metrica.etiqueta}>
            <span className="num"><Contador valor={metrica.valor} decimales={metrica.decimales} prefijo="+" /></span>
            <div><strong style={{ fontSize: 14, fontWeight: 800, display: 'block' }}>{metrica.etiqueta}</strong><span style={{ fontSize: 12, fontWeight: 600, opacity: .8 }}>{metrica.detalle}</span></div>
            {'gema' in metrica && <img className="metrica__gema" src={`${import.meta.env.BASE_URL}gemas/${metrica.gema}.webp`} alt="" />}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <a href="#/e15"><Pill variante="deep" grande>Ver mi álbum</Pill></a>
      </div>
    </Pantalla>
  );
}
