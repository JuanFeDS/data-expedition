import { useEffect, useMemo, useState } from 'react';
import { IconoSvg, type Icono } from '../../../compartido/ui/Icono';
import { Jaguar } from '../../../compartido/ui/Jaguar';
import { MenuHoja } from '../../../compartido/navegacion/Menu';
import { Region } from '../../../compartido/ui/Region';
import { useCurso, useRutaCurso } from '../../../compartido/estado/curso';
import { useSesion } from '../../../compartido/estado/sesion';
import { Contador, Hoja, Kicker, Pantalla, Pill } from '../../../compartido/ui/ui';
import { consejosJaguar } from '../../../demo/datos';
import type { RegionCurso } from '../../../demo/datos';
import { miPerfil, type PerfilEstudiante } from '../../../servicios/estudiante';
import { miRadar, type PuntoRadar } from '../../../servicios/radar';
import { formatoFecha, useServicioTrabajos, type EntregaPropia, type TrabajoCurso } from '../../../servicios/trabajos';

const ACCESOS: { tipo: Icono; etiqueta: string; ruta: string; color: string }[] = [
  { tipo: 'votar', etiqueta: 'En clase', ruta: '#/e20', color: 'accent' },
  { tipo: 'resumen', etiqueta: 'Resumen', ruta: '#/e11', color: 'mint' },
  { tipo: 'equipo', etiqueta: 'Equipo', ruta: '#/e24', color: 'azul' },
  { tipo: 'perfil', etiqueta: 'Perfil', ruta: '#/e12', color: 'claro' },
];
const BIOMAS = ['selva', 'paramo', 'desierto', 'cueva', 'glaciar', 'costa', 'ruinas', 'volcan'] as const;
const PASOS = ['Declara si usaste IA (con o sin IA).', 'Si usaste IA, cuenta tu bitácora: qué pediste, qué aceptaste y qué descartaste.', 'Responde las preguntas de decisión del trabajo.'];

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

