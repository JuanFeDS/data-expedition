import { useState } from 'react';
import { CabeceraMundo } from '../../../../compartido/ui/CabeceraMundo';
import { Dock } from '../../../../compartido/ui/Dock';
import { Dato, Estado, Tabla, Tarjeta } from '../../../../compartido/ui/panel';
import { Pantalla, Segmentado } from '../../../../compartido/ui/ui';
import { recursos } from '../../../datosPlan';

const FILTROS = ['Todos', 'Por verificar', 'En inglés'];

export function D9MaterialEjemplo() {
  const [filtro, setFiltro] = useState(1);
  const [revisado, setRevisado] = useState(false);
  const lista = recursos.filter((recurso) => (filtro === 1 ? !recurso.verificado : filtro === 2 ? recurso.idioma === 'EN' : true));
  const porVerificar = recursos.filter((recurso) => !recurso.verificado).length;
  const ingles = recursos.filter((recurso) => recurso.idioma === 'EN').length;
  return (
    <Pantalla rol="docente" clase="p-d9">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Panel', ruta: '#/d1' }} kicker="Recursos por sesión" titulo="Material" subtitulo="Cada recurso guarda su idioma y su estado de verificación." objeto="cuaderno" />
        <div className="contenido cuerpo-mundo panel">
          <div className="d9__datos rejilla rejilla--3">
            <Tarjeta><Dato valor={recursos.length} etiqueta="Recursos" nota="En las 8 semanas" /></Tarjeta>
            <Tarjeta><Dato valor={porVerificar} etiqueta="Por verificar" nota={revisado ? 'Revisados hace un momento' : 'Antes de preparar la clase'} tono="alerta" /></Tarjeta>
            <Tarjeta><Dato valor={ingles} etiqueta="En inglés [EN]" nota="Con resumen y glosario en español" /></Tarjeta>
          </div>
          <Segmentado opciones={FILTROS} activa={filtro} alCambiar={setFiltro} />
          <Tarjeta kicker={`${lista.length} recursos`} titulo="Lista" accion={<button className="boton boton--suave" onClick={() => setRevisado(true)}>{revisado ? 'Enlaces comprobados' : 'Comprobar enlaces'}</button>}>
            <Tabla
              etiqueta="Recursos"
              columnas={[{ clave: 'titulo', titulo: 'Recurso', ancho: '2.4fr' }, { clave: 'sesion', titulo: 'Sesión', ancho: '70px' }, { clave: 'idioma', titulo: 'Idioma', ancho: '70px' }, { clave: 'gratis', titulo: 'Costo', ancho: '90px' }, { clave: 'estado', titulo: 'Verificación', ancho: '130px' }]}
              filas={lista.map((recurso) => ({
                titulo: <>{recurso.titulo}<small className="d5__cuando">{recurso.tipo}</small></>,
                sesion: recurso.sesion,
                idioma: <span className={`recurso__idioma recurso__idioma--${recurso.idioma.toLowerCase()}`}>{recurso.idioma}</span>,
                gratis: recurso.gratis ? 'Gratis' : 'De pago',
                estado: recurso.verificado ? <Estado tipo="ok">{recurso.fecha}</Estado> : <Estado tipo="tarde">Pendiente</Estado>,
              }))}
            />
          </Tarjeta>
        </div>
      </div>
      <Dock accion={{ etiqueta: `${porVerificar} por verificar`, texto: 'Comprobar enlaces', alPulsar: () => setRevisado(true), deshabilitada: revisado }} />
    </Pantalla>
  );
}

