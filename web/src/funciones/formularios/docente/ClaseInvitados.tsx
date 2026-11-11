import { useCallback, useEffect, useState } from 'react';
import { CodigoQR } from '../../../compartido/ui/CodigoQR';
import { Estado, Tarjeta } from '../../../compartido/ui/panel';
import { REFRESCO_EN_VIVO_MS } from '../../../dominio/reglas';
import { abrirClase, cerrarClase, enlaceDeEntrada, estadoClase, marcadorDeClase, type EstadoClase, type FilaMarcador } from '../../../servicios/invitados';

const FILAS_VISIBLES = 10;

export interface VistaInvitadosProps {
  estado: EstadoClase | null;
  marcador: FilaMarcador[];
  aviso: string | null;
  alAbrir: () => void;
  alCerrar: () => void;
}

export function VistaInvitados({ estado, marcador, aviso, alAbrir, alCerrar }: VistaInvitadosProps) {
  const abierta = Boolean(estado?.abierta && estado.codigo);
  return (
    <div className="invitados__columnas">
      {abierta && estado?.codigo ? (
        <Tarjeta tono="oscura" kicker="Sin registro" titulo="Clase abierta a invitados" accion={<Estado tipo="ok">En vivo</Estado>}>
          <div className="asist__proyeccion">
            <CodigoQR valor={enlaceDeEntrada(estado.codigo)} etiqueta="Código QR para entrar a la clase como invitado" />
            <div className="asist__codigo">
              <strong>{estado.codigo}</strong>
              <small>{estado.invitados} {estado.invitados === 1 ? 'invitado' : 'invitados'} dentro</small>
            </div>
          </div>
          <button className="boton boton--accent" onClick={alCerrar}>Cerrar clase</button>
        </Tarjeta>
      ) : (
        <Tarjeta tono="menta" kicker="Sin registro" titulo="Abre la clase a invitados">
          <p className="meta">Se genera un QR y un código de 5 caracteres. Cada persona entra con solo un apodo, sin correo ni cuenta, y puede responder relámpagos, votaciones y encuestas.</p>
          <div className="acciones"><button className="boton boton--accent" onClick={alAbrir}>Abrir la clase</button></div>
        </Tarjeta>
      )}
      <Tarjeta kicker="Competencia" titulo="Marcador">
        {aviso && <p className="acceso__error" role="alert">{aviso}</p>}
        {marcador.length === 0 ? (
          <p className="meta">Abre un relámpago con respuesta correcta y el marcador se arma solo: 100 puntos por acierto, más hasta 50 por responder rápido.</p>
        ) : (
          <ol className="marcador">
            {marcador.slice(0, FILAS_VISIBLES).map((fila, indice) => (
              <li key={fila.perfilId} className={indice === 0 ? 'marcador__primero' : ''}>
                <b>{indice + 1}</b>
                <span className="marcador__nombre">{fila.apodo}</span>
                <small>{fila.aciertos}/{fila.respondidas}</small>
                <strong>{fila.puntos}</strong>
              </li>
            ))}
          </ol>
        )}
      </Tarjeta>
    </div>
  );
}

export function PanelInvitados({ cursoId }: { cursoId: string }) {
  const [estado, setEstado] = useState<EstadoClase | null>(null);
  const [marcador, setMarcador] = useState<FilaMarcador[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  const refrescar = useCallback(async () => {
    try {
      const actual = await estadoClase(cursoId);
      setEstado(actual);
      setMarcador(actual.abierta ? await marcadorDeClase(cursoId, actual.abiertaEn) : []);
      setAviso(null);
    } catch {
      setAviso('No pudimos actualizar la clase de invitados.');
    }
  }, [cursoId]);

  useEffect(() => { void refrescar(); }, [refrescar]);
  useEffect(() => {
    if (!estado?.abierta) return undefined;
    const reloj = window.setInterval(() => void refrescar(), REFRESCO_EN_VIVO_MS);
    return () => window.clearInterval(reloj);
  }, [estado?.abierta, refrescar]);

  const abrir = async () => {
    try {
      await abrirClase(cursoId);
      await refrescar();
    } catch {
      setAviso('No pudimos abrir la clase. Intenta de nuevo.');
    }
  };

  const cerrar = async () => {
    try {
      await cerrarClase(cursoId);
      await refrescar();
    } catch {
      setAviso('No pudimos cerrar la clase. Intenta de nuevo.');
    }
  };

  return <VistaInvitados estado={estado} marcador={marcador} aviso={aviso} alAbrir={() => void abrir()} alCerrar={() => void cerrar()} />;
}
