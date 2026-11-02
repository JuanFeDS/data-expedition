import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarraLateral } from './componentes/BarraLateral';
import { useAjusteAltura } from './componentes/ajusteAltura';
import { rolDeRuta } from './componentes/navegacion';
import { SesionProvider, useSesion } from './componentes/sesion';
import { instalarSonidoDeClic } from './componentes/sonidos';
import { ModoViva } from './componentes/ui';
import { Cargando, CompletarPerfil, CONECTADAS, INICIO_REAL, OtroRol, SinDatos } from './componentes/acceso';
import { PANTALLAS } from './registro';
import './estilos.css';
import './pantallas.css';
import './escritorio.css';

instalarSonidoDeClic();

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
                <Componente />
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
  useEffect(() => {
    const alCambiar = () => setRuta(rutaActual());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  useAjusteAltura(ruta);

  const pantalla = PANTALLAS.find((candidata) => candidata.codigo === ruta);
  const inicio = persona ? INICIO_REAL[persona.rol] : '#/e0';
  const perfilCompleto = Boolean(persona?.nombre && persona.usuario);
  const debeRedirigir = !modoDemo && persona !== null && perfilCompleto && (!pantalla || ruta === 'e0');

  useEffect(() => {
    if (debeRedirigir) window.location.hash = inicio;
  }, [debeRedirigir, inicio]);

  if (modoDemo) {
    if (!pantalla) return <Galeria />;
    const Componente = pantalla.componente;
    return (
      <ModoViva.Provider value>
        <div className="escenario">
          <BarraLateral ruta={ruta} />
          <Componente />
        </div>
      </ModoViva.Provider>
    );
  }

  if (cargando || debeRedirigir) return <Cargando />;

  if (!persona) {
    const Acceso = PANTALLAS.find((candidata) => candidata.codigo === 'e0')!.componente;
    return (
      <ModoViva.Provider value>
        <div className="escenario escenario--sin-barra"><Acceso /></div>
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

  if (!pantalla) return <Cargando />;
  const Componente = pantalla.componente;
  const permitido = rolDeRuta(ruta) === persona.rol;
  return (
    <ModoViva.Provider value>
      <div className="escenario">
        <BarraLateral ruta={permitido ? ruta : inicio.replace('#/', '')} />
        {!permitido ? <OtroRol rol={persona.rol} /> : CONECTADAS.has(ruta) ? <Componente /> : <SinDatos rol={persona.rol} />}
      </div>
    </ModoViva.Provider>
  );
}

createRoot(document.getElementById('raiz')!).render(<StrictMode><SesionProvider><App /></SesionProvider></StrictMode>);
