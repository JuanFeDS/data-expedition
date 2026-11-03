import { useCurso } from '../estado/curso';
import { useDesbloqueos } from '../estado/desbloqueos';

export function RutaProgreso() {
  const { dentro } = useCurso();
  const { ruta, mostrarTodo, alternarMostrarTodo } = useDesbloqueos();
  if (!ruta || !dentro) return null;
  const porcentaje = Math.round((ruta.abiertas / ruta.total) * 100);
  return (
    <div className="ruta-progreso">
      <div className="ruta-progreso__cab"><strong>Tu ruta</strong><small>{ruta.abiertas} de {ruta.total} exploradas</small></div>
      <div className="ruta-progreso__barra" role="progressbar" aria-valuenow={ruta.abiertas} aria-valuemax={ruta.total} aria-label="Secciones abiertas"><i style={{ width: `${porcentaje}%` }} /></div>
      <label className="ruta-progreso__todo"><input type="checkbox" checked={mostrarTodo} onChange={alternarMostrarTodo} /> Mostrar todo</label>
    </div>
  );
}
