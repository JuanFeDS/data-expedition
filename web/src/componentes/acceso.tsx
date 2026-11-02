import { inicioDeRol, type Rol } from './navegacion';
import { Vacio } from './panel';
import { Pantalla } from './ui';

export function Cargando() {
  return (
    <div className="cargando" role="status" aria-label="Cargando">
      <span className="cargando__rueda" aria-hidden="true" />
      <span>Entrando a la expedición…</span>
    </div>
  );
}

export function OtroRol({ rol }: { rol: Rol }) {
  return (
    <Pantalla clase="p-e26">
      <div className="pantalla__cuerpo contenido panel" style={{ justifyContent: 'center' }}>
        <Vacio
          titulo="Esta pantalla es de otro rol"
          texto="Con tu cuenta no puedes abrirla. Si crees que es un error, avisa a tu docente."
          pose="pensando"
          accion={<a className="boton boton--suave" href={inicioDeRol[rol]}>Volver a mi inicio</a>}
        />
      </div>
    </Pantalla>
  );
}
