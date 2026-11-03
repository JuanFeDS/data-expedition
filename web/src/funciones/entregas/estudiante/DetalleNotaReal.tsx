import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../compartido/ui/Dock';
import { Jaguar } from '../../../compartido/ui/Jaguar';
import { useRutaCurso } from '../../../compartido/estado/curso';
import { parametroDeRuta } from '../../../compartido/navegacion/navegacion';
import { Contador, Kicker, Niveles, Pantalla, Pill } from '../../../compartido/ui/ui';
import { miEntregaCalificada, type EntregaCalificable } from '../../../servicios/calificaciones';

export function E4NotaReal() {
  const rutaCurso = useRutaCurso();
  const trabajoId = parametroDeRuta('trabajo');
  const volver = rutaCurso('#/e3') ?? '#/e3';
  const [entrega, setEntrega] = useState<EntregaCalificable | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'vacio' | 'fallo'>('cargando');

  useEffect(() => {
    if (!trabajoId) { setEstado('vacio'); return; }
    let activo = true;
    miEntregaCalificada(trabajoId).then((encontrada) => {
      if (!activo) return;
      setEntrega(encontrada?.estado === 'calificada' ? encontrada : null);
      setEstado(encontrada?.estado === 'calificada' ? 'listo' : 'vacio');
    }).catch(() => { if (activo) setEstado('fallo'); });
    return () => { activo = false; };
  }, [trabajoId]);

  return (
    <Pantalla clase="p-e4">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Notas', ruta: volver }} kicker={entrega?.trabajo ?? 'Tu nota'} titulo="Tu nota" objeto="trofeo">
          {entrega && entrega.nota !== null && (
            <div className="cifra-mundo">
              <span className="num"><Contador valor={entrega.nota} decimales={1} /></span>
              <small><Pill variante="accent" pequena>{entrega.modoIa === 'con_ia' ? 'Con IA declarada' : 'Sin IA'}</Pill></small>
            </div>
          )}
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo centrar">
          {estado === 'cargando' && <p className="meta">Cargando tu nota…</p>}
          {estado === 'fallo' && <p className="acceso__error" role="alert">No pudimos cargar tu nota. <a href={volver}><u>Volver a Notas</u></a></p>}
          {estado === 'vacio' && <p className="meta">Este trabajo aún no está calificado. <a href={volver}><u>Volver a Notas</u></a></p>}
          {entrega && (
            <>
              <Kicker>Cómo se calculó</Kicker>
              {entrega.criterios.map((criterio) => {
                const nivel = entrega.niveles[criterio.id];
                return (
                  <div className="criterio" key={criterio.id}>
                    <div className="criterio__texto">
                      <strong>{criterio.nombre}</strong>
                      <span className="meta">{criterio.dimension} · peso {criterio.peso}</span>
                      {nivel !== undefined && <span className="meta">{criterio.descriptores[Math.floor(nivel) - 1]}</span>}
                    </div>
                    {nivel !== undefined && <><Niveles nivel={nivel} /><span className="criterio__valor">{nivel}</span></>}
                  </div>
                );
              })}
              <p className="meta">Regla: promedio de los niveles ponderado por el peso de cada criterio.</p>
              {entrega.retroalimentacion && (
                <div className="retro">
                  <Jaguar pose="saluda" ancho={84} clase="retro__guia" />
                  <div>
                    <Kicker>Retroalimentación</Kicker>
                    <p>{entrega.retroalimentacion}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
