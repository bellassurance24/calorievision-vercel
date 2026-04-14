import { useEffect, useState } from "react";

const CX = 120, CY = 110, R = 85, MAX = 1000, TARGET = 460;

const toRad = (d: number) => (d * Math.PI) / 180;
const pt = (angleDeg: number, radius: number) => ({
  x: CX + radius * Math.cos(toRad(angleDeg)),
  y: CY + radius * Math.sin(toRad(angleDeg)),
});

const s = pt(180, R), e = pt(0, R);
const ARC = `M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`;

const TICKS = Array.from({ length: 11 }, (_, i) => {
  const val = i * 100;
  const angle = 180 - (val / MAX) * 180;
  return { val, o: pt(angle, R + 5), i: pt(angle, R - 5), l: pt(angle, R - 22) };
});

export default function CalorieGauge() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 4000;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = (elapsed % (duration * 2)) / duration;
      const p = t <= 1 ? t : 2 - t;
      setProgress(p);
      requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, []);

  const value = Math.round(progress * TARGET);
  const needleAngleSVG = -90 + progress * (TARGET / MAX) * 180;
  const arcLen = progress * (TARGET / MAX);

  return (
    <div style={{ width: 300, height: 210, background: "white", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.09)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 240 145" width="100%" height="100%">
        <defs>
          <linearGradient id="og" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path d={ARC} fill="none" stroke="#F0F0F0" strokeWidth="13" strokeLinecap="round" />

        {/* Orange arc */}
        <path
          d={ARC} fill="none" stroke="url(#og)" strokeWidth="13" strokeLinecap="round"
          strokeDasharray="1" strokeDashoffset={0}
          style={{ pathLength: 1 } as React.CSSProperties}
        />
        <path
          d={ARC} fill="none" stroke="url(#og)" strokeWidth="13" strokeLinecap="round"
          style={{
            strokeDasharray: `${arcLen * 267} 267`,
          }}
        />

        {/* Ticks */}
        {TICKS.map(({ val, o, i, l }) => (
          <g key={val}>
            <line x1={i.x} y1={i.y} x2={o.x} y2={o.y} stroke="#D1D5DB" strokeWidth="1.2" />
            <text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" fontSize="5.5" fill="#9CA3AF">{val}</text>
          </g>
        ))}

        {/* NEEDLE using SVG transform rotate(angle, cx, cy) — no CSS transformOrigin */}
        <g transform={`rotate(${needleAngleSVG}, ${CX}, ${CY})`}>
          <line x1={CX} y1={CY} x2={CX} y2={CY - 72} stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points={`${CX},${CY - 72} ${CX - 4},${CY - 60} ${CX + 4},${CY - 60}`} fill="#22C55E" />
        </g>

        {/* Center */}
        <circle cx={CX} cy={CY} r="9" fill="white" stroke="#FF6B00" strokeWidth="2.5" />
        <circle cx={CX} cy={CY} r="3.5" fill="#FF6B00" />

        {/* Value */}
        <text x={CX} y={CY + 19} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">{value}</text>
        <text x={CX} y={CY + 28} textAnchor="middle" fontSize="6" fill="#9CA3AF">kcal</text>
      </svg>
    </div>
  );
}
