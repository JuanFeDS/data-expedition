import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { CodigoQR } from '../../../../compartido/ui/CodigoQR';
import { Dock } from '../../../../compartido/ui/Dock';
import { Estado, Tarjeta } from '../../../../compartido/ui/panel';
import { Selector } from '../../../../compartido/ui/Selector';
import { Pantalla } from '../../../../compartido/ui/ui';
import { SEGUNDOS_CODIGO_ASISTENCIA } from '../../../../dominio/reglas';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ESPERA_LLEGADA_MS = 2600;
const SIN_MARCA = '__sin';

const OPCIONES = [
  { valor: SIN_MARCA, etiqueta: 'Sin registrar' },
  { valor: 'presente', etiqueta: 'Presente' },
  { valor: 'ausente', etiqueta: 'Ausente' },
  { valor: 'justificado', etiqueta: 'Justificado' },
];
const TIPO_ESTADO = { presente: 'ok', ausente: 'alerta', justificado: 'info' } as const;
const ETIQUETA_ESTADO = { presente: 'Presente', ausente: 'Ausente', justificado: 'Justificado' } as const;

const ESTUDIANTES = ['Camilo Restrepo', 'Paula Vargas', 'Andrés Cano', 'Laura Gómez', 'Julián Arias', 'Sofía Mejía', 'Mateo Ríos', 'Valentina Ospina'];
const LLEGAN_CON_EL_CODIGO = [3, 6, 1, 4, 2, 5];

type EstadoAsistenciaDemo = keyof typeof TIPO_ESTADO;
interface Registro { estado: EstadoAsistenciaDemo; origen: 'codigo' | 'mano'; hora: string }

const codigoNuevo = () => Array.from({ length: 6 }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');
const horaAhora = () => new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });

export function D16Ejemplo() {
  const [abierta, setAbierta] = useState(true);
  const [codigo, setCodigo] = useState(codigoNuevo);
  const [restante, setRestante] = useState(SEGUNDOS_CODIGO_ASISTENCIA);
  const [registros, setRegistros] = useState<Map<number, Registro>>(() => new Map([[0, { estado: 'presente', origen: 'codigo', hora: horaAhora() }]]));
  const [llegadas, setLlegadas] = useState(0);

  useEffect(() => {
    if (!abierta) return undefined;
    const reloj = window.setInterval(() => setRestante((actual) => actual - 1), 1000);
    return () => window.clearInterval(reloj);
  }, [abierta]);

  useEffect(() => {
    if (restante > 0) return;
    setCodigo(codigoNuevo());
    setRestante(SEGUNDOS_CODIGO_ASISTENCIA);
  }, [restante]);

  useEffect(() => {
    if (!abierta || llegadas >= LLEGAN_CON_EL_CODIGO.length) return undefined;
    const espera = window.setTimeout(() => {
      setRegistros((previos) => new Map(previos).set(LLEGAN_CON_EL_CODIGO[llegadas], { estado: 'presente', origen: 'codigo', hora: horaAhora() }));
      setLlegadas((actual) => actual + 1);
    }, ESPERA_LLEGADA_MS);
    return () => window.clearTimeout(espera);
  }, [abierta, llegadas]);

  const marcar = (indice: number, valor: string) => setRegistros((previos) => {
    const siguientes = new Map(previos);
    if (valor === SIN_MARCA) siguientes.delete(indice);
    else siguientes.set(indice, { estado: valor as EstadoAsistenciaDemo, origen: 'mano', hora: horaAhora() });
    return siguientes;
  });

  const presentes = [...registros.values()].filter((registro) => registro.estado === 'presente').length;

  return (
    <Pantalla rol="docente" clase="p-d16">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="S8 · Hoy" titulo="Asistencia" subtitulo="Proyecta el código: cambia cada 20 segundos y solo vale con la sesión de cada estudiante." objeto="mapa" />
        <div className="contenido cuerpo-mundo panel">
          <div className="asist__columnas">
            <div className="asist__lado">
              <Tarjeta kicker="Sesión" titulo="¿De qué clase?">
                <Selector valor="s8" opciones={[{ valor: 's8', etiqueta: 'S8 · PySpark SQL' }]} alCambiar={() => undefined} etiqueta="Sesión" />
              </Tarjeta>
              {abierta ? (
                <Tarjeta tono="oscura" kicker="Abierta ahora" titulo="Escanea o escribe el código" accion={<Estado tipo="ok">En vivo</Estado>}>
                  <div className="asist__proyeccion">
                    <CodigoQR valor={`Data Expedition · demo · código ${codigo}`} etiqueta="Código QR para registrar asistencia" />
                    <div className="asist__codigo">
                      <strong aria-live="off">{codigo}</strong>
                      <div className="asist__tiempo" role="progressbar" aria-valuenow={restante} aria-valuemax={SEGUNDOS_CODIGO_ASISTENCIA} aria-label="Segundos para que cambie el código"><i style={{ width: `${(restante / SEGUNDOS_CODIGO_ASISTENCIA) * 100}%` }} /></div>
                      <small>Cambia en {restante} s</small>
                    </div>
                  </div>
                  <button className="boton boton--accent" onClick={() => setAbierta(false)}>Cerrar asistencia</button>
                </Tarjeta>
              ) : (
                <Tarjeta tono="menta" kicker="Cerrada" titulo="Abre la asistencia al empezar la clase">
                  <p className="meta">Se genera un QR y un código de 6 caracteres que rotan. Los estudiantes lo leen con su sesión iniciada: nadie puede reenviar una captura.</p>
                  <div className="acciones"><button className="boton boton--accent" onClick={() => { setCodigo(codigoNuevo()); setRestante(SEGUNDOS_CODIGO_ASISTENCIA); setAbierta(true); }}>Reabrir asistencia</button></div>
                </Tarjeta>
              )}
            </div>
            <Tarjeta kicker={`${presentes} de ${ESTUDIANTES.length} presentes`} titulo="Quién está">
              <div className="asist__barra" role="progressbar" aria-valuenow={presentes} aria-valuemax={ESTUDIANTES.length}><i style={{ width: `${(presentes / ESTUDIANTES.length) * 100}%` }} /></div>
              <ul className="d13__personas">
                {ESTUDIANTES.map((nombre, indice) => {
                  const registro = registros.get(indice);
                  return (
                    <li key={nombre}>
                      <span className="avatar avatar--verde">{nombre.slice(0, 2).toUpperCase()}</span>
                      <span className="d13__datos"><strong>{nombre}</strong><small>{registro ? `${registro.origen === 'codigo' ? 'Con el código' : 'A mano'} · ${registro.hora}` : 'Sin registrar'}</small></span>
                      {registro && <Estado tipo={TIPO_ESTADO[registro.estado]}>{ETIQUETA_ESTADO[registro.estado]}</Estado>}
                      <Selector valor={registro?.estado ?? SIN_MARCA} opciones={OPCIONES} alCambiar={(valor) => marcar(indice, valor)} etiqueta={`Asistencia de ${nombre}`} />
                    </li>
                  );
                })}
              </ul>
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
