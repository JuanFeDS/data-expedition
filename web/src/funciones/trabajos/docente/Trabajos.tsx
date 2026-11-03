import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { Tarjeta } from '../../../compartido/ui/panel';
import { Pantalla } from '../../../compartido/ui/ui';
import { useCurso, useRutaCurso } from '../../../compartido/estado/curso';
import { finDelDia, formatoFecha, useServicioTrabajos, type TrabajoCurso } from '../../../servicios/trabajos';

const VACIO = { nombre: '', tema: '', semana: '', fecha: '', minPylint: '8' };

export function D14Trabajos() {
  const servicio = useServicioTrabajos();
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [trabajos, setTrabajos] = useState<TrabajoCurso[] | null>(null);
  const [fallo, setFallo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [formulario, setFormulario] = useState(VACIO);

  const recargar = useCallback(async () => {
    if (!curso) { setTrabajos(null); return; }
    try {
      setTrabajos(await servicio.cargarTrabajos(curso.id));
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [servicio, curso]);

  useEffect(() => { void recargar(); }, [recargar]);

  const cambiar = (campo: keyof typeof VACIO) => (evento: React.ChangeEvent<HTMLInputElement>) => setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }));

  const crear = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!curso || !formulario.nombre.trim()) return;
    const error = await servicio.crearTrabajo(curso.id, {
      nombre: formulario.nombre.trim(),
      tema: formulario.tema.trim(),
      semana: formulario.semana ? Number(formulario.semana) : null,
      venceEn: formulario.fecha ? finDelDia(formulario.fecha) : null,
      minPylint: Number(formulario.minPylint) || 8,
    });
    setAviso(error);
    if (!error) setFormulario(VACIO);
    await recargar();
  };

  const quitar = async (id: string) => {
    setAviso(await servicio.eliminarTrabajo(id));
    await recargar();
  };

  return (
    <Pantalla rol="docente" clase="p-d14">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Ajustes" titulo="Trabajos" subtitulo="Lo que los estudiantes deben entregar, y cuándo." objeto="cuaderno" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar los trabajos. <button onClick={() => void recargar()}>Reintentar</button></p>}
          {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
          {!curso && (
            <Tarjeta kicker="Primer paso" titulo="Falta crear un curso">
              <p className="meta">Créalo en <a href={rutaCurso('#/d13')}><u>Personas</u></a> y vuelve aquí para agregar los trabajos.</p>
            </Tarjeta>
          )}
          {curso && trabajos && (
            <div className="d13__columnas">
              <Tarjeta kicker="Nuevo" titulo="Agregar trabajo">
                <form className="d14__formulario" onSubmit={(evento) => void crear(evento)}>
                  <input className="d13__campo" placeholder="Nombre (Trabajo 3)" value={formulario.nombre} onChange={cambiar('nombre')} aria-label="Nombre del trabajo" />
                  <input className="d13__campo" placeholder="Tema (Mismo análisis en Spark)" value={formulario.tema} onChange={cambiar('tema')} aria-label="Tema" />
                  <div className="d14__par">
                    <label className="d14__etiqueta">Semana<input className="d13__campo" type="number" min={1} max={16} placeholder="4" value={formulario.semana} onChange={cambiar('semana')} /></label>
                    <label className="d14__etiqueta">Pylint mínimo<input className="d13__campo" type="number" min={0} max={10} placeholder="8" value={formulario.minPylint} onChange={cambiar('minPylint')} /></label>
                  </div>
                  <label className="d14__etiqueta">Fecha de entrega<input className="d13__campo" type="date" value={formulario.fecha} onChange={cambiar('fecha')} /></label>
                  <button className="acceso__boton acceso__boton--principal" disabled={!formulario.nombre.trim()}>Agregar trabajo</button>
                </form>
              </Tarjeta>
              <Tarjeta kicker={`${trabajos.length} en ${curso.nombre}`} titulo="Trabajos del curso">
                <ul className="d13__personas">
                  {trabajos.map((trabajo) => (
                    <li key={trabajo.id}>
                      <span className="avatar avatar--verde">{trabajo.semana ?? '·'}</span>
                      <a className="d13__datos trabajo__enlace" href={`${rutaCurso('#/trabajo')}?trabajo=${trabajo.id}`}><strong>{trabajo.nombre}</strong><small>{trabajo.tema || 'Sin tema'} · vence {formatoFecha(trabajo.venceEn).largo} · Pylint {trabajo.minPylint}</small></a>
                      <button className="d13__quitar" onClick={() => void quitar(trabajo.id)}>Quitar</button>
                    </li>
                  ))}
                  {trabajos.length === 0 && <li><span className="d13__datos"><small>Aún no hay trabajos.</small></span></li>}
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
