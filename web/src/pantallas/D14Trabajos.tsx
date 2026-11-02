import { useCallback, useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import { finDelDia, formatoFecha, useServicioTrabajos, type DatosTrabajos } from '../servicios/trabajos';

const VACIO = { nombre: '', tema: '', semana: '', fecha: '', minPylint: '8' };

export function D14Trabajos() {
  const servicio = useServicioTrabajos();
  const [datos, setDatos] = useState<DatosTrabajos | null>(null);
  const [fallo, setFallo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [formulario, setFormulario] = useState(VACIO);

  const recargar = useCallback(async () => {
    try {
      setDatos(await servicio.cargarTrabajos());
      setFallo(false);
    } catch {
      setFallo(true);
    }
  }, [servicio]);

  useEffect(() => { void recargar(); }, [recargar]);

  const cambiar = (campo: keyof typeof VACIO) => (evento: React.ChangeEvent<HTMLInputElement>) => setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }));

  const crear = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!datos?.edicionId || !formulario.nombre.trim()) return;
    const error = await servicio.crearTrabajo(datos.edicionId, {
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
          {datos && !datos.edicionId && (
            <Tarjeta kicker="Primer paso" titulo="Falta la edición del curso">
              <p className="meta">Créala en <a href="#/d13"><u>Personas</u></a> y vuelve aquí para agregar los trabajos.</p>
            </Tarjeta>
          )}
          {datos?.edicionId && (
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
              <Tarjeta kicker={`${datos.trabajos.length} en la edición`} titulo="Trabajos del curso">
                <ul className="d13__personas">
                  {datos.trabajos.map((trabajo) => (
                    <li key={trabajo.id}>
                      <span className="avatar avatar--verde">{trabajo.semana ?? '·'}</span>
                      <span className="d13__datos"><strong>{trabajo.nombre}</strong><small>{trabajo.tema || 'Sin tema'} · vence {formatoFecha(trabajo.venceEn).largo} · Pylint {trabajo.minPylint}</small></span>
                      <button className="d13__quitar" onClick={() => void quitar(trabajo.id)}>Quitar</button>
                    </li>
                  ))}
                  {datos.trabajos.length === 0 && <li><span className="d13__datos"><small>Aún no hay trabajos.</small></span></li>}
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
