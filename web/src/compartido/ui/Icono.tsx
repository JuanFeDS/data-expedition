export type Icono = 'votar' | 'resumen' | 'equipo' | 'perfil' | 'ruta' | 'radar' | 'notas' | 'entregas' | 'leccion' | 'menu' | 'ayuda' | 'inicio' | 'panel' | 'formulario' | 'calendario' | 'material' | 'ajustes' | 'ojo' | 'liga' | 'historico' | 'sonido';

export function IconoSvg({ tipo, tamano = 24 }: { tipo: Icono; tamano?: number }) {
  const t = { stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" aria-hidden="true">
      {tipo === 'votar' && <><rect x="4" y="4" width="16" height="16" rx="3" {...t} /><path d="M8 12.5 11 15.5 16.5 9" {...t} /></>}
      {tipo === 'resumen' && <><path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" {...t} /><path d="M9 13h6M9 17h4" {...t} /></>}
      {tipo === 'equipo' && <><circle cx="9" cy="9" r="3" {...t} /><circle cx="17" cy="10" r="2.4" {...t} /><path d="M3.5 19c.5-3 2.7-4.5 5.5-4.5s5 1.5 5.5 4.5M15.5 14.8c2.6-.2 4.5 1 5 3.7" {...t} /></>}
      {tipo === 'perfil' && <><circle cx="12" cy="8.5" r="3.5" {...t} /><path d="M5 20c.7-3.6 3.4-5.5 7-5.5s6.3 1.9 7 5.5" {...t} /></>}
      {tipo === 'ruta' && <><circle cx="6" cy="18" r="2.2" {...t} /><circle cx="18" cy="6" r="2.2" {...t} /><path d="M8 17c6 0 2-9 8-10.5" {...t} strokeDasharray="1 3.4" /></>}
      {tipo === 'radar' && <path d="M12 3.5 19.5 9l-2.9 9H7.4L4.5 9 12 3.5Z" {...t} />}
      {tipo === 'notas' && <><path d="M5 20V10M12 20V4M19 20v-7" {...t} /></>}
      {tipo === 'entregas' && <><path d="M12 15V4M8 8l4-4 4 4" {...t} /><path d="M5 15v4h14v-4" {...t} /></>}
      {tipo === 'leccion' && <path d="M13 3 5 13.5h6L10 21l9-11h-6.5L13 3Z" {...t} />}
      {tipo === 'ayuda' && <><circle cx="12" cy="12" r="9" {...t} /><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.9" {...t} /><circle cx="12" cy="17" r=".6" fill="currentColor" stroke="currentColor" /></>}
      {tipo === 'panel' && <><rect x="4" y="4" width="16" height="16" rx="3" {...t} /><path d="M4 10h16M10 10v10" {...t} /></>}
      {tipo === 'formulario' && <><rect x="5" y="4" width="14" height="17" rx="2" {...t} /><path d="M9 4V3h6v1M8.5 10h7M8.5 14h7M8.5 17.5h4" {...t} /></>}
      {tipo === 'calendario' && <><rect x="4" y="5" width="16" height="15" rx="2" {...t} /><path d="M4 10h16M8 3v4M16 3v4" {...t} /></>}
      {tipo === 'material' && <><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5V4.5Z" {...t} /><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" {...t} /></>}
      {tipo === 'ajustes' && <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" {...t} /><circle cx="16" cy="7" r="2" {...t} /><circle cx="8" cy="17" r="2" {...t} /></>}
      {tipo === 'liga' && <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" {...t} /><path d="M8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5A3 3 0 0 1 16 10.5M12 13v4M8.5 20h7" {...t} /></>}
      {tipo === 'historico' && <><circle cx="12" cy="12" r="9" {...t} /><path d="M12 7v5l3 2" {...t} /></>}
      {tipo === 'sonido' && <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Z" {...t} /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" {...t} /></>}
      {tipo === 'ojo' && <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...t} /><circle cx="12" cy="12" r="3" {...t} /></>}
      {tipo === 'inicio' && <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z" {...t} />}
      {tipo === 'menu' && <><rect x="4" y="4" width="6.5" height="6.5" rx="1.8" {...t} /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" {...t} /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" {...t} /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" {...t} /></>}
    </svg>
  );
}

