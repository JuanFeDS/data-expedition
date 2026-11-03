import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Jaguar } from '../componentes/Jaguar';
import { Isla } from '../componentes/Region';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Kicker, Pantalla, Pill, Segmentado } from '../componentes/ui';
import { formatoFecha, trabajoPorEntregar, useServicioTrabajos, type EntregaPropia, type TrabajoCurso } from '../servicios/trabajos';

export const BIOMA_POR_SEMANA: Record<number, string> = { 1: 'selva', 2: 'paramo', 3: 'desierto', 4: 'cueva', 5: 'glaciar', 6: 'costa', 7: 'ruinas', 8: 'volcan' };

function Candado() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" fill="currentColor" />
      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const ESTADO_TEXTO = { entregada: 'Entregada, en revisión', calificada: 'Calificada', borrador: 'Borrador', no_presento: 'No presentada' } as const;

export function E5Entregas() {
  const servicio = useServicioTrabajos();
  const { curso, cargando: cargandoCursos } = useCurso();
  const rutaCurso = useRutaCurso();
  const [vista, setVista] = useState(0);
  const [trabajos, setTrabajos] = useState<TrabajoCurso[] | null>(null);
  const [entregas, setEntregas] = useState<EntregaPropia[]>([]);
  const [fallo, setFallo] = useState(false);

  const cargar = useCallback(async () => {
    if (!curso) return;
    try {
      const [lista, propias] = await Promise.all([servicio.cargarTrabajos(curso.id), servicio.misEntregas(curso.id)]);
      setTrabajos(lista);
      setEntregas(propias);
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [servicio, curso]);

  useEffect(() => { void cargar(); }, [cargar]);

  const actual = trabajos ? trabajoPorEntregar(trabajos, entregas) : null;
  const siguiente = actual && trabajos ? trabajos[trabajos.indexOf(actual) + 1] : undefined;
  const borrador = actual ? entregas.find((entrega) => entrega.trabajoId === actual.id && entrega.estado === 'borrador') : undefined;
  const hechas = entregas.filter((entrega) => entrega.estado !== 'borrador' && trabajos?.some((trabajo) => trabajo.id === entrega.trabajoId));
  const vence = formatoFecha(actual?.venceEn ?? null);
  const kicker = actual?.semana ? `Semana ${actual.semana}` : 'Tus trabajos';

  return (
    <Pantalla clase="p-e5">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/home' }} kicker={kicker} titulo="Entregas" subtitulo="Lo que debes entregar y lo que ya enviaste." objeto="cuaderno" />
        <div className="contenido cuerpo-mundo centrar" style={{ gap: 8 }}>
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar tus entregas. <button onClick={() => void cargar()}>Reintentar</button></p>}
          <Segmentado opciones={['Pendientes', 'Entregadas']} activa={vista} alCambiar={setVista} />
          {vista === 0 ? (
            <>
              {!cargandoCursos && !curso && (
                <div className="entrega-bloqueada">
                  <span className="entrega-bloqueada__icono"><Candado /></span>
                  <div><strong>Aún no estás en ningún curso</strong><small>Tu docente debe invitarte a un curso. Si ya lo hizo, cierra sesión y vuelve a entrar con el correo con el que te invitaron.</small></div>
                </div>
              )}
              {curso && trabajos && trabajos.length === 0 && (
                <div className="entrega-bloqueada">
                  <span className="entrega-bloqueada__icono"><Candado /></span>
                  <div><strong>Aún no hay trabajos</strong><small>Tu docente los publicará aquí.</small></div>
                </div>
              )}
              {actual && (
                <section className="bloque-actual">
                  <Kicker>Entrega en curso{actual.semana ? ` · semana ${actual.semana}` : ''}</Kicker>
                  <h2 className="titulo"><a href={`${rutaCurso('#/trabajo')}?trabajo=${actual.id}`}>{actual.nombre}</a></h2>
                  <a className="bloque-actual__detalle" href={`${rutaCurso('#/trabajo')}?trabajo=${actual.id}`}>Ver qué se pide</a>
                  <p>{actual.tema || 'Pega el enlace de tu PR cuando esté listo'}{borrador ? '. Tienes un borrador guardado.' : '.'}</p>
                  <span className="hoja__fecha bloque-actual__fecha"><small>{vence.dia}</small><b>{vence.numero}</b></span>
                  <a className="bloque-actual__accion" href={rutaCurso('#/e6')}><Pill variante="deep" boton>{borrador ? 'Continuar entrega' : 'Empezar entrega'}</Pill></a>
                </section>
              )}
              {!actual && trabajos && trabajos.length > 0 && (
                <div className="entrega-bloqueada">
                  <span className="entrega-bloqueada__icono"><Candado /></span>
                  <div><strong>Estás al día</strong><small>Entregaste todos los trabajos publicados.</small></div>
                </div>
              )}
              {siguiente && actual && (
                <div className="entrega-bloqueada">
                  <span className="entrega-bloqueada__icono"><Candado /></span>
                  <div>
                    <strong>{siguiente.nombre}</strong>
                    <small>{siguiente.semana ? `Semana ${siguiente.semana} · ` : ''}se abre al entregar el {actual.nombre}</small>
                  </div>
                </div>
              )}
              <div className="azar">
                <Jaguar pose="pensando" ancho={92} clase="azar__guia" />
                <div>
                  <Kicker>Revisión al azar</Kicker>
                  <p>Cada semana se sortean 2 o 3 equipos para explicar una decisión en 3 minutos. Ten lista tu bitácora.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {hechas.length === 0 && (
                <div className="entrega-bloqueada">
                  <span className="entrega-bloqueada__icono"><Candado /></span>
                  <div><strong>Aún no has entregado nada</strong><small>Cuando entregues un trabajo, aparecerá aquí.</small></div>
                </div>
              )}
              {hechas.map((entrega) => {
                const trabajo = trabajos?.find((candidato) => candidato.id === entrega.trabajoId);
                const fecha = entrega.entregadaEn ? new Date(entrega.entregadaEn).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : '';
                return (
                  <div className="entrega-hecha" key={entrega.trabajoId}>
                    <span className="isla-mini"><Isla bioma={BIOMA_POR_SEMANA[trabajo?.semana ?? 1] ?? 'selva'} /></span>
                    <div className="fila__texto">
                      <Kicker>{fecha ? `Entregado el ${fecha}` : 'Entregado'}{trabajo?.semana ? ` · semana ${trabajo.semana}` : ''}</Kicker>
                      <strong className="fila__titulo">{trabajo ? <a href={`${rutaCurso('#/trabajo')}?trabajo=${trabajo.id}`}>{trabajo.nombre}</a> : null}</strong>
                      <div className="chips">
                        <Pill variante="azul" pequena>{entrega.modoIa === 'con_ia' ? 'Con IA' : 'Sin IA'}</Pill>
                        {entrega.nota !== null && <Pill variante="accent" pequena>{entrega.nota.toFixed(1)}</Pill>}
                        <Pill variante="suave" pequena>{ESTADO_TEXTO[entrega.estado]}</Pill>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      <Dock accion={actual ? { etiqueta: `Vence ${vence.dia.toLowerCase()} ${vence.numero}`, texto: borrador ? `Continuar ${actual.nombre}` : `Entregar ${actual.nombre}`, ruta: '#/e6' } : undefined} />
    </Pantalla>
  );
}
