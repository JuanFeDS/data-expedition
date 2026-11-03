import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { BarraDato, Dato, Estado, Tarjeta, type TipoEstado } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import { fechaCorta, horaLocal, listarSesiones, type Sesion } from '../servicios/calendario';
import { listarFormularios, type Formulario } from '../servicios/formularios';
import { servicioSupabase as servicioPersonas, type PersonaCurso } from '../servicios/personas';
import { diagnosticosDelCurso, dimensionesDelCurso, rutaGuardada, type Diagnostico, type DimensionCurso, type RutaCurso } from '../servicios/radar';
import { formatoFecha, useServicioTrabajos, type EntregaVista, type TrabajoCurso } from '../servicios/trabajos';

const NOMBRE_RUTA: Record<RutaCurso, string> = { nivelacion: 'Nivelación', estandar: 'Estándar', profundizacion: 'Profundización' };

interface Alerta { tipo: TipoEstado; etiqueta: string; texto: string; accion: string; ruta: string }

export function D1PanelReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const servicio = useServicioTrabajos();
  const [trabajos, setTrabajos] = useState<TrabajoCurso[]>([]);
  const [entregas, setEntregas] = useState<EntregaVista[]>([]);
  const [estudiantes, setEstudiantes] = useState<PersonaCurso[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [dimensiones, setDimensiones] = useState<DimensionCurso[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<Map<string, Diagnostico[]>>(new Map());
  const [ruta, setRuta] = useState<RutaCurso | null>(null);
  const [cargado, setCargado] = useState(false);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    Promise.all([servicio.cargarTrabajos(curso.id), servicio.entregasDelCurso(curso.id), servicioPersonas.cargar(curso.id), listarFormularios(curso.id), listarSesiones(curso.id), dimensionesDelCurso(curso.id), diagnosticosDelCurso(curso.id), rutaGuardada(curso.id)])
      .then(([deTrabajos, deEntregas, personas, deFormularios, deSesiones, dims, mapa, rutaCurso_]) => {
        setTrabajos(deTrabajos);
        setEntregas(deEntregas);
        setEstudiantes(personas.personas.filter((persona) => persona.rol === 'estudiante'));
        setFormularios(deFormularios);
        setSesiones(deSesiones);
        setDimensiones(dims);
        setDiagnosticos(mapa);
        setRuta(rutaCurso_);
        setCargado(true);
      }).catch(() => { setFallo(true); setCargado(true); });
  }, [servicio, curso]);

  const ahora = Date.now();
  const enCurso = trabajos.find((trabajo) => trabajo.venceEn && new Date(trabajo.venceEn).getTime() > ahora) ?? trabajos[trabajos.length - 1];
  const deEste = enCurso ? entregas.filter((entrega) => entrega.trabajoId === enCurso.id) : [];
  const sinCargar = Math.max(0, estudiantes.length - deEste.length);
  const porCalificar = entregas.filter((entrega) => entrega.estado === 'entregada').length;
  const abierto = formularios.find((formulario) => formulario.estado === 'abierto');
  const borradores = formularios.filter((formulario) => formulario.estado === 'borrador').length;
  const vencidosSinEntrega = trabajos.filter((trabajo) => trabajo.venceEn && new Date(trabajo.venceEn).getTime() < ahora).reduce((total, trabajo) => total + Math.max(0, estudiantes.length - entregas.filter((entrega) => entrega.trabajoId === trabajo.id).length), 0);
  const proximaSesion = sesiones.find((sesion) => sesion.iniciaEn && new Date(sesion.iniciaEn).getTime() > ahora - 3 * 3600000);
  const sinDiagnostico = estudiantes.filter((persona) => !diagnosticos.has(persona.id)).length;

  const alertas: Alerta[] = [];
  if (vencidosSinEntrega > 0) alertas.push({ tipo: 'alerta', etiqueta: 'Urgente', texto: `${vencidosSinEntrega} ${vencidosSinEntrega === 1 ? 'entrega' : 'entregas'} sin cargar en trabajos que ya vencieron`, accion: 'Ver entregas', ruta: '#/d3' });
  if (porCalificar > 0) alertas.push({ tipo: 'tarde', etiqueta: 'Pendiente', texto: `${porCalificar} ${porCalificar === 1 ? 'entrega espera' : 'entregas esperan'} tu calificación`, accion: 'Calificar', ruta: '#/d3' });
  if (dimensiones.length > 0 && estudiantes.length > 0 && sinDiagnostico > 0) alertas.push({ tipo: 'info', etiqueta: 'Aviso', texto: `${sinDiagnostico} ${sinDiagnostico === 1 ? 'estudiante sin' : 'estudiantes sin'} diagnóstico de entrada`, accion: 'Registrar', ruta: '#/d2' });
  if (borradores > 0) alertas.push({ tipo: 'info', etiqueta: 'Aviso', texto: `${borradores} ${borradores === 1 ? 'formulario sigue' : 'formularios siguen'} en borrador`, accion: 'Abrir formularios', ruta: '#/d5' });
  if (cargado && sesiones.length === 0) alertas.push({ tipo: 'info', etiqueta: 'Aviso', texto: 'Aún no hay sesiones en el calendario', accion: 'Agregar sesión', ruta: '#/d6' });

  const brecha = dimensiones.map((dimension) => {
    const filas = [...diagnosticos.values()].flat().filter((fila) => fila.dimensionId === dimension.id && fila.sinIa !== null);
    return { nombre: dimension.nombre, media: filas.length ? Math.round(filas.reduce((total, fila) => total + (fila.sinIa ?? 0), 0) / filas.length) : null };
  }).filter((fila) => fila.media !== null).slice(0, 4);

  return (
    <Pantalla rol="docente" clase="p-d1">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker={`Docente · ${curso?.nombre ?? 'Curso'}`} titulo="Panel del curso" subtitulo={enCurso ? `Entrega en curso: ${enCurso.nombre}, vence el ${formatoFecha(enCurso.venceEn).largo}.` : 'Aún no hay trabajos publicados.'} objeto="mapa" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar todo el panel. Algunos datos pueden faltar.</p>}
          <div className="d1__datos rejilla rejilla--4">
            <Tarjeta><Dato valor={`${deEste.length}/${estudiantes.length}`} etiqueta="Entregas cargadas" nota={enCurso?.nombre ?? 'Sin trabajo en curso'} /></Tarjeta>
            <Tarjeta><Dato valor={sinCargar} etiqueta="Sin cargar" nota={enCurso ? 'En el trabajo en curso' : undefined} tono={sinCargar > 0 ? 'alerta' : undefined} /></Tarjeta>
            <Tarjeta><Dato valor={porCalificar} etiqueta="Por calificar" nota="Tu revisión pendiente" /></Tarjeta>
            <Tarjeta tono="oscura"><Dato valor={abierto ? `${abierto.participantes}/${estudiantes.length}` : '—'} etiqueta={abierto ? 'Formulario abierto' : 'Sin formulario abierto'} nota={abierto ? abierto.titulo : 'Ábrelo en En clase'} /></Tarjeta>
          </div>
          <div className="d1__columnas">
            <Tarjeta kicker="Requiere tu atención" titulo="Alertas" accion={<Estado tipo={alertas.length > 0 ? 'alerta' : 'ok'}>{alertas.length > 0 ? `${alertas.length} abiertas` : 'Todo al día'}</Estado>}>
              <ul className="d1__alertas">
                {alertas.map((alerta) => (
                  <li key={alerta.texto}>
                    <Estado tipo={alerta.tipo}>{alerta.etiqueta}</Estado>
                    <span>{alerta.texto}</span>
                    <a className="boton boton--suave" href={rutaCurso(alerta.ruta)}>{alerta.accion}</a>
                  </li>
                ))}
                {cargado && alertas.length === 0 && <li><span>No hay nada urgente por ahora.</span></li>}
              </ul>
            </Tarjeta>
            <Tarjeta kicker={proximaSesion ? `${fechaCorta(proximaSesion.iniciaEn)} · ${horaLocal(proximaSesion.iniciaEn)}` : 'Próxima clase'} titulo={proximaSesion ? `${proximaSesion.codigo} · ${proximaSesion.tema}` : 'Sin sesión programada'} tono="menta">
              <p className="meta">{proximaSesion ? 'Abre la asistencia al empezar y un relámpago al terminar el concepto.' : 'Agrega las sesiones del curso en el calendario.'}</p>
              <div className="acciones">
                <a className="boton boton--accent" href={rutaCurso('#/d11')}>Abrir un formulario</a>
                <a className="boton" href={rutaCurso(proximaSesion ? '#/d16' : '#/d6')}>{proximaSesion ? 'Tomar asistencia' : 'Ver el calendario'}</a>
              </div>
            </Tarjeta>
            <Tarjeta kicker="Diagnóstico de entrada" titulo={ruta ? `Ruta del curso: ${NOMBRE_RUTA[ruta]}` : 'Ruta sin confirmar'}>
              {brecha.map((fila) => <BarraDato key={fila.nombre} etiqueta={fila.nombre} valor={fila.media ?? 0} sufijo="" tono={(fila.media ?? 0) < 40 ? 'alerta' : undefined} />)}
              {brecha.length === 0 && <p className="meta">Cuando registres el diagnóstico verás aquí cómo llega el grupo.</p>}
              <a className="boton boton--suave" href={rutaCurso('#/d2')}>Ver diagnóstico y rutas</a>
            </Tarjeta>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: proximaSesion ? proximaSesion.codigo : 'Clase', texto: 'Abrir un formulario', ruta: rutaCurso('#/d11') ?? '#/d11' }} />
    </Pantalla>
  );
}
