import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { useCurso, useRutaCurso } from '../../../compartido/estado/curso';
import { BarraDato, Dato, Estado, Tarjeta } from '../../../compartido/ui/panel';
import { Pantalla } from '../../../compartido/ui/ui';
import { resumenAgregado, type ResumenAgregado } from '../../../servicios/agregados';

function useAgregado() {
  const { curso } = useCurso();
  const [datos, setDatos] = useState<ResumenAgregado | null>(null);
  const [fallo, setFallo] = useState(false);
  useEffect(() => {
    if (!curso) return;
    resumenAgregado(curso.id).then(setDatos).catch(() => setFallo(true));
  }, [curso]);
  return { curso, datos, fallo };
}

function Oculto({ datos }: { datos: ResumenAgregado }) {
  return (
    <Tarjeta tono="aviso" kicker="Privacidad" titulo="Aún no se muestra">
      <p className="meta o1__oculto">Para proteger la identidad, los datos aparecen cuando el curso tiene al menos {datos.minimo} estudiantes. Hoy hay {datos.estudiantes}. Faltan {Math.max(0, datos.minimo - datos.estudiantes)}.</p>
    </Tarjeta>
  );
}

export function O1ResumenReal() {
  const rutaCurso = useRutaCurso();
  const { curso, datos, fallo } = useAgregado();
  const entregadas = datos?.trabajos.reduce((total, trabajo) => total + trabajo.entregadas, 0) ?? 0;
  const aTiempo = datos?.trabajos.reduce((total, trabajo) => total + trabajo.aTiempo, 0) ?? 0;
  const porcentajeATiempo = entregadas > 0 ? Math.round((aTiempo / entregadas) * 100) : null;
  const conRadar = datos?.radar.filter((fila) => fila.ahora !== null) ?? [];
  const radarPromedio = conRadar.length ? Math.round(conRadar.reduce((total, fila) => total + (fila.ahora ?? 0), 0) / conRadar.length) : null;
  return (
    <Pantalla rol="observador" clase="p-o1">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker={`Observación · ${curso?.nombre ?? 'Curso'}`} titulo="Resumen del curso" subtitulo="Solo datos agregados: sin nombres, correos ni textos de entregas." objeto="binoculares" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar el resumen. Intenta de nuevo en un momento.</p>}
          {datos && !datos.visible && <Oculto datos={datos} />}
          {datos?.visible && (
            <>
              <div className="o1__datos rejilla rejilla--3">
                <Tarjeta><Dato valor={porcentajeATiempo === null ? '—' : `${porcentajeATiempo} %`} etiqueta="Entregas a tiempo" nota={`${entregadas} entregas recibidas`} /></Tarjeta>
                <Tarjeta><Dato valor={radarPromedio ?? '—'} etiqueta="Radar promedio" nota="De 0 a 100, entre las dimensiones con datos" /></Tarjeta>
                <Tarjeta tono="oscura"><Dato valor={datos.asistencia === null ? '—' : `${datos.asistencia} %`} etiqueta="Asistencia a las sesiones" nota={datos.asistencia === null ? 'Aún sin suficientes registros' : 'Presentes y justificados'} /></Tarjeta>
              </div>
              <Tarjeta kicker={`${datos.estudiantes} estudiantes`} titulo="Entregas por trabajo" accion={<Estado tipo="ok">Mínimo de {datos.minimo} cumplido</Estado>}>
                {datos.trabajos.map((trabajo) => <BarraDato key={trabajo.nombre} etiqueta={trabajo.nombre} valor={Math.round((trabajo.aTiempo / datos.estudiantes) * 100)} />)}
                {datos.trabajos.length === 0 && <p className="meta">Aún no hay trabajos publicados.</p>}
              </Tarjeta>
            </>
          )}
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Qué puedes ver', texto: 'Ver las reglas', ruta: rutaCurso('#/o3') ?? '#/o3' }} />
    </Pantalla>
  );
}

export function O2DimensionesReal() {
  const rutaCurso = useRutaCurso();
  const { datos, fallo } = useAgregado();
  const bandas = (notas: NonNullable<ResumenAgregado['trabajos'][number]['notas']>) => [
    { etiqueta: '1.0 a 2.9', valor: notas.bajas, alerta: true }, { etiqueta: '3.0 a 3.9', valor: notas.medias },
    { etiqueta: '4.0 a 4.5', valor: notas.altas }, { etiqueta: '4.6 a 5.0', valor: notas.excelentes },
  ];
  const conNotas = datos?.trabajos.filter((trabajo) => trabajo.notas) ?? [];
  return (
    <Pantalla rol="observador" clase="p-o2">
      <div className="pantalla__cuerpo">
        <CabeceraMundo kicker="Avance del curso" titulo="Dimensiones y trabajos" subtitulo="Cada dato necesita al menos 5 personas para mostrarse." objeto="mapa" />
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar los datos. Intenta de nuevo en un momento.</p>}
          {datos && !datos.visible && <Oculto datos={datos} />}
          {datos?.visible && (
            <div className="o2__columnas">
              <Tarjeta kicker="Radar promedio, de 0 a 100" titulo="Por dimensión" accion={<Estado tipo="info">Entrada y ahora</Estado>}>
                {datos.radar.map((dimension) => (
                  <div className="d2__fila" key={dimension.nombre}>
                    {dimension.ahora !== null ? <BarraDato etiqueta={dimension.nombre} valor={dimension.ahora} sufijo="" /> : <p className="meta">{dimension.nombre}: aún sin 5 personas con datos</p>}
                    {dimension.entrada !== null && <BarraDato etiqueta="entrada" valor={dimension.entrada} sufijo="" tono="azul" />}
                  </div>
                ))}
              </Tarjeta>
              <div className="o2__lado">
                {conNotas.map((trabajo) => (
                  <Tarjeta key={trabajo.nombre} kicker="Notas, todo el curso" titulo={`${trabajo.nombre}: distribución`}>
                    {(() => { const lista = bandas(trabajo.notas!); const total = lista.reduce((suma, banda) => suma + banda.valor, 0) || 1; return lista.map((banda) => <BarraDato key={banda.etiqueta} etiqueta={banda.etiqueta} valor={Math.round((banda.valor / total) * 100)} tono={banda.alerta ? 'alerta' : undefined} />); })()}
                  </Tarjeta>
                ))}
                {conNotas.length === 0 && <Tarjeta kicker="Notas" titulo="Aún sin distribución"><p className="meta">Se muestra cuando al menos {datos.minimo} entregas de un trabajo estén calificadas.</p></Tarjeta>}
              </div>
            </div>
          )}
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Datos agregados', texto: 'Volver al resumen', ruta: rutaCurso('#/o1') ?? '#/o1' }} />
    </Pantalla>
  );
}
