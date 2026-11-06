import { inicioDeRol, rolDeRuta, type Rol } from '../compartido/navegacion/navegacion';
import { Jaguar } from '../compartido/ui/Jaguar';
import { entrarComo, irAlPaso, iniciarRecorrido, siguienteRolSinVer, terminarRecorrido, useEstadoDemo } from './estado';
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
  const salir = `${window.location.pathname}${window.location.hash}`;
  return (
    <div className="barra-demo" role="navigation" aria-label="Demostración">
      <span className="barra-demo__marca">Demo · datos de ejemplo</span>
      <span className="barra-demo__roles" role="group" aria-label="Ver como">
        {ROLES_DEMO.map(({ rol, etiqueta }) => (
          <button key={rol} type="button" aria-pressed={rolActual === rol} onClick={() => entrarComo(rol)}>{etiqueta}</button>
        ))}
      </span>
      {rolActual && enRecorrido !== rolActual ? <button type="button" className="barra-demo__enlace" onClick={() => iniciarRecorrido(rolActual)}>Recorrido</button> : null}
      <a className="barra-demo__enlace" href="#/">Inicio</a>
      <a className="barra-demo__enlace" href={salir}>Salir</a>
    </div>
  );
}

export function RecorridoDemo({ codigo }: { codigo?: string }) {
  const { rol, paso } = useEstadoDemo();
  if (rol === null) return null;
  if (codigo !== undefined && (codigo === '' || rolDeRuta(codigo) !== rol)) return null;
  const pasos = RECORRIDO[rol];
  const actual = pasos[paso];
  const ultimo = paso === pasos.length - 1;
  const otro = ultimo ? siguienteRolSinVer() : null;
  const etiquetaOtro = otro ? ROLES_DEMO.find((candidato) => candidato.rol === otro)?.etiqueta.toLowerCase() : null;
  return (
    <aside className="recorrido-demo" aria-live="polite">
      <Jaguar pose={ultimo ? 'celebra' : 'guia'} ancho={72} clase="recorrido-demo__jaguar" />
      <div className="recorrido-demo__cuerpo">
        <span className="recorrido-demo__paso">Recorrido · {paso + 1} de {pasos.length}</span>
        <h2 className="recorrido-demo__titulo">{actual.titulo}</h2>
        <p className="recorrido-demo__texto">{actual.texto}</p>
        <div className="recorrido-demo__acciones">
          <button type="button" className="boton boton--suave" onClick={terminarRecorrido}>Saltar</button>
          {paso > 0 ? <button type="button" className="boton boton--suave" onClick={() => irAlPaso(paso - 1)}>Anterior</button> : null}
          {ultimo
            ? <button type="button" className="boton boton--accent" onClick={() => { terminarRecorrido(); if (otro) entrarComo(otro); else window.location.hash = inicioDeRol[rol]; }}>{otro ? `Ver como ${etiquetaOtro}` : 'Terminar'}</button>
            : <button type="button" className="boton boton--accent" onClick={() => irAlPaso(paso + 1)}>Siguiente</button>}
        </div>
      </div>
    </aside>
  );
}

export default function ExperienciaDemo({ codigo }: { codigo: string }) {
  return <><BarraDemo codigo={codigo} /><RecorridoDemo codigo={codigo} /></>;
}
