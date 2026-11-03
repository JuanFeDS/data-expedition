import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { Radar } from '../../../../compartido/ui/Radar';
import { Kicker, Pantalla, Segmentado } from '../../../../compartido/ui/ui';
import { dimensiones, temaDeRepaso } from '../../../datos';

export function E2RadarEjemplo() {
  const porCambio = [...dimensiones].sort((a, b) => b.ahora - b.inicio - (a.ahora - a.inicio));
  const repaso = temaDeRepaso().gema.dimension;
  const subieron = dimensiones.filter((dimension) => dimension.ahora > dimension.inicio).length;
  return (
    <Pantalla clase="p-e2">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Tu radar" titulo="Cómo vas" subtitulo="Frente a tu punto de partida, no frente a nadie más." objeto="brujula">
          <p className="radar__resumen"><strong>{subieron} de {dimensiones.length}</strong> dimensiones subieron</p>
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo" style={{ gap: 10 }}>
          <Segmentado opciones={['Ahora', 'Inicio', 'Ambos']} activa={2} />
          <div className="radar__marco">
            <Radar dimensiones={dimensiones} ancho={342} alto={300} radio={100} />
          </div>
          <div className="radar__leyenda"><span><i className="ahora" />Ahora</span><span><i className="inicio" />Tu punto de partida</span></div>
          <Kicker>Cambio por dimensión</Kicker>
          {porCambio.map((dimension, indice) => {
            const cambio = dimension.ahora - dimension.inicio;
            return (
              <div className="cambio" key={dimension.nombre} style={{ '--i': indice } as React.CSSProperties}>
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
      <Dock accion={{ etiqueta: 'Para repasar', texto: `Practicar ${repaso}`, ruta: '#/e15' }} />
    </Pantalla>
  );
}

