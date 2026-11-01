import { IconoSvg, type Icono } from './Icono';
import { Hoja, Kicker } from './ui';

interface OpcionMenu {
  tipo: Icono;
  etiqueta: string;
  detalle: string;
  ruta: string;
  color: string;
}

export const OPCIONES_MENU: OpcionMenu[] = [
  { tipo: 'inicio', etiqueta: 'Inicio', detalle: 'Tu campamento y la isla de la semana', ruta: '#/home', color: 'claro' },
  { tipo: 'ruta', etiqueta: 'Ruta', detalle: 'Tu recorrido por el curso', ruta: '#/e1', color: 'mint' },
  { tipo: 'radar', etiqueta: 'Radar', detalle: 'Cómo vas frente a tu punto de partida', ruta: '#/e2', color: 'accent' },
  { tipo: 'notas', etiqueta: 'Notas', detalle: 'Tus trabajos y retroalimentación', ruta: '#/e3', color: 'azul' },
  { tipo: 'entregas', etiqueta: 'Entregas', detalle: 'Pendientes y entregadas', ruta: '#/e5', color: 'mint' },
  { tipo: 'leccion', etiqueta: 'Practicar', detalle: 'Tu álbum de la expedición', ruta: '#/e15', color: 'accent' },
  { tipo: 'ayuda', etiqueta: 'Tutorial', detalle: 'Cómo se usa la expedición', ruta: '#/tutorial', color: 'azul' },
];

export function MenuHoja({ abierta, alCerrar, omitir }: { abierta: boolean; alCerrar: () => void; omitir?: string }) {
  return (
    <Hoja abierta={abierta} alCerrar={alCerrar} titulo="Menú">
      <Kicker>Explorar</Kicker>
      <nav className="hoja__menu">
        {OPCIONES_MENU.filter((opcion) => opcion.ruta !== omitir).map((opcion) => (
          <a key={opcion.etiqueta} href={opcion.ruta} className="menu-fila">
            <span className={`acceso-rapido__icono acceso-rapido__icono--${opcion.color}`}><IconoSvg tipo={opcion.tipo} /></span>
            <span className="menu-fila__texto"><strong>{opcion.etiqueta}</strong><small>{opcion.detalle}</small></span>
            <span aria-hidden="true">›</span>
          </a>
        ))}
      </nav>
    </Hoja>
  );
}
