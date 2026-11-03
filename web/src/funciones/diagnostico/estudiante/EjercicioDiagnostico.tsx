import { useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { Estado, Tarjeta } from '../../../compartido/ui/panel';
import { Kicker, Pantalla, Segmentado } from '../../../compartido/ui/ui';

const HERRAMIENTAS = ['Ninguna', 'Asistente de chat', 'Autocompletado en el editor', 'Buscador', 'Documentación'];

export function E18EjercicioDiagnostico() {
  const [modo, setModo] = useState(0);
  const [usadas, setUsadas] = useState<string[]>(['Asistente de chat']);
  const sinIA = modo === 1;

  const alternar = (herramienta: string) => setUsadas((actual) => (actual.includes(herramienta) ? actual.filter((item) => item !== herramienta) : [...actual, herramienta]));

  return (
    <Pantalla clase="p-e18">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Diagnóstico', ruta: '#/e17' }} kicker={`Forma A · ejercicio 3 de 6 · ${sinIA ? 'sin IA' : 'con IA permitida'}`} titulo="Ventas por región" subtitulo={sinIA ? 'Cámara encendida y sin asistentes. Tienes 20 minutos para todo el bloque.' : 'Usa lo que quieras y cuéntanos qué usaste.'} objeto="cuaderno" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={['Tarea con IA', 'Verificación sin IA']} activa={modo} alCambiar={setModo} />
          <div className="diag__ejercicio">
            <Tarjeta kicker="Enunciado · Datos" titulo="¿Qué región vendió más, y por cuánto?">
              <p className="meta">Tienes la tabla <b>ventas.csv</b> con las columnas <b>región</b>, <b>producto</b> y <b>monto</b>. Escribe los pasos con pandas y el resultado.</p>
              <table className="diag__tabla" aria-label="Vista previa de ventas.csv">
                <thead><tr><th>región</th><th>producto</th><th>monto</th></tr></thead>
                <tbody>
                  <tr><td>Caribe</td><td>A</td><td>1.240</td></tr>
                  <tr><td>Andina</td><td>B</td><td>980</td></tr>
                  <tr><td>Caribe</td><td>B</td><td>310</td></tr>
                  <tr><td>Pacífico</td><td>A</td><td>1.050</td></tr>
                </tbody>
              </table>
              <div className="campo"><label htmlFor="resp">Tu código y tu respuesta</label><textarea id="resp" rows={4} placeholder="df.groupby('región')['monto'].sum()…" /></div>
            </Tarjeta>
            <Tarjeta kicker={sinIA ? 'Verificación' : 'Declaración'} titulo={sinIA ? 'Modo sin IA' : '¿Qué usaste?'} accion={sinIA ? <Estado tipo="info">Cámara encendida</Estado> : <Estado tipo="ok">IA permitida</Estado>}>
              {sinIA ? (
                <>
                  <p className="meta">Compartes pantalla y resuelves en vivo. Nadie corrige en este momento: se guarda como evidencia aparte de la tarea con IA.</p>
                  <div className="diag__cronometro"><b>14:32</b><small>minutos restantes del bloque</small></div>
                </>
              ) : (
                <>
                  <Kicker>Marca todo lo que usaste</Kicker>
                  <div className="diag__chips">
                    {HERRAMIENTAS.map((herramienta) => (
                      <button key={herramienta} className="diag__chip" aria-pressed={usadas.includes(herramienta)} onClick={() => alternar(herramienta)}>{herramienta}</button>
                    ))}
                  </div>
                </>
              )}
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Ejercicio 3 de 6', texto: 'Guardar y seguir', ruta: '#/e19' }} />
    </Pantalla>
  );
}
