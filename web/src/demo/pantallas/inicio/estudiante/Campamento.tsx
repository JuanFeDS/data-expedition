import { useEffect, useState } from 'react';
import { Jaguar } from '../../../../compartido/ui/Jaguar';
import { IconoSvg, type Icono } from '../../../../compartido/ui/Icono';
import { consejosJaguar, hitosRuta, regionesCurso, semanaActual, totalSemanas, trabajoActual } from '../../../datos';
import { Region } from '../../../../compartido/ui/Region';
import { MenuHoja } from '../../../../compartido/navegacion/Menu';
import { ModalAlbum } from '../../../../funciones/practica/comun/AlbumIsla';
import { Contador, Hoja, Kicker, ModoModal, Pantalla, Pill } from '../../../../compartido/ui/ui';
import { E9Votacion } from '../../formularios/estudiante/Votacion';
import { E10Mision } from '../../equipos/estudiante/Mision';
import { E11Resumen } from '../../../../funciones/progreso/estudiante/Resumen';
import { E12Perfil } from '../../../../funciones/progreso/estudiante/Perfil';

type Modal = 'votacion' | 'resumen' | 'equipo' | 'perfil';

const ACCESOS: { tipo: Icono; etiqueta: string; modal: Modal; color: string; aviso?: string }[] = [
  { tipo: 'votar', etiqueta: 'Votación', modal: 'votacion', color: 'accent', aviso: '1' },
  { tipo: 'resumen', etiqueta: 'Resumen', modal: 'resumen', color: 'mint', aviso: '•' },
  { tipo: 'equipo', etiqueta: 'Equipo', modal: 'equipo', color: 'azul' },
  { tipo: 'perfil', etiqueta: 'Perfil', modal: 'perfil', color: 'claro' },
];

const CONTENIDO_MODAL: Record<Modal, () => React.ReactElement> = { votacion: E9Votacion, resumen: E11Resumen, equipo: E10Mision, perfil: E12Perfil };



function Fogata() {
  return (
    <div className="fogata">
      <span className="fogata__brillo" />
      <svg viewBox="0 0 72 96" fill="none" aria-hidden="true" overflow="visible">
        <path className="fogata__lado fogata__lado--izq" d="M14 52C8 60 6 74 14 84C20 90 26 88 28 84C20 78 18 66 14 52Z" fill="#F4B03A" />
        <path className="fogata__lado fogata__lado--der" d="M58 52C64 60 66 74 58 84C52 90 46 88 44 84C52 78 54 66 58 52Z" fill="#F4B03A" />
        <path className="fogata__llama" d="M36 4C42 24 62 38 60 66C59 84 48 94 36 94C24 94 13 84 12 66C11 48 24 36 36 4Z" fill="#F4B03A" />
        <path className="fogata__interior" d="M36 40C40 54 50 62 48 76C47 86 41 92 36 92C31 92 25 86 24 76C22 62 32 54 36 40Z" fill="#FFD35F" />
        <path className="fogata__nucleo" d="M36 64C39 72 43 76 42 84C41 89 38 91 36 91C34 91 31 89 30 84C29 76 33 72 36 64Z" fill="#FFF0B0" />
        <circle className="fogata__chispa fogata__chispa--1" cx="30" cy="20" r="2.2" fill="#FFD35F" />
        <circle className="fogata__chispa fogata__chispa--2" cx="44" cy="14" r="1.8" fill="#FFF0B0" />
        <circle className="fogata__chispa fogata__chispa--3" cx="37" cy="8" r="1.6" fill="#FFD35F" />
      </svg>
    </div>
  );
}

const PASOS = ['Declara si usaste IA (con o sin IA).', 'Si usaste IA, cuenta tu bitácora: qué pediste, qué aceptaste y qué descartaste.', 'Responde las preguntas de decisión del trabajo.'];

const regionActual = Math.max(0, regionesCurso.findIndex((region) => region.estado === 'actual'));

