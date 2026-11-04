import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarraLateral } from '../compartido/navegacion/BarraLateral';
import { CONECTADAS, ENCURSO, RUTAS_COMUNES, analizarRuta, rolDeRuta, rutaDeCurso } from '../compartido/navegacion/navegacion';
import { ActividadProvider } from '../compartido/estado/actividad';
import { ConfirmarProvider } from '../compartido/estado/confirmar';
import { DesbloqueosProvider } from '../compartido/estado/desbloqueos';
import { CursoProvider, useCurso } from '../compartido/estado/curso';
import { InicioSinCurso } from '../funciones/inicio/comun/Inicio';
import { SesionProvider, useSesion } from '../compartido/estado/sesion';
import { instalarReporteDeErrores } from '../servicios/errores';
import { instalarSonidoDeClic } from '../compartido/ui/sonidos';
import { LimiteDeErrores, PantallaCargada } from '../compartido/ui/LimiteDeErrores';
import { ModoViva } from '../compartido/ui/ui';
import { Cargando, CompletarPerfil, INICIO_REAL, InsigniaDemo, OtroRol, SinDatos } from '../funciones/acceso/comun/EstadosDeAcceso';
import { PANTALLAS } from './registro';
import '../estilos/estilos.css';
import '../estilos/pantallas.css';
import '../estilos/escritorio.css';

instalarSonidoDeClic();
instalarReporteDeErrores();

if (window.location.search.includes('completo')) document.documentElement.classList.add('modo-completo');

function rutaActual() {
  return window.location.hash.replace(/^#\/?/, '') || 'todas';
}

function Galeria() {
  const grupos = [...new Set(PANTALLAS.map((pantalla) => pantalla.grupo))];
  return (
    <main className="galeria">
      <h1>data-expedicion · pantallas</h1>
      <p className="meta">Prototipos con datos de ejemplo. Toca una pantalla para abrirla a tamaño real.</p>
      {grupos.map((grupo) => (
        <section key={grupo}>
          <h2 className="galeria__grupo">{grupo}</h2>
          <div className="galeria__rejilla">
            {PANTALLAS.filter((pantalla) => pantalla.grupo === grupo).map(({ codigo, titulo, componente: Componente }) => (
              <div className="galeria__item" key={codigo}>
                <a href={`#/${codigo}`}>{codigo.toUpperCase()} · {titulo}</a>
                <PantallaCargada componente={Componente} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

function App() {
  const [ruta, setRuta] = useState(rutaActual);
  const { modoDemo, cargando, persona } = useSesion();
  const { cargando: cargandoCursos, cursos, reciente } = useCurso();
  useEffect(() => {
    const alCambiar = () => setRuta(rutaActual());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  const { cursoId, codigo } = analizarRuta(ruta);
  const pantalla = PANTALLAS.find((candidata) => candidata.codigo === codigo);
  const inicio = persona ? INICIO_REAL[persona.rol] : '#/e0';
  const perfilCompleto = Boolean(persona?.nombre && persona.usuario);
  const esDeCurso = ENCURSO.has(codigo);

  let destino: string | null = null;
  if (!modoDemo && persona !== null && perfilCompleto) {
    if (!pantalla || codigo === 'e0') destino = inicio;
    else if (esDeCurso && !cargandoCursos) {
      if (!cursoId) destino = reciente ? rutaDeCurso(reciente.id, codigo) : '#/cursos';
      else if (!cursos.some((candidato) => candidato.id === cursoId)) destino = '#/cursos';
    }
  }

  useEffect(() => {
    if (destino) window.location.hash = destino;
  }, [destino]);

  if (modoDemo) {
    if (!pantalla) return <><InsigniaDemo /><Galeria /></>;
    const Componente = pantalla.componente;
    return (
      <ModoViva.Provider value>
        <InsigniaDemo />
        <div className="escenario">
          <BarraLateral ruta={codigo} />
          <PantallaCargada componente={Componente} />
        </div>
      </ModoViva.Provider>
    );
  }

  if (cargando || destino) return <Cargando />;

  if (!persona) {
    const Acceso = PANTALLAS.find((candidata) => candidata.codigo === 'e0')!.componente;
    return (
      <ModoViva.Provider value>
        <div className="escenario escenario--sin-barra"><PantallaCargada componente={Acceso} /></div>
      </ModoViva.Provider>
    );
  }

  if (!persona.nombre || !persona.usuario) {
    return (
      <ModoViva.Provider value>
        <div className="escenario escenario--sin-barra"><CompletarPerfil /></div>
      </ModoViva.Provider>
    );
  }

  if (cargandoCursos && (persona.rol !== 'docente' || esDeCurso)) return <Cargando />;

  if (persona.rol !== 'docente' && cursos.length === 0) {
    return (
      <ModoViva.Provider value>
        <div className="escenario escenario--sin-barra"><InicioSinCurso /></div>
      </ModoViva.Provider>
    );
  }

  if (!pantalla) return <Cargando />;
  const Componente = pantalla.componente;
  const permitido = RUTAS_COMUNES.has(codigo) || rolDeRuta(codigo) === persona.rol;
  return (
    <ModoViva.Provider value>
      <div className="escenario">
        <BarraLateral ruta={permitido ? codigo : inicio.replace('#/', '')} />
        {!permitido ? <OtroRol rol={persona.rol} /> : CONECTADAS.has(codigo) ? <PantallaCargada componente={Componente} /> : <SinDatos rol={persona.rol} />}
      </div>
    </ModoViva.Provider>
  );
}

createRoot(document.getElementById('raiz')!).render(<StrictMode><SesionProvider><CursoProvider><ActividadProvider><DesbloqueosProvider><ConfirmarProvider><LimiteDeErrores><App /></LimiteDeErrores></ConfirmarProvider></DesbloqueosProvider></ActividadProvider></CursoProvider></SesionProvider></StrictMode>);
