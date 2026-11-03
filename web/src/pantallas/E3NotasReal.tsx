import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { Isla } from '../componentes/Region';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Contador, Pantalla, Pill } from '../componentes/ui';
import { useServicioTrabajos, type EntregaPropia, type TrabajoCurso } from '../servicios/trabajos';
import { BIOMA_POR_SEMANA } from '../componentes/biomas';

export function E3NotasReal() {
  const servicio = useServicioTrabajos();
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [trabajos, setTrabajos] = useState<TrabajoCurso[] | null>(null);
  const [entregas, setEntregas] = useState<EntregaPropia[]>([]);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    Promise.all([servicio.cargarTrabajos(curso.id), servicio.misEntregas(curso.id)])
      .then(([lista, propias]) => { setTrabajos(lista); setEntregas(propias); })
      .catch(() => setFallo(true));
  }, [servicio, curso]);

  const entregaDe = (trabajoId: string) => entregas.find((entrega) => entrega.trabajoId === trabajoId && entrega.estado !== 'borrador');
  const notas = (trabajos ?? []).map((trabajo) => entregaDe(trabajo.id)?.nota).filter((nota): nota is number => typeof nota === 'number');
  const promedio = notas.length > 0 ? notas.reduce((suma, nota) => suma + nota, 0) / notas.length : 0;

  return (
    <Pantalla clase="p-e3">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker="Notas" titulo="Tus trabajos" objeto="trofeo">
          <div className="cifra-mundo">
            <span className="num">{notas.length > 0 ? <Contador valor={promedio} decimales={1} /> : '—'}</span>
            <small>promedio hasta ahora<br />{notas.length} de {trabajos?.length ?? 0} calificados</small>
          </div>
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar tus notas. Intenta de nuevo en un momento.</p>}
          {trabajos?.length === 0 && <p className="meta">Aún no hay trabajos publicados en este curso.</p>}
          {trabajos?.map((trabajo) => {
            const entrega = entregaDe(trabajo.id);
            const calificada = entrega?.estado === 'calificada';
            const contenido = (
              <>
                <span className={`isla-mini ${entrega ? '' : 'isla-mini--pendiente'}`}><Isla bioma={BIOMA_POR_SEMANA[trabajo.semana ?? 1] ?? 'selva'} /></span>
                <div className="fila__texto">
                  <strong>{trabajo.nombre}</strong>
                  <span className="meta">{trabajo.semana ? `Semana ${trabajo.semana} · ` : ''}{trabajo.tema || 'Sin tema'}{calificada ? ' · ver rúbrica' : ''}</span>
                  <div className="chips">
                    {entrega ? <Pill variante={entrega.modoIa === 'con_ia' ? 'suave' : 'azul'} pequena>{entrega.modoIa === 'con_ia' ? 'Con IA' : 'Sin IA'}</Pill> : <Pill variante="accent" pequena>Por entregar</Pill>}
                    {entrega && !calificada && <Pill variante="suave" pequena>En revisión</Pill>}
                  </div>
                </div>
                <span className={`fila__nota ${calificada ? '' : 'fila__nota--atenuada'}`}>{calificada && entrega.nota !== null ? entrega.nota.toFixed(1) : '—'}</span>
              </>
            );
            return calificada
              ? <a className="fila" key={trabajo.id} href={`${rutaCurso('#/e4')}?trabajo=${trabajo.id}`}>{contenido}</a>
              : <div className="fila" key={trabajo.id}>{contenido}</div>;
          })}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
