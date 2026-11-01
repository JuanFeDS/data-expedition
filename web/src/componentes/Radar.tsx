import type { DimensionRadar } from '../datos';

interface PropsRadar {
  dimensiones: DimensionRadar[];
  ancho?: number;
  alto?: number;
  radio?: number;
}

export function Radar({ dimensiones, ancho = 342, alto = 262, radio = 84 }: PropsRadar) {
  const centroX = ancho / 2;
  const centroY = alto / 2;
  const total = dimensiones.length;
  const angulo = (indice: number) => -Math.PI / 2 + (indice * 2 * Math.PI) / total;
  const punto = (indice: number, valor: number, radioBase = radio) => [
    centroX + Math.cos(angulo(indice)) * radioBase * (valor / 100),
    centroY + Math.sin(angulo(indice)) * radioBase * (valor / 100),
  ];
  const poligono = (valores: number[]) => valores.map((valor, indice) => punto(indice, valor).map((n) => n.toFixed(1)).join(',')).join(' ');
  const porcentajeX = (x: number) => `${(x / ancho) * 100}%`;
  const porcentajeY = (y: number) => `${(y / alto) * 100}%`;

  return (
    <div className="radar" style={{ width: '100%', maxWidth: ancho, aspectRatio: `${ancho} / ${alto}` }} role="img" aria-label="Radar de habilidades: ahora frente al punto de partida">
      <svg width="100%" height="100%" viewBox={`0 0 ${ancho} ${alto}`} fill="none">
        {[25, 50, 75, 100].map((nivel) => (
          <polygon key={nivel} points={poligono(dimensiones.map(() => nivel))} stroke="var(--line)" />
        ))}
        {dimensiones.map((_, indice) => {
          const [x, y] = punto(indice, 100);
          return <line key={indice} x1={centroX} y1={centroY} x2={x} y2={y} stroke="var(--line)" />;
        })}
        <polygon className="radar__ahora" points={poligono(dimensiones.map((d) => d.ahora))} fill="var(--primary)" fillOpacity=".22" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" />
        <polygon className="radar__inicio" points={poligono(dimensiones.map((d) => d.inicio))} stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 4" />
        {dimensiones.map((dimension, indice) => {
          const [x, y] = punto(indice, dimension.ahora);
          return <circle className="radar__punto" key={dimension.nombre} cx={x} cy={y} r="5" fill="#fff" stroke="var(--primary)" strokeWidth="3" />;
        })}
      </svg>
      {dimensiones.map((dimension, indice) => {
        const [x, y] = punto(indice, 100, radio + 13);
        const horizontal = Math.cos(angulo(indice));
        const ajusteY = (Math.sin(angulo(indice)) > 0.5 ? 4 : 0) + (indice === 0 ? -6 : 0);
        const estilo: React.CSSProperties = { top: porcentajeY(y + ajusteY) };
        if (horizontal < -0.2) Object.assign(estilo, { right: `${((ancho - x) / ancho) * 100}%`, textAlign: 'right' });
        else if (horizontal > 0.2) Object.assign(estilo, { left: porcentajeX(x), textAlign: 'left' });
        else Object.assign(estilo, { left: porcentajeX(x), transform: 'translate(-50%, -50%)', textAlign: 'center' });
        const partes = dimension.nombre === 'Dirección de IA' ? ['Dirección', 'de IA'] : [dimension.nombre];
        return (
          <span key={dimension.nombre} className="radar__etiqueta" style={estilo}>
            {partes.map((parte, i) => <span key={i}>{parte}{i < partes.length - 1 && <br />}</span>)}
          </span>
        );
      })}
    </div>
  );
}
