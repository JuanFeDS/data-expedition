import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Selector } from '../componentes/Selector';
import { useConfirmar } from '../componentes/confirmar';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Estado, Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import { equiposDeTrabajo, fijarTamanoEquipo, moverMiembro, sortearEquipos, trabajosConEquipo, type Equipo, type TrabajoConEquipo } from '../servicios/equipos';
import { servicioSupabase as servicioPersonas, type PersonaCurso } from '../servicios/personas';

const SIN_EQUIPO = '__sin';

export function D7EquiposReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const confirmar = useConfirmar();
  const [trabajos, setTrabajos] = useState<TrabajoConEquipo[] | null>(null);
  const [trabajoId, setTrabajoId] = useState('');
  const [estudiantes, setEstudiantes] = useState<PersonaCurso[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tamano, setTamano] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  const trabajo = trabajos?.find((candidato) => candidato.id === trabajoId) ?? null;

  const cargarCurso = useCallback(async () => {
    if (!curso) return;
    try {
      const [lista, personas] = await Promise.all([trabajosConEquipo(curso.id), servicioPersonas.cargar(curso.id)]);
      setTrabajos(lista);
      setEstudiantes(personas.personas.filter((persona) => persona.rol === 'estudiante'));
      setTrabajoId((actual) => (lista.some((candidato) => candidato.id === actual) ? actual : (lista[0]?.id ?? '')));
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [curso]);

  const cargarEquipos = useCallback(async () => {
    if (!trabajoId) { setEquipos([]); return; }
    try {
      setEquipos(await equiposDeTrabajo(trabajoId));
    } catch {
      setFallo(true);
    }
  }, [trabajoId]);

  useEffect(() => { void cargarCurso(); }, [cargarCurso]);
  useEffect(() => { void cargarEquipos(); }, [cargarEquipos]);
  useEffect(() => { setTamano(trabajo?.tamanoEquipo ? String(trabajo.tamanoEquipo) : ''); }, [trabajo?.id, trabajo?.tamanoEquipo]);

  const guardarTamano = async () => {
    if (!trabajo) return;
    const valor = tamano.trim() === '' ? null : Math.round(Number(tamano));
    if (valor !== null && (!Number.isFinite(valor) || valor < 2 || valor > 8)) { setAviso('El tamaño del equipo va de 2 a 8, o vacío si el trabajo es individual.'); return; }
    setAviso(await fijarTamanoEquipo(trabajo.id, valor));
    await cargarCurso();
  };

  const sortear = async () => {
    if (!curso || !trabajo) return;
    if (equipos.length > 0) {
      const aceptado = await confirmar({ titulo: '¿Sortear de nuevo?', texto: 'Los equipos actuales, con los ajustes que hayas hecho, se reemplazan por un sorteo nuevo.', confirmar: 'Sortear de nuevo' });
      if (!aceptado) return;
    }
    setAviso(await sortearEquipos(curso.id, trabajo.id));
    await cargarEquipos();
  };

  const mover = async (perfilId: string, destino: string) => {
    if (!trabajo) return;
    setAviso(await moverMiembro(trabajo.id, perfilId, destino === SIN_EQUIPO ? null : destino));
    await cargarEquipos();
  };

  const enEquipo = new Set(equipos.flatMap((equipo) => equipo.miembros));
  const sinEquipo = estudiantes.filter((persona) => !enEquipo.has(persona.id));
  const nombreDe = (id: string) => estudiantes.find((persona) => persona.id === id);
  const opcionesMover = [{ valor: SIN_EQUIPO, etiqueta: 'Sin equipo' }, ...equipos.map((equipo) => ({ valor: equipo.id, etiqueta: equipo.nombre }))];

  const fila = (persona: PersonaCurso, actual: string) => (
    <li key={persona.id}>
      <span className="avatar avatar--verde">{(persona.nombre ?? persona.correo).slice(0, 2).toUpperCase()}</span>
      <div><strong>{persona.nombre ?? persona.correo}</strong><small>{persona.usuario ? `@${persona.usuario}` : 'Aún no completa su perfil'}</small></div>
      <Selector valor={actual} opciones={opcionesMover} alCambiar={(destino) => void mover(persona.id, destino)} etiqueta={`Equipo de ${persona.nombre ?? persona.correo}`} />
    </li>
  );

  return (
    <Pantalla rol="docente" clase="p-d7">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Por trabajo" titulo="Equipos" subtitulo="Cada trabajo define su tamaño; sorteas y luego ajustas a mano." objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar los equipos. <button onClick={() => void cargarCurso()}>Reintentar</button></p>}
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {trabajos?.length === 0 && <Tarjeta kicker="Primer paso" titulo="Publica los trabajos"><p className="meta">Agrégalos en <a href={rutaCurso('#/d14') ?? '#/d14'}><u>Trabajos</u></a> para poder formar equipos.</p></Tarjeta>}
          {trabajo && trabajos && (
            <>
              <Tarjeta kicker="Trabajo" titulo="Tamaño del equipo">
                <Selector valor={trabajo.id} opciones={trabajos.map((candidato) => ({ valor: candidato.id, etiqueta: `${candidato.nombre}${candidato.tamanoEquipo ? ` · equipos de ${candidato.tamanoEquipo}` : ' · individual'}` }))} alCambiar={setTrabajoId} etiqueta="Trabajo" />
                <div className="d13__fila">
                  <label className="d14__etiqueta">Personas por equipo (vacío = individual)<input className="d13__campo" type="number" min={2} max={8} value={tamano} onChange={(evento) => setTamano(evento.target.value)} /></label>
                  <button className="acceso__boton" onClick={() => void guardarTamano()}>Guardar tamaño</button>
                </div>
              </Tarjeta>
              {trabajo.tamanoEquipo !== null && (
                <>
                  <Tarjeta tono="menta" kicker="Sorteo" titulo={equipos.length > 0 ? `${equipos.length} equipos` : 'Aún sin equipos'} accion={equipos.length > 0 ? <Estado tipo="ok">Formados</Estado> : <Estado tipo="tarde">Pendiente</Estado>}>
                    <p className="meta">{estudiantes.length} estudiantes en equipos de {trabajo.tamanoEquipo}. Si no se reparte exacto, algunos equipos quedan con uno menos.</p>
                    <div className="acciones"><button className="boton boton--accent" disabled={estudiantes.length === 0} onClick={() => void sortear()}>{equipos.length > 0 ? 'Sortear de nuevo' : 'Sortear equipos'}</button></div>
                  </Tarjeta>
                  <div className="d7__equipos">
                    {equipos.map((equipo) => (
                      <Tarjeta key={equipo.id} titulo={equipo.nombre} accion={<Estado tipo="info">{equipo.miembros.length} {equipo.miembros.length === 1 ? 'persona' : 'personas'}</Estado>}>
                        <ul className="d7__miembros">{equipo.miembros.map((id) => nombreDe(id)).filter((persona): persona is PersonaCurso => persona !== undefined).map((persona) => fila(persona, equipo.id))}</ul>
                      </Tarjeta>
                    ))}
                    {equipos.length > 0 && sinEquipo.length > 0 && (
                      <Tarjeta tono="aviso" kicker="Sin equipo" titulo={`${sinEquipo.length} estudiantes`}>
                        <ul className="d7__miembros">{sinEquipo.map((persona) => fila(persona, SIN_EQUIPO))}</ul>
                      </Tarjeta>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
