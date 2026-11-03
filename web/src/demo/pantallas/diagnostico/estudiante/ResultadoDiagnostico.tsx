import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { Estado, Tarjeta } from '../../../../compartido/ui/panel';
import { Radar } from '../../../../compartido/ui/Radar';
import { Kicker, Pantalla } from '../../../../compartido/ui/ui';
import { dimensionesDiagnostico } from '../../../datosPlan';

const AUTOINFORME: Record<string, number> = { Datos: 4, Análisis: 3, Modelado: 4, Validación: 3, Comunicación: 4, Producción: 2, 'Dirección de IA': 4 };

export function E19ResultadoDiagnostico() {
  const filas = dimensionesDiagnostico.map((dimension) => ({ ...dimension, brecha: dimension.conIA - dimension.sinIA, dijiste: AUTOINFORME[dimension.nombre] }));
  const mayor = [...filas].sort((a, b) => b.brecha - a.brecha)[0];
  const radar = dimensionesDiagnostico.map((dimension) => ({ nombre: dimension.nombre, inicio: dimension.conIA, ahora: dimension.sinIA }));

  return (
    <Pantalla clase="p-e19">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Diagnóstico', ruta: '#/e17' }} kicker="Forma A · semana 1" titulo="Tu radar de entrada" subtitulo="Con IA y sin IA, lado a lado." objeto="brujula" />
        <div className="contenido cuerpo-mundo panel">
          <div className="diag__resultado">
            <Tarjeta kicker="Radar" titulo="Lo que haces sin ayuda" accion={<Estado tipo="info">Sin IA es la línea sólida</Estado>} clase="diag__radar">
              <div className="radar__marco"><Radar dimensiones={radar} ancho={342} alto={300} radio={100} /></div>
              <div className="radar__leyenda"><span><i className="ahora" />Sin IA (verificado)</span><span><i className="inicio" />Con IA (tarea)</span></div>
            </Tarjeta>
            <div className="diag__lado">
              <Tarjeta tono="menta" kicker="La brecha" titulo={`${mayor.nombre}: ${mayor.brecha} puntos`}>
                <p className="meta">Es donde más te apoya la IA. No es malo: te dice qué conviene practicar sin ayuda.</p>
              </Tarjeta>
              <Tarjeta kicker="Lo que dijiste, frente a lo que hiciste" titulo="Autoinforme">
                <ul className="diag__auto">
                  {filas.slice(0, 5).map((fila) => {
                    const real = Math.round(fila.sinIA / 20 * 10) / 10;
                    return (
                      <li key={fila.nombre}>
                        <strong>{fila.nombre}</strong>
                        <span>dijiste {fila.dijiste} de 5</span>
                        <Estado tipo={Math.abs(fila.dijiste - real) <= 0.8 ? 'ok' : 'tarde'}>{real} real</Estado>
                      </li>
                    );
                  })}
                </ul>
              </Tarjeta>
              <Kicker>Se compara con la forma B en la semana 7</Kicker>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Tu punto de partida', texto: 'Ver mi ruta', ruta: '#/e24' }} />
    </Pantalla>
  );
}
