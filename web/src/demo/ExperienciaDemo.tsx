import { useEffect, useRef } from 'react';
import { inicioDeRol, rolDeRuta, type Rol } from '../compartido/navegacion/navegacion';
import { Jaguar } from '../compartido/ui/Jaguar';
import { entrarComo, iniciarRecorrido, irA, marcarExplorado, pendientesDe, siguienteRolSinVer, terminarRecorrido, useEstadoDemo } from './estado';
import { RECORRIDO, ROLES_DEMO } from './recorrido';

const objeto = (nombre: string) => `${import.meta.env.BASE_URL}objetos/${nombre}.webp`;

export function PortadaDemo() {
  return (
    <main className="portada-demo">
      <div className="portada-demo__texto">
        <span className="kicker">Data Expedition · demo</span>
        <h1 className="portada-demo__titulo">Una evaluación que resiste a la IA</h1>
        <p className="portada-demo__sub">Prueba la app como la vería cada persona de tu curso. Los datos son de ejemplo y no se guarda nada.</p>
        <p className="portada-demo__pregunta">¿Quién quieres ser?</p>
        <div className="portada-demo__roles">
          {ROLES_DEMO.map(({ rol, etiqueta, objeto: imagen, promesa }) => (
            <button key={rol} type="button" className="portada-demo__rol" onClick={() => entrarComo(rol)}>
              <img src={objeto(imagen)} alt="" width={64} height={64} />
              <span><strong>{etiqueta}</strong><small>{promesa}</small></span>
            </button>
          ))}
        </div>
        <a className="portada-demo__todas" href="#/todas">Ver todas las pantallas</a>
      </div>
      <Jaguar pose="saluda" ancho={360} clase="portada-demo__jaguar" />
    </main>
  );
}

export function BarraDemo({ codigo }: { codigo: string }) {
  const { rol: enRecorrido } = useEstadoDemo();
  const rolActual: Rol | null = codigo ? rolDeRuta(codigo) : null;
  return (
    <div className="barra-demo" role="navigation" aria-label="Demostración">
      <span className="barra-demo__marca">Demo · datos de ejemplo</span>
      <span className="barra-demo__roles" role="group" aria-label="Ver como">
        {ROLES_DEMO.map(({ rol, etiqueta }) => (
          <button key={rol} type="button" aria-pressed={rolActual === rol} onClick={() => entrarComo(rol)}>{etiqueta}</button>
        ))}
      </span>
      {rolActual && enRecorrido !== rolActual ? <button type="button" className="barra-demo__enlace" onClick={() => iniciarRecorrido(rolActual)}>Recorrido</button> : null}
    </div>
  );
}

export function RecorridoDemo({ codigo }: { codigo?: string }) {
  const { rol, explorados } = useEstadoDemo();
  const visible = rol !== null && (codigo === undefined || (codigo !== '' && rolDeRuta(codigo) === rol));
  const pasos = rol ? RECORRIDO[rol] : [];
  const pendientes = rol ? pendientesDe(rol, explorados) : [];
  const sugerido = pendientes.find((paso) => paso.ruta !== codigo) ?? null;
  const comentario = visible && codigo ? pasos.find((paso) => paso.ruta === codigo && !explorados.includes(paso.ruta)) ?? null : null;

  const comentada = useRef<string | null>(null);
  useEffect(() => {
    const ruta = comentario?.ruta ?? null;
    if (comentada.current && comentada.current !== ruta) marcarExplorado(comentada.current);
    comentada.current = ruta;
  }, [comentario]);

  useEffect(() => {
    if (!visible || !sugerido) return undefined;
    const enlaces = [...document.querySelectorAll(`.lateral__enlace[href="#/${sugerido.ruta}"], .menu-fila[href="#/${sugerido.ruta}"]`)];
    enlaces.forEach((enlace) => enlace.classList.add('sugerido-demo'));
    return () => enlaces.forEach((enlace) => enlace.classList.remove('sugerido-demo'));
  }, [visible, sugerido, codigo]);

  if (!visible || rol === null) return null;
  const hechos = pasos.length - pendientes.length;
  const otro = pendientes.length === 0 ? siguienteRolSinVer() : null;
  const etiquetaOtro = otro ? ROLES_DEMO.find((candidato) => candidato.rol === otro)?.etiqueta.toLowerCase() : null;
  return (
    <aside className="recorrido-demo" aria-live="polite">
      {comentario ? (
        <div className="recorrido-demo__burbuja">
          <Jaguar pose="guia" ancho={64} clase="recorrido-demo__jaguar" />
          <div>
            <h2 className="recorrido-demo__titulo">{comentario.titulo}</h2>
            <p className="recorrido-demo__texto">{comentario.texto}</p>
            <button type="button" className="boton boton--accent" onClick={() => marcarExplorado(comentario.ruta)}>Entendido</button>
          </div>
        </div>
      ) : null}
      <div className="recorrido-demo__barra">
        <span className="recorrido-demo__paso">Recorrido · {hechos} de {pasos.length}</span>
        {sugerido
          ? <button type="button" className="boton boton--suave" onClick={() => irA(sugerido.ruta)}>Ver: {sugerido.titulo}</button>
          : <button type="button" className="boton boton--accent" onClick={() => { terminarRecorrido(); if (otro) entrarComo(otro); else window.location.hash = inicioDeRol[rol]; }}>{otro ? `Ver como ${etiquetaOtro}` : 'Terminar'}</button>}
        <button type="button" className="recorrido-demo__cerrar" onClick={terminarRecorrido} aria-label="Cerrar el recorrido">×</button>
      </div>
    </aside>
  );
}

export default function ExperienciaDemo({ codigo }: { codigo: string }) {
  useEffect(() => {
    document.documentElement.classList.add('modo-demo');
    return () => document.documentElement.classList.remove('modo-demo');
  }, []);
  return <><BarraDemo codigo={codigo} /><RecorridoDemo codigo={codigo} /></>;
}
