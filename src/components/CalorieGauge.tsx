import { useEffect, useState } from "react";

const CX = 120, CY = 105, R = 80, MAX = 1000, TARGET = 460;
const ARC_LEN = Math.PI * R; // semicircle circumference

const toRad = (d: number) => (d * Math.PI) / 180;
const pt = (deg: number, r: number) => ({
  x: CX + r * Math.cos(toRad(deg)),
  y: CY + r * Math.sin(toRad(deg)),
});

// Arc: left (180°) → top (270°) → right (360°/0°), sweep-flag=1 = clockwise in SVG
const { x: sx, y: sy } = pt(180, R);
const { x: ex, y: ey } = pt(0, R);
const ARC = `M ${sx} ${sy} A ${R} ${R} 0 0 1 ${ex} ${ey}`;

// val=0 → 180° (left), val=500 → 270° (top), val=1000 → 360° (right)
const valToAngle = (val: number) => 180 + (val / MAX) * 180;

const MAJOR = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const MINOR = [50, 150, 250, 350, 450, 550, 650, 750, 850, 950];
const LABELS = [0, 250, 500, 750, 1000];

export default function CalorieGauge() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    let t0: number | null = null;
    const dur = 4000;
    const step = (ts: number) => {
      if (t0 === null) t0 = ts;
      const t = ((ts - t0) % (dur * 2)) / dur;
      setProgress(t <= 1 ? t : 2 - t);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const value = Math.round(progress * TARGET);
  // Needle: drawn pointing up, rotated from -90° (left) toward 90° (right) through 0° (top)
  const needleRot = (progress * TARGET / MAX) * 180 - 90;
  const fillLen = progress * (TARGET / MAX) * ARC_LEN;

  return (
    <div style={{
      width: 300,
      height: 210,
      background: "white",
      borderRadius: 16,
      boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <svg viewBox="0 0 240 133" width="100%" height="100%">
        <defs>
          <linearGradient id="og" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FFAA00" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path d={ARC} fill="none" stroke="#F0F0F0" strokeWidth="8" strokeLinecap="round" />

        {/* Orange fill — only render when there is meaningful length */}
        {fillLen > 2 && (
          <path
            d={ARC} fill="none"
            stroke="url(#og)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${fillLen} ${ARC_LEN}`}
          />
        )}

        {/* Minor ticks — outside the arc */}
        {MINOR.map((v) => {
          const a = valToAngle(v);
          const i = pt(a, R + 2);
          const o = pt(a, R + 8);
          return (
            <line key={v}
              x1={i.x} y1={i.y} x2={o.x} y2={o.y}
              stroke="#D1D5DB" strokeWidth="0.8"
            />
          );
        })}

        {/* Major ticks — outside the arc, taller */}
        {MAJOR.map((v) => {
          const a = valToAngle(v);
          const i = pt(a, R + 2);
          const o = pt(a, R + 13);
          return (
            <line key={v}
              x1={i.x} y1={i.y} x2={o.x} y2={o.y}
              stroke="#9CA3AF" strokeWidth="1.4"
            />
          );
        })}

        {/* Labels — inside the arc */}
        {LABELS.map((v) => {
          const a = valToAngle(v);
          const lp = pt(a, R - 19);
          return (
            <text key={v}
              x={lp.x} y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="6.5"
              fill="#94A3B8"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {v}
            </text>
          );
        })}

        {/* Needle — drawn vertically, rotated around hub center */}
        <g transform={`rotate(${needleRot}, ${CX}, ${CY})`}>
          {/* Tail (short, below hub) */}
          <line
            x1={CX} y1={CY + 9}
            x2={CX} y2={CY - 66}
            stroke="#10b981" strokeWidth="1.8" strokeLinecap="round"
          />
        </g>

        {/* Hub */}
        <circle cx={CX} cy={CY} r="7.5" fill="white" stroke="#FF6B00" strokeWidth="2" />
        <circle cx={CX} cy={CY} r="3" fill="#10b981" />

        {/* Readout */}
        <text
          x={CX} y={CY + 20}
          textAnchor="middle"
          fontSize="15" fontWeight="700" fill="#10b981"
          fontFamily="system-ui, -apple-system, sans-serif"
        >{value}</text>
        <text
          x={CX} y={CY + 29}
          textAnchor="middle"
          fontSize="6" fill="#94A3B8"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.8"
        >KCAL</text>
      </svg>
    </div>
  );
}
