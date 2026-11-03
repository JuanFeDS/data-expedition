import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Kicker, Pantalla } from '../componentes/ui';
import { miResumenSemanal, type ResumenSemanal } from '../servicios/estudiante';
import { META_XP_SEMANA, miPractica, type ResumenPractica } from '../servicios/practica';
import { formatoFecha, trabajoPorEntregar, useServicioTrabajos, type EntregaPropia, type TrabajoCurso } from '../servicios/trabajos';

const MAXIMO = 10;

export function E11ResumenReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const servicio = useServicioTrabajos();
  const [resumen, setResumen] = useState<ResumenSemanal | null>(null);
  const [practica, setPractica] = useState<ResumenPractica | null>(null);
  const [trabajos, setTrabajos] = useState<TrabajoCurso[]>([]);
  const [entregas, setEntregas] = useState<EntregaPropia[]>([]);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    Promise.all([miResumenSemanal(curso.id), miPractica(curso.id), servicio.cargarTrabajos(curso.id), servicio.misEntregas(curso.id)])
      .then(([datos, deLaSemana, deTrabajos, propias]) => { setResumen(datos); setPractica(deLaSemana); setTrabajos(deTrabajos); setEntregas(propias); })
      .catch(() => setFallo(true));
  }, [curso, servicio]);

  const pendiente = trabajoPorEntregar(trabajos, entregas);
  const faltaXp = Math.max(0, META_XP_SEMANA - (practica?.xpSemana ?? 0));
  const tareas = [
    ...(pendiente ? [{ titulo: `Entrega ${pendiente.nombre}`, detalle: `Vence el ${formatoFecha(pendiente.venceEn).largo}. Declara si usaste IA.`, ruta: `${rutaCurso('#/trabajo')}?trabajo=${pendiente.id}` }] : []),
    { titulo: faltaXp > 0 ? 'Haz una sesión de práctica' : '¡Meta de XP cumplida!', detalle: faltaXp > 0 ? `Te faltan ${faltaXp} XP para tu meta de la semana.` : 'Sigue practicando para mantener la racha.', ruta: rutaCurso('#/e15') ?? '#/e15' },
  ];

  return (
    <Pantalla clase="p-e11">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker={curso?.nombre ?? 'Tu semana'} titulo="Tu semana en una página" objeto="carta" />
        <div className="contenido cuerpo-mundo centrar resumen__real">
          {fallo && <p className="acceso__error" role="alert">No pudimos armar tu resumen. Intenta de nuevo en un momento.</p>}
          <Kicker>Lo que subió</Kicker>
          <div className="resumen__subidas">
            {resumen?.subidas.map((fila) => (
              <div className="resumen__subida" key={fila.nombre}>
                <span>{fila.nombre}</span>
                <div className="resumen__barra"><i style={{ width: `${Math.min(100, (fila.cambio / MAXIMO) * 100)}%` }} /></div>
                <strong>+{fila.cambio}</strong>
              </div>
            ))}
            {resumen && resumen.subidas.length === 0 && <p className="meta">{resumen.hayEvidencias ? 'Esta semana tu radar se mantuvo. Una sesión de práctica lo mueve.' : 'Aún no hay movimiento en tu radar: se llena con tus notas, tu diagnóstico y tu práctica.'}</p>}
          </div>

          <hr className="sep" />
          <Kicker estilo={{ color: 'var(--secondary)' }}>A vigilar</Kicker>
          {resumen?.vigilar ? (
            <div className="resumen__vigilar">
              <span className="num">{resumen.vigilar.valor}</span>
              <div>
                <strong className="titulo">{resumen.vigilar.nombre}</strong>
                <p className="meta">Es tu dimensión más baja hoy. Practicarla es la forma más rápida de subir tu radar.</p>
              </div>
            </div>
          ) : <p className="meta">Todavía no hay una dimensión que vigilar.</p>}

          <hr className="sep" />
          <Kicker>Esta semana</Kicker>
          <ol className="resumen__tareas">
            {tareas.map((tarea, indice) => (
              <li key={tarea.titulo}>
                <a href={tarea.ruta}>
                  <b>{indice + 1}</b>
                  <span><strong>{tarea.titulo}</strong><small>{tarea.detalle}</small></span>
                  <i aria-hidden="true">›</i>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Para esta semana', texto: 'Ir a practicar', ruta: rutaCurso('#/e15') ?? '#/e15' }} />
    </Pantalla>
  );
}
