import { Radar } from '../componentes/Radar';
import { Cabecera, Kicker, Pantalla, Segmentado, TabBar } from '../componentes/ui';
import { dimensiones } from '../datos';

export function E2Radar() {
  const porCambio = [...dimensiones].sort((a, b) => b.ahora - b.inicio - (a.ahora - a.inicio));
  return (
    <Pantalla>
      <div className="pantalla__cuerpo">
        <Cabecera titulo="Tu radar" subtitulo="Frente a tu punto de partida, no frente a nadie más." />
        <div className="contenido" style={{ gap: 10 }}>
          <Segmentado opciones={['Ahora', 'Inicio', 'Ambos']} activa={2} />
          <Radar dimensiones={dimensiones} />
          <Kicker>Cambio por dimensión</Kicker>
          {porCambio.map((dimension) => {
            const cambio = dimension.ahora - dimension.inicio;
            return (
              <div className="cambio" key={dimension.nombre}>
                <span className="cambio__nombre">{dimension.nombre}</span>
                <div className="barra" aria-hidden="true">
                  <div className="barra__pista" />
                  <div className="barra__relleno" style={{ width: `${dimension.ahora}%` }} />
                  <div className="barra__inicio" style={{ left: `${dimension.inicio}%` }} />
                </div>
                <span className={`cambio__delta ${cambio === 0 ? 'cambio__delta--cero' : ''}`}>{cambio === 0 ? '0' : `+${cambio}`}</span>
              </div>
            );
          })}
        </div>
      </div>
      <TabBar activa="Radar" />
    </Pantalla>
  );
}
