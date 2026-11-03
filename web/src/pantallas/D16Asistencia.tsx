import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Selector } from '../componentes/Selector';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Estado, Tarjeta } from '../componentes/panel';
import { useSesion } from '../componentes/sesion';
import { Pantalla } from '../componentes/ui';
import {
  abrirAsistencia, asistenciaAbierta, cerrarAsistencia, codigoVigente, marcarAsistencia, registrosDeSesion,
  type CodigoVigente, type EstadoAsistencia, type RegistroAsistencia,
} from '../servicios/asistencia';
import { fechaCorta, horaLocal, listarSesiones, type Sesion } from '../servicios/calendario';
import { servicioSupabase as servicioPersonas, type PersonaCurso } from '../servicios/personas';

const SIN_MARCA = '__sin';
const OPCIONES = [
  { valor: SIN_MARCA, etiqueta: 'Sin registrar' },
  { valor: 'presente', etiqueta: 'Presente' },
  { valor: 'ausente', etiqueta: 'Ausente' },
  { valor: 'justificado', etiqueta: 'Justificado' },
];
const TIPO_ESTADO = { presente: 'ok', ausente: 'alerta', justificado: 'info' } as const;

const sesionInicial = (sesiones: Sesion[]) => {
  const ahora = Date.now();
  const hoy = sesiones.find((sesion) => sesion.iniciaEn && new Date(sesion.iniciaEn).toDateString() === new Date().toDateString());
  if (hoy) return hoy.id;
  const proxima = sesiones.find((sesion) => sesion.iniciaEn && new Date(sesion.iniciaEn).getTime() > ahora);
  return (proxima ?? sesiones[sesiones.length - 1])?.id ?? '';
};

function CodigoQR({ valor }: { valor: string }) {
  const [imagen, setImagen] = useState<string | null>(null);
  useEffect(() => {
    let activo = true;
    QRCode.toDataURL(valor, { width: 320, margin: 1, color: { dark: '#073b3a', light: '#ffffff' } }).then((url) => { if (activo) setImagen(url); }).catch(() => undefined);
    return () => { activo = false; };
  }, [valor]);
  return imagen ? <img className="asist__qr" src={imagen} alt="Código QR para registrar asistencia" /> : <div className="asist__qr asist__qr--cargando" />;
}