export function E1HomeReal() {
  const { persona } = useSesion();
  const { curso } = useCurso();
  const rutaCurso = useRutaCurso();
  const servicio = useServicioTrabajos();
  const [trabajos, setTrabajos] = useState<TrabajoCurso[]>([]);
  const [entregas, setEntregas] = useState<EntregaPropia[]>([]);
  const [perfil, setPerfil] = useState<PerfilEstudiante | null>(null);
  const [radar, setRadar] = useState<PuntoRadar[]>([]);
  const [hoja, setHoja] = useState<'paso' | 'menu' | null>(null);
  const [vista, setVista] = useState<number | null>(null);
  const [consejo, setConsejo] = useState(0);
  const [frase, setFrase] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [pista, setPista] = useState(true);

  useEffect(() => {
    if (!curso) return;
    void Promise.all([servicio.cargarTrabajos(curso.id), servicio.misEntregas(curso.id)]).then(([lista, propias]) => { setTrabajos(lista); setEntregas(propias); }).catch(() => undefined);
    void miPerfil(curso.id).then(setPerfil).catch(() => undefined);
    void miRadar(curso.id).then(setRadar).catch(() => undefined);
  }, [servicio, curso]);

  const regiones = useMemo<RegionCurso[]>(() => {
    const hecho = (id: string) => entregas.some((entrega) => entrega.trabajoId === id && entrega.estado !== 'borrador');
    const indiceActual = trabajos.findIndex((trabajo) => !hecho(trabajo.id));
    return trabajos.map((trabajo, indice) => {
      const estado: RegionCurso['estado'] = hecho(trabajo.id) ? 'hecha' : indice === indiceActual ? 'actual' : 'pendiente';
      const texto = estado === 'hecha' ? `${trabajo.nombre}: ya lo entregaste. ¡Buen trabajo!` : estado === 'actual' ? `Aquí estamos: ${trabajo.nombre}. Vence el ${formatoFecha(trabajo.venceEn).largo}. ¡Tú puedes!` : `${trabajo.nombre} se abre cuando termines el anterior.`;
      return { nombre: trabajo.nombre, modulo: trabajo.tema || 'Trabajo', semanas: String(trabajo.semana ?? indice + 1), bioma: BIOMAS[indice % BIOMAS.length], estado, hitos: [], frase: texto };
    });
  }, [trabajos, entregas]);

  const indiceActual = Math.max(0, regiones.findIndex((region) => region.estado === 'actual'));
  const verIsla = vista ?? indiceActual;
  const actual = regiones.find((region) => region.estado === 'actual');
  const trabajoActual = actual ? trabajos[regiones.indexOf(actual)] : undefined;
  const pendientes = trabajos.filter((_, indice) => regiones[indice]?.estado !== 'hecha').slice(0, 3);
  const notas = entregas.map((entrega) => entrega.nota).filter((nota): nota is number => typeof nota === 'number');
  const promedio = notas.length ? notas.reduce((suma, nota) => suma + nota, 0) / notas.length : null;
  const hechas = regiones.filter((region) => region.estado === 'hecha').length;
  const camino = regiones.length ? Math.round((hechas / regiones.length) * 100) : 0;
  const subieron = radar.filter((punto) => punto.tieneInicio && punto.ahora > punto.inicio).length;
  const vence = formatoFecha(trabajoActual?.venceEn ?? null);
  const nombre = persona?.nombre?.split(' ')[0] ?? persona?.usuario ?? 'Explorador';
  const detalle = (id: string) => `${rutaCurso('#/trabajo')}?trabajo=${id}`;

  useEffect(() => {
    if (!abierto) return undefined;
    const temporizador = setTimeout(() => setAbierto(false), 8000);
    return () => clearTimeout(temporizador);
  }, [abierto, consejo, frase]);

  useEffect(() => {
    if (abierto || !pista) return undefined;
    const temporizador = setTimeout(() => setPista(false), 6000);
    return () => clearTimeout(temporizador);
  }, [abierto, pista]);

  const tocarJaguar = () => {
    setPista(false);
    if (!abierto) setAbierto(true);
    else setConsejo((previo) => (previo + 1) % consejosJaguar.length);
    setFrase(null);
  };
  const cambiarIsla = (indice: number) => {
    setVista(indice);
    setPista(false);
    setFrase(regiones[indice].frase);
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
            <span className="avatar avatar--verde">{(persona?.nombre ?? persona?.usuario ?? 'EX').slice(0, 2).toUpperCase()}</span>
            <div className="camp__nombre"><strong>{nombre}</strong><span>{perfil?.fuerte ? `Fuerte en ${perfil.fuerte.nombre}` : curso?.nombre ?? 'Tu curso'}</span></div>
            <span className="camp__xp"><Contador valor={perfil?.xp ?? 0} /> XP</span>
            <Pill variante="accent">{hechas} de {regiones.length} islas</Pill>
          </header>
          <div className="camp__cifras">
            <div><span className="num"><Contador valor={camino} />%</span><small>del camino</small></div>
            <div><span className="num">{promedio === null ? '—' : <Contador valor={promedio} decimales={1} />}</span><small>promedio</small></div>
            <div><span className="num">+{subieron}</span><small>dimensiones</small></div>
          </div>
        </div>

        <div className="camp__zona">
          {regiones.length > 0 ? (
            <Region regiones={regiones} actual={indiceActual} vista={Math.min(verIsla, regiones.length - 1)} alCambiar={cambiarIsla} rutaMapa={rutaCurso('#/e1') ?? '#/e1'} />
          ) : (
            <div className="region"><div className="region__etiqueta"><strong>Aún no hay islas</strong><small>Tu docente publica los trabajos que forman el mapa.</small></div></div>
          )}
          <div className="camp__guiabox">
            {abierto ? (
              <p className="camp__globo" key={frase ?? consejo} role="status">{frase ?? consejosJaguar[consejo]}</p>
            ) : pista ? (
              <p className="camp__globo camp__globo--mini" key="mini">¿Un consejo?</p>
            ) : null}
            <button className="camp__guia-boton" onClick={tocarJaguar} aria-label="Toca al jaguar para escuchar otro consejo">
              <Jaguar pose={abierto && consejo % 3 === 2 ? 'saluda' : 'guia'} ancho={190} clase="camp__guia" />
            </button>
          </div>
          <nav className="camp__accesos" aria-label="Accesos rápidos">
            {ACCESOS.map((acceso) => (
              <a key={acceso.etiqueta} className="acceso-rapido" href={rutaCurso(acceso.ruta)}>
                <span className={`acceso-rapido__icono acceso-rapido__icono--${acceso.color}`}><IconoSvg tipo={acceso.tipo} /></span>
                <span>{acceso.etiqueta}</span>
              </a>
            ))}
          </nav>
        </div>

        <aside className="camp__lateral" aria-label="Esta semana">
          <Kicker estilo={{ color: 'var(--mint)' }}>Lo que sigue</Kicker>
          <ol>
            {pendientes.map((trabajo, indice) => (
              <li key={trabajo.id} className={indice === 0 ? 'camp__lateral-actual' : 'camp__lateral-bloqueado'}>
                <strong>{trabajo.nombre}</strong>
                <small>{indice === 0 ? `Vence el ${formatoFecha(trabajo.venceEn).largo}` : trabajo.semana ? `Semana ${trabajo.semana}` : 'Más adelante'}</small>
              </li>
            ))}
            {trabajos.length > 0 && pendientes.length === 0 && <li className="camp__lateral-hecho"><strong>¡Entregaste todo!</strong><small>Practica para subir tu radar</small></li>}
          </ol>
          <a className="camp__curso" href={rutaCurso('#/curso')}>Ver el curso completo ›</a>
          {trabajoActual && (
            <button className="camp__paso camp__paso--lateral" onClick={() => setHoja('paso')}>
              <small>Siguiente paso · vence {vence.dia.toLowerCase()} {vence.numero}</small>
              <strong>Entregar {trabajoActual.nombre}</strong>
            </button>
          )}
        </aside>

        <div className="camp__dock">
          <button className="camp__menu" onClick={() => setHoja('menu')} aria-label="Abrir menú"><IconoSvg tipo="menu" tamano={26} /></button>
          {trabajoActual ? (
            <button className="camp__paso" onClick={() => setHoja('paso')}>
              <small>Siguiente paso · vence {vence.dia.toLowerCase()} {vence.numero}</small>
              <strong>Entregar {trabajoActual.nombre}</strong>
            </button>
          ) : (
            <a className="camp__paso" href={rutaCurso('#/e15')}><small>Sin entregas pendientes</small><strong>Ir a practicar</strong></a>
          )}
        </div>
      </div>

      <Hoja abierta={hoja === 'paso'} alCerrar={cerrar} titulo="Siguiente paso">
        {trabajoActual && (
          <>
            <Kicker>Tu siguiente paso{trabajoActual.semana ? ` · semana ${trabajoActual.semana}` : ''}</Kicker>
            <div className="hoja__cabeza">
              <h2 className="titulo">Entrega {trabajoActual.nombre}</h2>
              <span className="hoja__fecha"><small>{vence.dia}</small><b>{vence.numero}</b></span>
            </div>
            <p className="meta">{trabajoActual.tema || 'Pega el enlace de tu PR cuando esté listo'}. Vence el {vence.largo}.</p>
            <ol className="hoja__pasos">{PASOS.map((paso) => <li key={paso}>{paso}</li>)}</ol>
            <a href={rutaCurso('#/e6')}><Pill variante="deep" grande>Empezar la entrega</Pill></a>
            <a className="meta" href={detalle(trabajoActual.id)}><u>Ver qué se pide</u></a>
          </>
        )}
      </Hoja>

      <MenuHoja abierta={hoja === 'menu'} alCerrar={cerrar} omitir="#/home" />
    </Pantalla>
  );
}
