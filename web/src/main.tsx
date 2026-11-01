import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarraLateral } from './componentes/BarraLateral';
import { useAjusteAltura } from './componentes/ajusteAltura';
import { ModoViva } from './componentes/ui';
import { PANTALLAS } from './registro';
import './estilos.css';
import './pantallas.css';
import './escritorio.css';

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
  useEffect(() => {
    const alCambiar = () => setRuta(rutaActual());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  useAjusteAltura(ruta);

  const pantalla = PANTALLAS.find((candidata) => candidata.codigo === ruta);
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

createRoot(document.getElementById('raiz')!).render(<StrictMode><App /></StrictMode>);
