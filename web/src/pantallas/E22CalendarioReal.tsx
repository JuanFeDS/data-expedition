import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Estado, Tarjeta } from '../componentes/panel';
import { Pantalla, Pill, Segmentado } from '../componentes/ui';
import { fechaCorta, horaLocal, listarSesiones, type Sesion } from '../servicios/calendario';
import { formatoFecha, useServicioTrabajos, type EntregaPropia, type TrabajoCurso } from '../servicios/trabajos';

const mismoDia = (iso: string | null) => iso !== null && new Date(iso).toDateString() === new Date().toDateString();

export function E22CalendarioReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const trabajosServicio = useServicioTrabajos();
  const [vista, setVista] = useState(0);
  const [sesiones, setSesiones] = useState<Sesion[] | null>(null);
  const [trabajos, setTrabajos] = useState<TrabajoCurso[]>([]);
  const [entregas, setEntregas] = useState<EntregaPropia[]>([]);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    Promise.all([listarSesiones(curso.id), trabajosServicio.cargarTrabajos(curso.id), trabajosServicio.misEntregas(curso.id)])
      .then(([deSesiones, deTrabajos, propias]) => { setSesiones(deSesiones); setTrabajos(deTrabajos); setEntregas(propias); })
      .catch(() => setFallo(true));
  }, [curso, trabajosServicio]);

  const virtuales = (sesiones ?? []).filter((sesion) => sesion.modalidad === 'virtual');
  const presenciales = (sesiones ?? []).filter((sesion) => sesion.modalidad === 'presencial');
  const semanas = [...new Set(virtuales.map((sesion) => sesion.semana))];
  const hoy = (sesiones ?? []).find((sesion) => mismoDia(sesion.iniciaEn));
  const proxima = (sesiones ?? []).find((sesion) => sesion.iniciaEn !== null && new Date(sesion.iniciaEn).getTime() > Date.now());
  const destacada = hoy ?? proxima;
  const enlaceSesion = (sesion: Sesion) => `${rutaCurso('#/e23')}?sesion=${sesion.id}`;
  const entregaDe = (trabajoId: string) => entregas.find((entrega) => entrega.trabajoId === trabajoId && entrega.estado !== 'borrador');

  return (
    <Pantalla clase="p-e22">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker={curso?.nombre ?? 'Curso'} titulo="Calendario" subtitulo={`${virtuales.length} sesiones virtuales, ${presenciales.length} presenciales y ${trabajos.length} trabajos.`} objeto="mapa" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar el calendario. Intenta de nuevo en un momento.</p>}
          <Segmentado opciones={['Sesiones', 'Plazos']} activa={vista} alCambiar={setVista} />
          <div className="cal__columnas">
            <Tarjeta clase={vista === 0 ? '' : 'vista--off'} kicker="Sesiones virtuales" titulo="Semana a semana">
              <div className="cal__semanas">
                {semanas.map((semana) => (
                  <div className="cal__semana" key={semana ?? 'sin'}>
                    <span className="cal__etiqueta">{semana ? `Semana ${semana}` : 'Sin semana'}</span>
                    {virtuales.filter((sesion) => sesion.semana === semana).map((sesion) => {
                      const dada = sesion.iniciaEn !== null && new Date(sesion.iniciaEn).getTime() < Date.now() && !mismoDia(sesion.iniciaEn);
                      return (
                        <a key={sesion.id} href={enlaceSesion(sesion)} className={`cal__sesion cal__sesion--${mismoDia(sesion.iniciaEn) ? 'hoy' : dada ? 'dada' : 'proxima'}`}>
                          <b>{sesion.codigo}</b>
                          <div><strong>{sesion.tema}</strong><small>{fechaCorta(sesion.iniciaEn)}{sesion.iniciaEn ? ` · ${horaLocal(sesion.iniciaEn)}` : ''}</small></div>
                          {mismoDia(sesion.iniciaEn) ? <Estado tipo="tarde">Hoy</Estado> : dada ? <Estado tipo="ok">Dada</Estado> : null}
                        </a>
                      );
                    })}
                  </div>
                ))}
                {sesiones && virtuales.length === 0 && <p className="meta">Tu docente aún no carga las sesiones.</p>}
              </div>
            </Tarjeta>
            <div className={`cal__lado ${vista === 1 ? '' : 'vista--off'}`}>
              <Tarjeta kicker="Plazos" titulo="Trabajos">
                <ul className="cal__plazos">
                  {trabajos.map((trabajo) => {
                    const vence = formatoFecha(trabajo.venceEn);
                    const entrega = entregaDe(trabajo.id);
                    return (
                      <li key={trabajo.id} className="cal__plazo">
                        <b>{vence.numero || '—'}<small>{vence.dia}</small></b>
                        <div><strong>{trabajo.nombre}</strong><small>{trabajo.tema}</small></div>
                        {entrega?.estado === 'calificada' && entrega.nota !== null ? <Pill variante="accent" pequena>{entrega.nota.toFixed(1)}</Pill> : entrega ? <Estado tipo="info">Entregado</Estado> : <Estado tipo="pendiente">Pendiente</Estado>}
                      </li>
                    );
                  })}
                  {trabajos.length === 0 && <li className="cal__plazo"><div><small>Aún no hay trabajos publicados.</small></div></li>}
                </ul>
              </Tarjeta>
              {presenciales.length > 0 && (
                <Tarjeta kicker="Sábados" titulo="Sesiones presenciales">
                  <ul className="cal__plazos">
                    {presenciales.map((sesion) => (
                      <li key={sesion.id} className="cal__plazo"><b>{sesion.codigo}</b><div><strong>{fechaCorta(sesion.iniciaEn)}{sesion.iniciaEn ? ` · ${horaLocal(sesion.iniciaEn)}` : ''}</strong><small>{sesion.tema}</small></div></li>
                    ))}
                  </ul>
                </Tarjeta>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dock accion={destacada ? { etiqueta: `${hoy ? 'Hoy' : 'Próxima'} · ${destacada.codigo}`, texto: 'Ver la sesión', ruta: enlaceSesion(destacada) } : undefined} />
    </Pantalla>
  );
}