export function E1HomeEjemplo() {
  const [hoja, setHoja] = useState<'paso' | 'menu' | Modal | null>(null);
  const [vista, setVista] = useState(regionActual);
  const [consejo, setConsejo] = useState(0);
  const [islaAlbum, setIslaAlbum] = useState<string | null>(null);
  const [frase, setFrase] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [pista, setPista] = useState(true);

  useEffect(() => {
    if (!abierto) return;
    const temporizador = setTimeout(() => setAbierto(false), 8000);
    return () => clearTimeout(temporizador);
  }, [abierto, consejo, frase]);

  useEffect(() => {
    if (abierto || !pista) return;
    const temporizador = setTimeout(() => setPista(false), 6000);
    return () => clearTimeout(temporizador);
  }, [abierto, pista]);

  const tocarJaguar = () => {
    setPista(false);
    if (!abierto) setAbierto(true);
    else setConsejo((actual) => (actual + 1) % consejosJaguar.length);
    setFrase(null);
  };
  const cambiarIsla = (indice: number) => {
    setVista(indice);
    setPista(false);
    setFrase(regionesCurso[indice].frase);
    setAbierto(true);
  };
  const cerrar = () => setHoja(null);
  return (
    <Pantalla tono="oscura" clase="pantalla--campamento p-home">
      <div className="camp__fondo" aria-hidden="true">
        <picture>
          <source media="(min-width: 1100px)" srcSet={`${import.meta.env.BASE_URL}fondos/campamento-panoramico.webp`} />
          <img src={`${import.meta.env.BASE_URL}fondos/campamento-sin-fuego.webp`} alt="" />
        </picture>
        <Fogata />
      </div>
      <div className="pantalla__cuerpo camp">
        <div className="camp__arriba">
        <header className="camp__hud">
          <span className="avatar avatar--verde">CR</span>
          <div className="camp__nombre"><strong>Camilo</strong><span>Rol: Analista</span></div>
          <span className="camp__xp"><Contador valor={340} /> XP</span>
          <Pill variante="accent">Semana {semanaActual} de {totalSemanas}</Pill>
        </header>

        <div className="camp__cifras">
          <div><span className="num"><Contador valor={40} />%</span><small>del camino</small></div>
          <div><span className="num"><Contador valor={4.2} decimales={1} /></span><small>promedio</small></div>
          <div><span className="num">+6</span><small>dimensiones</small></div>
        </div>
        </div>

        <div className="camp__zona">
          <Region regiones={regionesCurso} actual={regionActual} vista={vista} alCambiar={cambiarIsla} alAbrirAlbum={(indice) => setIslaAlbum(regionesCurso[indice].nombre)} />
          <div className="camp__guiabox">
            {abierto ? (
              <p className="camp__globo" key={frase ?? consejo} role="status">
                {frase ?? consejosJaguar[consejo]}
                {!frase && <a href="#/tutorial">Ver el tutorial ›</a>}
              </p>
            ) : pista ? (
              <p className="camp__globo camp__globo--mini" key="mini">¿Un consejo?</p>
            ) : null}
            <button className="camp__guia-boton" onClick={tocarJaguar} aria-label="Toca al jaguar para escuchar otro consejo">
              <Jaguar pose={abierto && consejo % 3 === 2 ? 'saluda' : 'guia'} ancho={190} clase="camp__guia" />
            </button>
          </div>
          <nav className="camp__accesos" aria-label="Accesos rápidos">
            {ACCESOS.map((acceso) => (
              <button key={acceso.etiqueta} className="acceso-rapido" onClick={() => setHoja(acceso.modal)}>
                <span className={`acceso-rapido__icono acceso-rapido__icono--${acceso.color}`}>
                  <IconoSvg tipo={acceso.tipo} />
                  {acceso.aviso && <i className="acceso-rapido__aviso">{acceso.aviso}</i>}
                </span>
                <span>{acceso.etiqueta}</span>
              </button>
            ))}
          </nav>
        </div>

        <aside className="camp__lateral" aria-label="Esta semana">
          <Kicker estilo={{ color: 'var(--mint)' }}>Lo que sigue</Kicker>
          <ol>
            {hitosRuta.filter((hito) => hito.estado !== 'hecho').slice(0, 3).map((hito) => (
              <li key={hito.titulo} className={`camp__lateral-${hito.estado}`}>
                <strong>{hito.titulo}</strong>
                <small>{hito.estado === 'actual' ? `Vence el ${trabajoActual.vence.largo}` : hito.kicker}</small>
              </li>
            ))}
          </ol>
          <button className="camp__paso camp__paso--lateral" onClick={() => setHoja('paso')}>
            <small>Siguiente paso · vence {trabajoActual.vence.dia.toLowerCase()} {trabajoActual.vence.numero}</small>
            <strong>Entregar {trabajoActual.titulo}</strong>
          </button>
        </aside>

        <div className="camp__dock">
          <button className="camp__menu" onClick={() => setHoja('menu')} aria-label="Abrir menú"><IconoSvg tipo="menu" tamano={26} /></button>
          <button className="camp__paso" onClick={() => setHoja('paso')}>
            <small>Siguiente paso · vence {trabajoActual.vence.dia.toLowerCase()} {trabajoActual.vence.numero}</small>
            <strong>Entregar {trabajoActual.titulo}</strong>
          </button>
        </div>
      </div>

      <Hoja abierta={hoja === 'paso'} alCerrar={cerrar} titulo="Siguiente paso">
        <Kicker>Tu siguiente paso · semana 4</Kicker>
        <div className="hoja__cabeza">
          <h2 className="titulo">Entrega el {trabajoActual.titulo}</h2>
          <span className="hoja__fecha"><small>{trabajoActual.vence.dia}</small><b>{trabajoActual.vence.numero}</b></span>
        </div>
        <p className="meta">{trabajoActual.tema}. Te quedan 3 días.</p>
        <ol className="hoja__pasos">{PASOS.map((paso) => <li key={paso}>{paso}</li>)}</ol>
        <a href="#/e6"><Pill variante="deep" grande>Empezar la entrega</Pill></a>
      </Hoja>

      {(Object.keys(CONTENIDO_MODAL) as Modal[]).map((modal) => {
        const Contenido = CONTENIDO_MODAL[modal];
        return (
          <Hoja key={modal} abierta={hoja === modal} alCerrar={cerrar} titulo={ACCESOS.find((acceso) => acceso.modal === modal)?.etiqueta ?? ''} clase="hoja--pantalla">
            <ModoModal.Provider value><Contenido /></ModoModal.Provider>
          </Hoja>
        );
      })}

      <ModalAlbum nombreIsla={islaAlbum} ganada={regionesCurso.find((region) => region.nombre === islaAlbum)?.estado === 'hecha'} alCerrar={() => setIslaAlbum(null)} />

      <MenuHoja abierta={hoja === 'menu'} alCerrar={cerrar} omitir="#/home" />
    </Pantalla>
  );
}

