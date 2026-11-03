import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { useCurso, useRutaCurso } from '../../../compartido/estado/curso';
import { parametroDeRuta } from '../../../compartido/navegacion/navegacion';
import { Estado, Tarjeta } from '../../../compartido/ui/panel';
import { useSesion } from '../../../compartido/estado/sesion';
import { Pantalla, Segmentado } from '../../../compartido/ui/ui';
import { cargarDetalle, guardarDetalle, type DetalleTrabajo } from '../../../servicios/detalleTrabajo';
import { misEquipos, type MiEquipo } from '../../../servicios/equipos';
import { listarSesiones } from '../../../servicios/calendario';
import { useServicioRubricas, type Criterio } from '../../../servicios/rubricas';
import { finDelDia, formatoFecha } from '../../../servicios/trabajos';

const aEntradaFecha = (iso: string | null) => {
  if (!iso) return '';
  const fecha = new Date(iso);
  const dos = (valor: number) => String(valor).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
};
const esEnlace = (texto: string) => /^https?:\/\//i.test(texto.trim());
const lineas = (texto: string) => texto.split('\n').map((linea) => linea.trim()).filter(Boolean);

function Editor({ detalle, alGuardado }: { detalle: DetalleTrabajo; alGuardado: () => Promise<void> }) {
  const [borrador, setBorrador] = useState({ nombre: detalle.nombre, tema: detalle.tema, semana: detalle.semana ? String(detalle.semana) : '', fecha: aEntradaFecha(detalle.venceEn), minPylint: String(detalle.minPylint), descripcion: detalle.descripcion, entregables: detalle.entregables, enlaceBase: detalle.enlaceBase });
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const cambiar = (campo: keyof typeof borrador) => (evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setBorrador((actual) => ({ ...actual, [campo]: evento.target.value })); setGuardado(false); };
  const valido = borrador.nombre.trim() !== '' && (borrador.enlaceBase.trim() === '' || esEnlace(borrador.enlaceBase));

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!valido) return;
    setGuardando(true);
    const error = await guardarDetalle(detalle.id, {
      nombre: borrador.nombre.trim(), tema: borrador.tema.trim(), semana: borrador.semana ? Number(borrador.semana) : null,
      venceEn: borrador.fecha ? finDelDia(borrador.fecha) : null, minPylint: Number(borrador.minPylint) || 8,
      descripcion: borrador.descripcion, entregables: borrador.entregables, enlaceBase: borrador.enlaceBase,
    });
    setGuardando(false);
    setAviso(error);
    setGuardado(error === null);
    if (!error) await alGuardado();
  };

  return (
    <Tarjeta kicker="Docente" titulo="Qué se pide" accion={guardado ? <Estado tipo="ok">Guardado</Estado> : null}>
      <form className="d14__formulario" onSubmit={(evento) => void guardar(evento)}>
        <label className="d14__etiqueta">Nombre<input className="d13__campo" value={borrador.nombre} onChange={cambiar('nombre')} /></label>
        <label className="d14__etiqueta">Tema<input className="d13__campo" value={borrador.tema} onChange={cambiar('tema')} /></label>
        <div className="d14__par">
          <label className="d14__etiqueta">Semana<input className="d13__campo" type="number" min={1} max={16} value={borrador.semana} onChange={cambiar('semana')} /></label>
          <label className="d14__etiqueta">Pylint mínimo<input className="d13__campo" type="number" min={0} max={10} value={borrador.minPylint} onChange={cambiar('minPylint')} /></label>
        </div>
        <label className="d14__etiqueta">Fecha de entrega<input className="d13__campo" type="date" value={borrador.fecha} onChange={cambiar('fecha')} /></label>
        <label className="d14__etiqueta">Descripción: qué deben hacer<textarea className="d13__campo rubrica__nivel" rows={7} value={borrador.descripcion} onChange={cambiar('descripcion')} placeholder="Contexto del problema, qué análisis o modelo construir y con qué datos…" /></label>
        <label className="d14__etiqueta">Qué debe incluir la entrega, una cosa por línea<textarea className="d13__campo rubrica__nivel" rows={4} value={borrador.entregables} onChange={cambiar('entregables')} placeholder={'Cuaderno que corra de principio a fin\nBitácora de uso de IA\nPR con Black y Pylint en verde'} /></label>
        <label className="d14__etiqueta">Material de partida (repositorio o enlace)<input className="d13__campo" type="url" value={borrador.enlaceBase} onChange={cambiar('enlaceBase')} placeholder="https://github.com/…" /></label>
        {borrador.enlaceBase.trim() !== '' && !esEnlace(borrador.enlaceBase) && <small className="acceso__error">El enlace debe empezar por http:// o https://</small>}
        {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
        <button className="acceso__boton acceso__boton--principal" disabled={!valido || guardando}>{guardando ? 'Guardando…' : 'Guardar detalle'}</button>
      </form>
    </Tarjeta>
  );
}

function DetalleTrabajoReal() {
  const { persona } = useSesion();
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const rubricas = useServicioRubricas();
  const rol = persona?.rol ?? 'estudiante';
  const esDocente = rol === 'docente';
  const trabajoId = parametroDeRuta('trabajo');
  const [detalle, setDetalle] = useState<DetalleTrabajo | null>(null);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [equipo, setEquipo] = useState<MiEquipo | null>(null);
  const [sesionRelacionada, setSesionRelacionada] = useState<string | null>(null);
  const [modo, setModo] = useState(0);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'vacio' | 'fallo'>('cargando');

  const cargar = async () => {
    if (!trabajoId) { setEstado('vacio'); return; }
    try {
      const encontrado = await cargarDetalle(trabajoId);
      if (!encontrado) { setEstado('vacio'); return; }
      const [deRubrica, equipos] = await Promise.all([rubricas.criterios(trabajoId), encontrado.tamanoEquipo && !esDocente ? misEquipos(encontrado.edicionId) : Promise.resolve([])]);
      setDetalle(encontrado);
      setCriterios(deRubrica);
      setEquipo(equipos.find((candidato) => candidato.trabajoId === trabajoId) ?? null);
      setEstado('listo');
    } catch {
      setEstado('fallo');
    }
  };

  useEffect(() => { void cargar(); }, [trabajoId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!detalle?.semana || !curso) return;
    listarSesiones(curso.id).then((sesiones) => setSesionRelacionada(sesiones.find((sesion) => sesion.modalidad === 'virtual' && sesion.semana === detalle.semana)?.id ?? null)).catch(() => undefined);
  }, [detalle?.semana, curso]);

  const volver = esDocente ? (rutaCurso('#/d14') ?? '#/d14') : (rutaCurso('#/e5') ?? '#/e5');
  const vence = formatoFecha(detalle?.venceEn ?? null);
  const delModo = criterios.filter((criterio) => criterio.modoIa === (modo === 0 ? 'sin_ia' : 'con_ia'));
  const entregables = lineas(detalle?.entregables ?? '');

  return (
    <Pantalla rol={rol} clase="p-trabajo">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: esDocente ? 'Trabajos' : 'Entregas', ruta: volver }} kicker={detalle ? `${detalle.semana ? `Semana ${detalle.semana} · ` : ''}${detalle.tema || 'Trabajo'}` : 'Trabajo'} titulo={detalle?.nombre ?? 'Trabajo'} subtitulo={detalle ? `Vence el ${vence.largo}. Mínimo de Pylint: ${detalle.minPylint}.` : undefined} objeto="cuaderno" />
        <div className="contenido cuerpo-mundo panel">
          {estado === 'cargando' && <p className="meta">Cargando el trabajo…</p>}
          {estado === 'fallo' && <p className="acceso__error" role="alert">No pudimos cargar el trabajo. <a href={volver}><u>Volver</u></a></p>}
          {estado === 'vacio' && <p className="meta">Elige un trabajo desde <a href={volver}><u>{esDocente ? 'Trabajos' : 'Entregas'}</u></a>.</p>}
          {detalle && (
            <div className="d3__columnas">
              <div className="d4__lado">
                {esDocente ? <Editor detalle={detalle} alGuardado={cargar} /> : (
                  <>
                    <Tarjeta kicker="Qué se pide" titulo={detalle.nombre}>
                      {detalle.descripcion ? <p className="trabajo__texto">{detalle.descripcion}</p> : <p className="meta">Tu docente aún no escribe la descripción de este trabajo.</p>}
                    </Tarjeta>
                    {entregables.length > 0 && (
                      <Tarjeta kicker="Tu entrega" titulo="Qué debe incluir">
                        <ul className="trabajo__lista">{entregables.map((linea) => <li key={linea}>{linea}</li>)}</ul>
                      </Tarjeta>
                    )}
                  </>
                )}
              </div>
              <div className="d4__lado">
                <Tarjeta kicker="Resumen" titulo="Datos del trabajo">
                  <dl className="d4__datos">
                    <div><dt>Vence</dt><dd>{vence.largo}</dd></div>
                    <div><dt>Pylint mínimo</dt><dd>{detalle.minPylint}</dd></div>
                    <div><dt>Modalidad</dt><dd>{detalle.tamanoEquipo ? `En equipos de ${detalle.tamanoEquipo}` : 'Individual'}</dd></div>
                    {detalle.enlaceBase && <div><dt>Material de partida</dt><dd><a href={detalle.enlaceBase} target="_blank" rel="noreferrer"><u>Abrir</u></a></dd></div>}
                    {sesionRelacionada && <div><dt>Sesión de la semana</dt><dd><a href={`${rutaCurso('#/e23')}?sesion=${sesionRelacionada}`}><u>Ver sesión</u></a></dd></div>}
                  </dl>
                </Tarjeta>
                {!esDocente && detalle.tamanoEquipo && (
                  <Tarjeta tono={equipo ? 'menta' : 'clara'} kicker="Con quién" titulo={equipo ? equipo.equipo : 'Equipo por definir'}>
                    {equipo ? <ul className="ruta__equipo">{equipo.integrantes.map((integrante) => <li key={integrante.nombre + (integrante.usuario ?? '')} className={integrante.soyYo ? 'yo' : ''}><div><strong>{integrante.soyYo ? 'Tú' : integrante.nombre}</strong><small>{integrante.usuario ? `@${integrante.usuario}` : ''}</small></div></li>)}</ul> : <p className="meta">Tu docente aún no sortea los equipos de este trabajo.</p>}
                  </Tarjeta>
                )}
                <Tarjeta kicker="Cómo se califica" titulo="Rúbrica">
                  <Segmentado opciones={['Sin IA', 'Con IA']} activa={modo} alCambiar={setModo} />
                  <ul className="d13__personas">
                    {delModo.map((criterio) => <li key={criterio.id}><span className="d13__datos"><strong>{criterio.nombre}</strong><small>peso {criterio.peso}</small></span></li>)}
                    {delModo.length === 0 && <li><span className="d13__datos"><small>{esDocente ? <>Aún no hay criterios. Defínelos en <a href={rutaCurso('#/d10') ?? '#/d10'}><u>Rúbricas</u></a>.</> : 'Tu docente aún no define los criterios.'}</small></span></li>}
                  </ul>
                  <p className="meta">La nota es el promedio de los niveles, ponderado por el peso de cada criterio.</p>
                </Tarjeta>
              </div>
            </div>
          )}
        </div>
      </div>
      <Dock accion={detalle && !esDocente ? { etiqueta: `Vence ${vence.dia.toLowerCase()} ${vence.numero}`, texto: 'Ir a entregar', ruta: rutaCurso('#/e6') ?? '#/e6' } : undefined} />
    </Pantalla>
  );
}

export function DetalleTrabajoPantalla() {
  const { modoDemo } = useSesion();
  if (!modoDemo) return <DetalleTrabajoReal />;
  return (
    <Pantalla clase="p-trabajo">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Entregas', ruta: '#/e5' }} kicker="Trabajo" titulo="Detalle del trabajo" subtitulo="Disponible en la versión con datos reales." objeto="cuaderno" />
      </div>
      <Dock />
    </Pantalla>
  );
}
