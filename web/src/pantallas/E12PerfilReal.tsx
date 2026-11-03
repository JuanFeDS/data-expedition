import { useEffect, useState } from 'react';
import { CabeceraMundo } from '../componentes/CabeceraMundo';
import { Dock } from '../componentes/Dock';
import { useCurso } from '../componentes/curso';
import { XP_POR_NIVEL } from '../config';
import { useSesion } from '../componentes/sesion';
import { Contador, Kicker, Pantalla } from '../componentes/ui';
import { miPerfil, type PerfilEstudiante } from '../servicios/estudiante';

export function E12PerfilReal() {
  const { persona } = useSesion();
  const { curso } = useCurso();
  const [perfil, setPerfil] = useState<PerfilEstudiante | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!curso) return;
    miPerfil(curso.id).then(setPerfil).catch(() => setFallo(true));
  }, [curso]);

  const xp = perfil?.xp ?? 0;
  const nivel = Math.floor(xp / XP_POR_NIVEL) + 1;
  const enNivel = xp % XP_POR_NIVEL;

  return (
    <Pantalla clase="p-e12">
      <div className="pantalla__cuerpo">
        <CabeceraMundo atras={{ texto: 'Inicio', ruta: '#/inicio' }} kicker="Perfil" titulo={persona?.nombre ?? persona?.usuario ?? 'Tu perfil'} subtitulo={`${persona?.usuario ? `@${persona.usuario}` : ''}${curso ? ` · ${curso.nombre}` : ''}`} objeto="mochila" jaguar="guia" />
        <div className="contenido cuerpo-mundo perfil__real">
          {fallo && <p className="acceso__error" role="alert">No pudimos cargar tu perfil. Intenta de nuevo en un momento.</p>}
          <Kicker>Tu punto fuerte hoy</Kicker>
          <div className="perfil__rol">
            <span className="num">{perfil?.fuerte ? perfil.fuerte.nombre : 'Por descubrir'}</span>
            <p className="meta">{perfil?.fuerte ? `Es tu dimensión más alta en el radar (${perfil.fuerte.valor}). Puede cambiar a medida que avanzas.` : 'Aparece cuando tu radar tenga evidencias: notas, diagnóstico o práctica.'}</p>
          </div>
          <hr className="sep" />
          <div className="perfil__xp">
            <div className="perfil__xp-cifra"><span className="num"><Contador valor={xp} /></span><small>XP en total · nivel {nivel}</small></div>
            <div className="perfil__xp-barra"><i style={{ width: `${(enNivel / XP_POR_NIVEL) * 100}%` }} /></div>
            <p className="meta">{XP_POR_NIVEL - enNivel} XP para el nivel {nivel + 1}. El XP no es nota: se gana practicando.</p>
          </div>
          <hr className="sep" />
          <Kicker>Tu actividad</Kicker>
          <p className="meta">{perfil ? `${perfil.sesiones} ${perfil.sesiones === 1 ? 'sesión de práctica' : 'sesiones de práctica'} · ${perfil.evidencias} ${perfil.evidencias === 1 ? 'evidencia' : 'evidencias'} en tu radar.` : 'Cargando…'}</p>
        </div>
      </div>
      <Dock />
    </Pantalla>
  );
}
