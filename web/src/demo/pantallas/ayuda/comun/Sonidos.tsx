import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { Estado, Tarjeta } from '../../../../compartido/ui/panel';
import { CATEGORIAS, EVENTOS, reproducir } from '../../../../compartido/ui/sonidos';
import { InterruptorSonido, InterruptorSonidoDeClase } from '../../../../compartido/ui/tema';
import { Pantalla, Segmentado } from '../../../../compartido/ui/ui';

const CLAVE = 'sonidos-elegidos';
const ESTILOS = ['Suave', 'Arcade', 'Campana'];

const leer = (): Record<string, number> => {
  try {
    return JSON.parse(window.localStorage.getItem(CLAVE) ?? '{}') as Record<string, number>;
  } catch {
    return {};
  }
};

export function E32Sonidos() {
  const [categoria, setCategoria] = useState(0);
  const [elegidos, setElegidos] = useState<Record<string, number>>(leer);
  const [sonando, setSonando] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(elegidos));
    } catch {
      // sin almacenamiento: la elección vale solo en esta visita
    }
  }, [elegidos]);

  const eventos = EVENTOS.filter((evento) => evento.categoria === CATEGORIAS[categoria]);
  const total = Object.keys(elegidos).length;

  const probar = (idEvento: string, indice: number) => {
    const evento = EVENTOS.find((candidato) => candidato.id === idEvento)!;
    reproducir(evento.variantes[indice].notas);
    setSonando(`${idEvento}-${indice}`);
    window.setTimeout(() => setSonando(null), 700);
  };

  const elegir = (idEvento: string, indice: number) => setElegidos((actuales) => ({ ...actuales, [idEvento]: indice }));
  const elegirEstilo = (indice: number) => setElegidos(Object.fromEntries(EVENTOS.map((evento) => [evento.id, indice])));

  const resumen = EVENTOS.map((evento) => `${evento.nombre}: ${elegidos[evento.id] === undefined ? 'sin elegir' : evento.variantes[elegidos[evento.id]].nombre} (por defecto ${evento.defecto.toLowerCase()})`).join('\n');
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(resumen);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1800);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <Pantalla clase="p-e32">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Tutorial', ruta: '#/tutorial' }} kicker="Para decidir" titulo="Galería de sonidos" subtitulo="Escucha cada momento en tres estilos y elige uno." objeto="brujula" />
        <div className="contenido cuerpo-mundo panel">
          <Segmentado opciones={CATEGORIAS} activa={categoria} alCambiar={setCategoria} />
          <div className="son__columnas">
            <div className="son__rejilla" key={categoria}>
              {eventos.map((evento) => (
                <Tarjeta key={evento.id} kicker={`Por defecto: ${evento.defecto.toLowerCase()}`} titulo={evento.nombre} clase="son__evento">
                  <p className="meta son__cuando">{evento.cuando}</p>
                  <ul className="son__variantes">
                    {evento.variantes.map((variante, indice) => (
                      <li key={variante.nombre} className={`${elegidos[evento.id] === indice ? 'elegida' : ''} ${sonando === `${evento.id}-${indice}` ? 'suena' : ''}`}>
                        <button className="son__play" onClick={() => probar(evento.id, indice)} aria-label={`Escuchar ${variante.nombre}`}>
                          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5-9-5.5Z" fill="currentColor" /></svg>
                        </button>
                        <div><strong>{variante.nombre}</strong><small>{variante.descripcion}</small></div>
                        <button className="son__elegir" aria-pressed={elegidos[evento.id] === indice} onClick={() => elegir(evento.id, indice)}>{elegidos[evento.id] === indice ? 'Elegida' : 'Elegir'}</button>
                      </li>
                    ))}
                  </ul>
                </Tarjeta>
              ))}
            </div>
            <div className="son__lado">
              <Tarjeta kicker="En la app" titulo="Ajustes de sonido">
                <p className="meta">Tu elección ya suena en la app. Los sonidos de clase (relámpago y cuenta regresiva) vienen apagados.</p>
                <div className="acciones"><InterruptorSonido /><InterruptorSonidoDeClase /></div>
              </Tarjeta>
              <Tarjeta tono="menta" kicker="Atajo" titulo="Un estilo para todo">
                <p className="meta">Marca los 12 momentos con el mismo estilo y después cambia los que quieras.</p>
                <div className="acciones">{ESTILOS.map((estilo, indice) => <button key={estilo} className="boton boton--suave" onClick={() => elegirEstilo(indice)}>{estilo}</button>)}</div>
              </Tarjeta>
              <Tarjeta kicker="Tu elección" titulo={`${total} de ${EVENTOS.length}`} accion={<Estado tipo={total === EVENTOS.length ? 'ok' : 'pendiente'}>{total === EVENTOS.length ? 'Completa' : 'En curso'}</Estado>}>
                <ul className="son__resumen">
                  {EVENTOS.map((evento) => <li key={evento.id}><span>{evento.nombre}</span><b>{elegidos[evento.id] === undefined ? '—' : evento.variantes[elegidos[evento.id]].nombre}</b></li>)}
                </ul>
                <button className="boton boton--accent" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar mi elección'}</button>
              </Tarjeta>
            </div>
          </div>
        </div>
      </div>
      <Dock accion={{ etiqueta: `${total} de ${EVENTOS.length} elegidos`, texto: 'Volver al tutorial', ruta: '#/tutorial' }} />
    </Pantalla>
  );
}
