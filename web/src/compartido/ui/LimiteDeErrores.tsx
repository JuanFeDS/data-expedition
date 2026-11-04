import { Component, Suspense, type ComponentType, type ErrorInfo, type ReactNode } from 'react';
import { reportarError } from '../../servicios/errores';
import { Cargando } from '../../funciones/acceso/comun/EstadosDeAcceso';

interface Props { children: ReactNode }
interface Estado { error: Error | null }

const esErrorDeCarga = (error: Error) => /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(error.message);

// Atrapa los fallos de dibujo y de descarga de pantallas para no dejar la página en blanco.
export class LimiteDeErrores extends Component<Props, Estado> {
  override state: Estado = { error: null };

  static getDerivedStateFromError(error: Error): Estado {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    void reportarError('interfaz', error, `\n${info.componentStack ?? ''}`);
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const deCarga = esErrorDeCarga(error);
    return (
      <div className="error-global" role="alert">
        <h1 className="titulo">{deCarga ? 'Hay una versión nueva' : 'Algo salió mal'}</h1>
        <p className="meta">{deCarga ? 'Se publicó una actualización mientras tenías la app abierta. Recarga para usarla.' : 'No pudimos mostrar esta pantalla. Tu avance está guardado.'}</p>
        <div className="acciones">
          <button className="boton boton--accent" onClick={() => window.location.reload()}>Recargar</button>
          <a className="boton boton--suave" href={import.meta.env.BASE_URL}>Ir al inicio</a>
        </div>
      </div>
    );
  }
}

export function PantallaCargada({ componente: Componente }: { componente: ComponentType }) {
  return (
    <LimiteDeErrores>
      <Suspense fallback={<Cargando />}><Componente /></Suspense>
    </LimiteDeErrores>
  );
}
