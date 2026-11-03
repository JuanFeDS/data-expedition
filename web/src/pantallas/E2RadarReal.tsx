import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Radar } from '../componentes/Radar';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Tarjeta } from '../componentes/panel';
import { Kicker, Pantalla } from '../componentes/ui';
import { miRadar, type PuntoRadar } from '../servicios/radar';

export function E2RadarReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [puntos, setPuntos] = useState<PuntoRadar[] | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    miRadar(curso.id).then(setPuntos).catch(() => setFallo(true));
  }, [curso]);

  const conDatos = puntos?.some((punto) => punto.tieneEvidencia) ?? false;
  const subieron = puntos?.filter((punto) => punto.tieneInicio && punto.ahora > punto.inicio).length ?? 0;
  const porCambio = [...(puntos ?? [])].sort((a, b) => b.ahora - b.inicio - (a.ahora - a.inicio));

  return (
    <Pantalla clase="p-e2">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker="Tu radar" titulo="Cómo vas" subtitulo="Frente a tu punto de partida, no frente a nadie más." objeto="brujula">
          {conDatos && <p className="radar__resumen"><strong>{subieron} de {puntos?.length}</strong> dimensiones subieron</p>}
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar tu radar. Intenta de nuevo en un momento.</p>}
          {puntos?.length === 0 && <Tarjeta kicker="Por ahora" titulo="Sin dimensiones"><p className="meta">Tu docente aún no define las dimensiones del curso.</p></Tarjeta>}
          {puntos && puntos.length > 0 && !conDatos && (
            <Tarjeta kicker="Por ahora" titulo="Tu radar se llena con tus notas">
              <p className="meta">Cuando tu docente califique tu primer trabajo y registre tu diagnóstico, verás aquí cómo avanzas en cada dimensión. Puedes empezar por tu <a href={rutaCurso('#/e17') ?? '#/e17'}><u>autoinforme</u></a>.</p>
            </Tarjeta>
          )}
          {conDatos && puntos && (
            <>
              <div className="radar__marco">
                <Radar dimensiones={puntos} ancho={342} alto={300} radio={100} />
              </div>
              <div className="radar__leyenda"><span><i className="ahora" />Ahora</span><span><i className="inicio" />Tu punto de partida</span></div>
              <Kicker>Cambio por dimensión</Kicker>
              {porCambio.map((dimension, indice) => {
                const cambio = dimension.ahora - dimension.inicio;
                return (
                  <div className="cambio" key={dimension.id} style={{ '--i': indice } as React.CSSProperties}>
                    <span className="cambio__nombre">{dimension.nombre}</span>
                    <div className="barra" aria-hidden="true">
                      <div className="barra__pista" />
                      <div className="barra__relleno" style={{ width: `${dimension.ahora}%` }} />
                      {dimension.tieneInicio && <div className="barra__inicio" style={{ left: `${dimension.inicio}%` }} />}
                    </div>
                    <span className={`cambio__delta ${cambio === 0 || !dimension.tieneInicio ? 'cambio__delta--cero' : ''}`}>{!dimension.tieneInicio ? '—' : cambio > 0 ? `+${cambio}` : String(cambio)}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Tu punto de partida', texto: 'Ver mi diagnóstico', ruta: rutaCurso('#/e17') ?? '#/e17' }} />
    </Pantalla>
  );
}
