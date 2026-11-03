import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso, useRutaCurso } from '../componentes/curso';
import { Estado, Tarjeta } from '../componentes/panel';
import { Contador, Pantalla, Segmentado } from '../componentes/ui';
import { ligaSemanal, type PuestoLiga } from '../servicios/agregados';

export function E31LigaReal() {
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const [vista, setVista] = useState(0);
  const [lista, setLista] = useState<PuestoLiga[] | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    ligaSemanal(curso.id).then(setLista).catch(() => setFallo(true));
  }, [curso]);

  const puesto = lista ? lista.findIndex((persona) => persona.soyYo) + 1 : 0;
  const maximo = Math.max(1, ...(lista ?? []).map((persona) => persona.xp));
  const yo = lista?.find((persona) => persona.soyYo);
  const lider = lista?.[0];
  const falta = yo && lider && puesto > 1 ? Math.max(0, lider.xp - yo.xp + 1) : 0;

  return (
    <Pantalla clase="p-e31">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker="Modo competitivo · se reinicia el lunes" titulo="Liga de la semana" subtitulo="Solo cuenta el XP de práctica de esta semana. Sin notas." objeto="trofeo">
          {puesto > 0 && <div className="cifra-mundo"><span className="num">{puesto}º</span><small>de {lista?.length} en tu curso</small></div>}
        </CabeceraMundo>
        <div className="contenido cuerpo-mundo panel">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar la liga. Intenta de nuevo en un momento.</p>}
          <Segmentado opciones={['Mi liga', 'Cómo funciona']} activa={vista} alCambiar={setVista} />
          {vista === 0 ? (
            <div className="liga__columnas">
              <Tarjeta kicker="XP de esta semana" titulo="Clasificación" accion={<Estado tipo="info">Se reinicia el lunes</Estado>}>
                <ol className="liga__lista">
                  {lista?.map((persona, indice) => (
                    <li key={persona.usuario + indice} className={`liga__fila ${persona.soyYo ? 'liga__fila--yo' : ''}`} style={{ '--i': indice } as React.CSSProperties}>
                      <b className="liga__puesto">{indice + 1}</b>
                      <span className={`avatar avatar--${persona.soyYo ? 'verde' : 'azul'}`}>{persona.usuario.slice(0, 2).toUpperCase()}</span>
                      <div className="liga__datos">
                        <strong>{persona.soyYo ? 'Tú' : `@${persona.usuario}`}</strong>
                        <span className="liga__barra"><i style={{ width: `${(persona.xp / maximo) * 100}%` }} /></span>
                      </div>
                      <span className="liga__xp"><Contador valor={persona.xp} /> XP</span>
                    </li>
                  ))}
                  {lista && lista.length === 0 && <li><div className="liga__datos"><small>Aún no hay estudiantes en el curso.</small></div></li>}
                </ol>
              </Tarjeta>
              <Tarjeta tono="menta" kicker="Para subir de puesto" titulo={falta > 0 ? `Te faltan ${falta} XP para el primer lugar` : puesto === 1 ? '¡Vas de primero!' : 'Suma XP esta semana'}>
                <p className="meta">Una sesión de práctica da 30 XP. El XP no es nota: es solo para jugar.</p>
                <a className="boton boton--accent" href={rutaCurso('#/e15')}>Practicar ahora</a>
              </Tarjeta>
            </div>
          ) : (
            <div className="liga__columnas">
              <Tarjeta kicker="Reglas" titulo="Una liga por curso">
                <ul className="liga__reglas">
                  <li><b>1</b>Compites con tu curso solo con el XP de práctica de la semana.</li>
                  <li><b>2</b>Se muestra tu nombre de usuario y tu XP, nada más: ni notas ni radar.</li>
                  <li><b>3</b>El lunes se reinicia y todas las personas empiezan de cero.</li>
                  <li><b>4</b>El XP no es nota y no cambia tu evaluación.</li>
                </ul>
              </Tarjeta>
            </div>
          )}
        </div>
      </div>
      <Dock accion={{ etiqueta: 'Esta semana', texto: 'Sumar XP', ruta: rutaCurso('#/e15') ?? '#/e15' }} />
    </Pantalla>
  );
}