function D16Real() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [sesionId, setSesionId] = useState('');
  const [estudiantes, setEstudiantes] = useState<PersonaCurso[]>([]);
  const [registros, setRegistros] = useState<Map<string, RegistroAsistencia>>(new Map());
  const [abierta, setAbierta] = useState(false);
  const [vigente, setVigente] = useState<CodigoVigente | null>(null);
  const [restante, setRestante] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);
  const pidiendo = useRef(false);

  const cargarCurso = useCallback(async () => {
    if (!curso) return;
    try {
      const [lista, personas] = await Promise.all([listarSesiones(curso.id), servicioPersonas.cargar(curso.id)]);
      setSesiones(lista);
      setEstudiantes(personas.personas.filter((persona) => persona.rol === 'estudiante'));
      setSesionId((actual) => (lista.some((sesion) => sesion.id === actual) ? actual : sesionInicial(lista)));
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [curso]);

  const cargarSesion = useCallback(async () => {
    if (!sesionId) { setRegistros(new Map()); setAbierta(false); return; }
    try {
      const [mapa, activa] = await Promise.all([registrosDeSesion(sesionId), asistenciaAbierta(sesionId)]);
      setRegistros(mapa);
      setAbierta(activa);
    } catch {
      setFallo(true);
    }
  }, [sesionId]);

  useEffect(() => { void cargarCurso(); }, [cargarCurso]);
  useEffect(() => { setVigente(null); void cargarSesion(); }, [cargarSesion]);

  const pedirCodigo = useCallback(async () => {
    if (!sesionId || pidiendo.current) return;
    pidiendo.current = true;
    const nuevo = await codigoVigente(sesionId);
    pidiendo.current = false;
    if (nuevo) { setVigente(nuevo); setRestante(nuevo.segundos); }
  }, [sesionId]);

  useEffect(() => {
    if (!abierta) return undefined;
    void pedirCodigo();
    const reloj = window.setInterval(() => setRestante((actual) => Math.max(0, actual - 1)), 1000);
    const lista = window.setInterval(() => void cargarSesion(), 3000);
    return () => { window.clearInterval(reloj); window.clearInterval(lista); };
  }, [abierta, pedirCodigo, cargarSesion]);

  useEffect(() => { if (abierta && restante === 0) void pedirCodigo(); }, [abierta, restante, pedirCodigo]);

  const abrir = async () => {
    if (!curso || !sesionId) return;
    setAviso(await abrirAsistencia(curso.id, sesionId));
    await cargarSesion();
  };

  const cerrar = async () => {
    if (!curso || !sesionId) return;
    setAviso(await cerrarAsistencia(curso.id, sesionId));
    setVigente(null);
    await cargarSesion();
  };

  const marcar = async (perfilId: string, valor: string) => {
    if (!curso || !sesionId) return;
    setAviso(await marcarAsistencia(curso.id, sesionId, perfilId, valor === SIN_MARCA ? null : (valor as EstadoAsistencia)));
    await cargarSesion();
  };

  const sesion = sesiones.find((candidata) => candidata.id === sesionId);
  const presentes = [...registros.values()].filter((registro) => registro.estado === 'presente').length;
  const enlace = curso && vigente ? `${window.location.origin}${window.location.pathname}${rutaCurso('#/asistir')}?sesion=${sesionId}&codigo=${vigente.codigo}` : '';

  return (
    <Pantalla rol="docente" clase="p-d16">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker={sesion ? `${sesion.codigo} · ${fechaCorta(sesion.iniciaEn)}${sesion.iniciaEn ? ` · ${horaLocal(sesion.iniciaEn)}` : ''}` : 'Clase'} titulo="Asistencia" subtitulo="Proyecta el código: cambia cada 20 segundos y solo vale con la sesión de cada estudiante." objeto="mapa" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar la asistencia. <button onClick={() => void cargarCurso()}>Reintentar</button></p>}
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {sesiones.length === 0 && !fallo && <Tarjeta kicker="Primer paso" titulo="Agrega una sesión"><p className="meta">La asistencia se toma por sesión. Créalas en <a href={rutaCurso('#/d6') ?? '#/d6'}><u>Calendario</u></a>.</p></Tarjeta>}
          {sesiones.length > 0 && (
            <div className="asist__columnas">
              <div className="asist__lado">
                <Tarjeta kicker="Sesión" titulo="¿De qué clase?">
                  <Selector valor={sesionId} opciones={sesiones.map((candidata) => ({ valor: candidata.id, etiqueta: `${candidata.codigo} · ${candidata.tema}` }))} alCambiar={setSesionId} etiqueta="Sesión" />
                </Tarjeta>
                {abierta ? (
                  <Tarjeta tono="oscura" kicker="Abierta ahora" titulo="Escanea o escribe el código" accion={<Estado tipo="ok">En vivo</Estado>}>
                    <div className="asist__proyeccion">
                      {enlace ? <CodigoQR valor={enlace} /> : <div className="asist__qr asist__qr--cargando" />}
                      <div className="asist__codigo">
                        <strong aria-live="off">{vigente?.codigo ?? '······'}</strong>
                        <div className="asist__tiempo" role="progressbar" aria-valuenow={restante} aria-valuemax={20} aria-label="Segundos para que cambie el código"><i style={{ width: `${(restante / 20) * 100}%` }} /></div>
                        <small>Cambia en {restante} s</small>
                      </div>
                    </div>
                    <button className="boton boton--accent" onClick={() => void cerrar()}>Cerrar asistencia</button>
                  </Tarjeta>
                ) : (
                  <Tarjeta tono="menta" kicker="Cerrada" titulo="Abre la asistencia al empezar la clase">
                    <p className="meta">Se genera un QR y un código de 6 caracteres que rotan. Los estudiantes lo leen con su sesión iniciada: nadie puede reenviar una captura.</p>
                    <div className="acciones"><button className="boton boton--accent" disabled={!sesionId} onClick={() => void abrir()}>{registros.size > 0 ? 'Reabrir asistencia' : 'Abrir asistencia'}</button></div>
                  </Tarjeta>
                )}
              </div>
              <Tarjeta kicker={`${presentes} de ${estudiantes.length} presentes`} titulo="Quién está">
                <div className="asist__barra" role="progressbar" aria-valuenow={presentes} aria-valuemax={Math.max(1, estudiantes.length)}><i style={{ width: `${estudiantes.length ? (presentes / estudiantes.length) * 100 : 0}%` }} /></div>
                <ul className="d13__personas">
                  {estudiantes.map((persona) => {
                    const registro = registros.get(persona.id);
                    return (
                      <li key={persona.id}>
                        <span className="avatar avatar--verde">{(persona.nombre ?? persona.correo).slice(0, 2).toUpperCase()}</span>
                        <span className="d13__datos"><strong>{persona.nombre ?? persona.correo}</strong><small>{registro ? `${registro.origen === 'codigo' ? 'Con el código' : 'A mano'} · ${horaLocal(registro.registradaEn)}` : 'Aún sin registrar'}</small></span>
                        {registro && <Estado tipo={TIPO_ESTADO[registro.estado]}>{registro.estado === 'presente' ? 'Presente' : registro.estado === 'ausente' ? 'Ausente' : 'Justificado'}</Estado>}
                        <Selector valor={registro?.estado ?? SIN_MARCA} opciones={OPCIONES} alCambiar={(valor) => void marcar(persona.id, valor)} etiqueta={`Asistencia de ${persona.nombre ?? persona.correo}`} />
                      </li>
                    );
                  })}
                  {estudiantes.length === 0 && <li><span className="d13__datos"><small>Aún no hay estudiantes en el curso.</small></span></li>}
                </ul>
              </Tarjeta>
            </div>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}

export function D16Asistencia() {
  const { modoDemo } = useSesion();
  if (!modoDemo) return <D16Real />;
  return (
    <Pantalla rol="docente" clase="p-d16">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Clase" titulo="Asistencia" subtitulo="Disponible en la versión con datos reales." objeto="mapa" />
      </div>
      <Dock />
    </Pantalla>
  );
}
