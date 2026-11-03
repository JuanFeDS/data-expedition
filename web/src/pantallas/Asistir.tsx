import { useEffect, useRef, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { useCurso } from '../componentes/curso';
import { parametroDeRuta } from '../componentes/navegacion';
import { Estado, Tarjeta, type TipoEstado } from '../componentes/panel';
import { useSesion } from '../componentes/sesion';
import { sonar } from '../componentes/sonidos';
import { Pantalla } from '../componentes/ui';
import { misAsistencias, registrarAsistencia, type EstadoAsistencia, type MiAsistencia } from '../servicios/asistencia';
import { fechaCorta, horaLocal, listarSesiones, type Sesion } from '../servicios/calendario';

const TIPO: Record<EstadoAsistencia, TipoEstado> = { presente: 'ok', ausente: 'alerta', justificado: 'info' };
const TEXTO: Record<EstadoAsistencia, string> = { presente: 'Presente', ausente: 'Ausente', justificado: 'Justificado' };

function AsistirReal() {
  const { curso } = useCurso();
  const sesionLink = parametroDeRuta('sesion');
  const codigoLink = parametroDeRuta('codigo');
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrada, setRegistrada] = useState<string | null>(null);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [mias, setMias] = useState<MiAsistencia[]>([]);
  const intentado = useRef(false);

  const cargar = async () => {
    if (!curso) return;
    const [lista, propias] = await Promise.all([listarSesiones(curso.id), misAsistencias()]);
    setSesiones(lista);
    setMias(propias);
  };

  const registrar = async (valor: string, sesionId?: string) => {
    if (!curso) return;
    setEnviando(true);
    setError(null);
    const resultado = await registrarAsistencia(curso.id, valor, sesionId);
    setEnviando(false);
    if (resultado.error) { setError(resultado.error); return; }
    setRegistrada(resultado.sesionId);
    sonar('acierto');
    await cargar();
  };

  useEffect(() => { void cargar().catch(() => undefined); }, [curso]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!curso || !codigoLink || intentado.current) return;
    intentado.current = true;
    void registrar(codigoLink, sesionLink ?? undefined);
  }, [curso, codigoLink, sesionLink]); // eslint-disable-line react-hooks/exhaustive-deps

  const dadas = sesiones.filter((sesion) => sesion.iniciaEn !== null && new Date(sesion.iniciaEn).getTime() < Date.now());
  const estadoDe = (sesionId: string) => mias.find((registro) => registro.sesionId === sesionId)?.estado;
  const cuentan = dadas.filter((sesion) => ['presente', 'justificado'].includes(estadoDe(sesion.id) ?? '')).length;
  const porcentaje = dadas.length > 0 ? Math.round((cuentan / dadas.length) * 100) : null;
  const sesionRegistrada = sesiones.find((sesion) => sesion.id === registrada);

  return (
    <Pantalla clase="p-asistir">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker={curso?.nombre ?? 'Curso'} titulo="Asistencia" subtitulo="Lee el código que proyecta tu docente." objeto="mapa">
          {porcentaje !== null && <p className="radar__resumen"><strong>{porcentaje} %</strong> de asistencia · {cuentan} de {dadas.length} clases</p>}
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo panel">
          {registrada ? (
            <Tarjeta tono="menta" kicker="Listo" titulo="¡Asistencia registrada!">
              <div className="rel__jaguar"><Jaguar pose="celebra" ancho={110} /><p>{sesionRegistrada ? `${sesionRegistrada.codigo} · ${sesionRegistrada.tema}` : 'Quedaste presente en la clase.'}</p></div>
            </Tarjeta>
          ) : (
            <Tarjeta kicker="Registrar" titulo="Escribe el código">
              <p className="meta">Si escaneaste el QR con la cámara, se registra solo. Si no, escribe los 6 caracteres que ves en la pantalla del salón.</p>
              <form className="d13__fila" onSubmit={(evento) => { evento.preventDefault(); if (codigo.trim().length >= 6) void registrar(codigo.trim()); }}>
                <input className="d13__campo asist__entrada" value={codigo} maxLength={6} onChange={(evento) => setCodigo(evento.target.value.toUpperCase())} placeholder="A1B2C3" aria-label="Código de asistencia" autoCapitalize="characters" autoComplete="off" />
                <button className="acceso__boton acceso__boton--principal" disabled={codigo.trim().length < 6 || enviando}>{enviando ? 'Registrando…' : 'Registrar'}</button>
              </form>
              {error && <p className="acceso__error" role="alert">{error}</p>}
            </Tarjeta>
          )}
          <Tarjeta kicker="Tu historial" titulo="Mis clases">
            <ul className="d13__personas">
              {dadas.map((sesion) => {
                const estado = estadoDe(sesion.id);
                return (
                  <li key={sesion.id}>
                    <span className="d13__datos"><strong>{sesion.codigo} · {sesion.tema}</strong><small>{fechaCorta(sesion.iniciaEn)} · {horaLocal(sesion.iniciaEn)}</small></span>
                    {estado ? <Estado tipo={TIPO[estado]}>{TEXTO[estado]}</Estado> : <Estado tipo="pendiente">Sin registro</Estado>}
                  </li>
                );
              })}
              {dadas.length === 0 && <li><span className="d13__datos"><small>Aún no hay clases dadas.</small></span></li>}
            </ul>
          </Tarjeta>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}

export function Asistir() {
  const { modoDemo } = useSesion();
  if (!modoDemo) return <AsistirReal />;
  return (
    <Pantalla clase="p-asistir">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker="Clase" titulo="Asistencia" subtitulo="Disponible en la versión con datos reales." objeto="mapa" />
      </div>
      <Dock />
    </Pantalla>
  );
}
