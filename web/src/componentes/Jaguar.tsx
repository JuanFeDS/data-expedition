interface PropsJaguar {
  pose?: 'guia' | 'celebra';
  tamano?: number;
  clase?: string;
}

export function Jaguar({ pose = 'guia', tamano = 96, clase }: PropsJaguar) {
  const manchas: [number, number][] = [[31, 37], [69, 37], [50, 24], [25, 55], [75, 55]];
  return (
    <svg className={clase} width={tamano} height={tamano} viewBox="0 0 100 100" fill="none" role="img" aria-label="Tu guía, un jaguar con bufanda">
      <ellipse cx="50" cy="102" rx="38" ry="24" fill="var(--accent)" />
      <path d="M22 80 Q50 94 78 80 L78 91 Q50 105 22 91 Z" fill="var(--secondary)" />
      <rect x="62" y="86" width="9" height="13" rx="3" fill="var(--secondary)" transform="rotate(-12 66 92)" />
      <circle cx="22" cy="27" r="11" fill="var(--accent)" />
      <circle cx="78" cy="27" r="11" fill="var(--accent)" />
      <circle cx="22" cy="28" r="5" fill="var(--deep)" />
      <circle cx="78" cy="28" r="5" fill="var(--deep)" />
      <ellipse cx="50" cy="52" rx="35" ry="30" fill="var(--accent)" />
      {manchas.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="4.2" stroke="var(--deep)" strokeWidth="2" />
          <circle cx={x} cy={y} r="1.3" fill="var(--deep)" />
        </g>
      ))}
      <ellipse cx="50" cy="63" rx="17" ry="12" fill="var(--bg)" />
      {pose === 'guia' ? (
        <>
          <circle cx="37" cy="47" r="4.4" fill="var(--deep)" />
          <circle cx="63" cy="47" r="4.4" fill="var(--deep)" />
          <circle cx="38.4" cy="45.6" r="1.4" fill="#fff" />
          <circle cx="64.4" cy="45.6" r="1.4" fill="#fff" />
        </>
      ) : (
        <>
          <path d="M31 49 Q37 41 43 49" stroke="var(--deep)" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M57 49 Q63 41 69 49" stroke="var(--deep)" strokeWidth="3.2" strokeLinecap="round" />
        </>
      )}
      <path d="M45 57 H55 L50 63 Z" fill="var(--deep)" strokeLinejoin="round" stroke="var(--deep)" strokeWidth="2" />
      <path d="M50 63 V66" stroke="var(--deep)" strokeWidth="2" strokeLinecap="round" />
      <path d={pose === 'celebra' ? 'M41 66 Q50 76 59 66' : 'M43 67 Q50 72 57 67'} stroke="var(--deep)" strokeWidth="2.2" strokeLinecap="round" fill={pose === 'celebra' ? 'var(--secondary)' : 'none'} />
    </svg>
  );
}
