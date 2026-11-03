import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { parametroDeRuta } from '../componentes/navegacion';
import { Estado, Tabla, Tarjeta } from '../componentes/panel';
import { Pantalla } from '../componentes/ui';
import { fechaCorta, horaLocal, listarRecursos, sesionPorId, type Recurso, type Sesion } from '../servicios/calendario';

export function E23SesionReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const sesionId = parametroDeRuta('sesion');
  const volver = rutaCurso('#/e22') ?? '#/e22';
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'vacio' | 'fallo'>('cargando');

  useEffect(() => {
    if (!sesionId || !curso) { setEstado(sesionId ? 'cargando' : 'vacio'); return; }
    let activo = true;
    Promise.all([sesionPorId(sesionId), listarRecursos(curso.id)]).then(([encontrada, todos]) => {
      if (!activo) return;
      setSesion(encontrada);
      setRecursos(todos.filter((recurso) => recurso.sesionId === sesionId));
      setEstado(encontrada ? 'listo' : 'vacio');
    }).catch(() => { if (activo) setEstado('fallo'); });
    return () => { activo = false; };
  }, [sesionId, curso]);

  return (
    <Pantalla clase="p-e23">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Calendario', ruta: volver }} kicker={sesion ? `${sesion.codigo} · ${fechaCorta(sesion.iniciaEn)}${sesion.iniciaEn ? ` · ${horaLocal(sesion.iniciaEn)}` : ''} · ${sesion.modalidad}` : 'Sesión'} titulo={sesion?.tema ?? 'Sesión'} objeto="mochila" />
        <div className="contenido cuerpo-mundo panel">
          {estado === 'cargando' && <p className="meta">Cargando la sesión…</p>}
          {estado === 'fallo' && <p className="acceso__error" role="alert">No pudimos cargar la sesión. <a href={volver}><u>Volver al calendario</u></a></p>}
          {estado === 'vacio' && <p className="meta">Elige una sesión desde el <a href={volver}><u>calendario</u></a>.</p>}
          {sesion && (
            <div className="ses__columnas">
              <Tarjeta kicker="Cómo corre la sesión" titulo={`${sesion.dinamica.length} momentos`}>
                {sesion.dinamica.length > 0 ? (
                  <Tabla etiqueta="Dinámica de la sesión" columnas={[{ clave: 'min', titulo: 'Min', ancho: '70px' }, { clave: 'dinamica', titulo: 'Dinámica', ancho: '170px' }, { clave: 'detalle', titulo: 'Detalle' }]} filas={sesion.dinamica.map((momento) => ({ ...momento }))} />
                ) : <p className="meta">Tu docente aún no detalla la dinámica de esta sesión.</p>}
              </Tarjeta>
              <Tarjeta kicker={sesion.semana ? `Semana ${sesion.semana}` : 'Sesión'} titulo="Material complementario" accion={<Estado tipo="info">{recursos.length} recursos</Estado>}>
                <ul className="ses__recursos">
                  {recursos.map((recurso) => (
                    <li key={recurso.id} className="recurso">
                      <div className="recurso__cab">
                        <span className={`recurso__idioma recurso__idioma--${recurso.idioma.toLowerCase()}`}>{recurso.idioma}</span>
                        <div><strong>{recurso.enlace ? <a href={recurso.enlace} target="_blank" rel="noreferrer"><u>{recurso.titulo}</u></a> : recurso.titulo}</strong><small>{recurso.tipo}{recurso.gratis ? ' · gratis' : ' · puede ser de pago'}</small></div>
                        {recurso.verificadoEn ? <Estado tipo="ok">Verificado</Estado> : <Estado tipo="tarde">Por verificar</Estado>}
                      </div>
                      {recurso.idioma === 'EN' && recurso.resumen && (
                        <details className="recurso__resumen">
                          <summary>Resumen en español</summary>
                          <p>{recurso.resumen}</p>
                          {recurso.glosario.length > 0 && <ul>{recurso.glosario.map((termino) => <li key={termino}>{termino}</li>)}</ul>}
                        </details>
                      )}
                    </li>
                  ))}
                  {recursos.length === 0 && <li className="recurso"><small>No hay material para esta sesión todavía.</small></li>}
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
