import { motion } from "framer-motion";

const CalorieGauge = () => {
  const cx = 120, cy = 110, r = 85, max = 1000, target = 460;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const pt = (angleDeg: number, radius: number) => ({
    x: cx + radius * Math.cos(toRad(angleDeg)),
    y: cy + radius * Math.sin(toRad(angleDeg)),
  });

  const startPt = pt(180, r);
  const endPt = pt(0, r);
  const arc = `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 0 1 ${endPt.x} ${endPt.y}`;

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const val = i * 100;
    const angle = 180 - (val / max) * 180;
    const o = pt(angle, r + 4);
    const inn = pt(angle, r - 6);
    const lbl = pt(angle, r - 18);
    return { val, o, inn, lbl };
  });

  const needleAngle = 180 - (target / max) * 180;
  const needleRot = needleAngle - 90;

  return (
    <div style={{ width: 280, height: 200, background: "white", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 240 135" width="100%" height="100%">
        <defs>
          <linearGradient id="og" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path d={arc} fill="none" stroke="#F3F4F6" strokeWidth="13" strokeLinecap="round" />

        {/* Animated arc */}
        <motion.path
          d={arc} fill="none" stroke="url(#og)" strokeWidth="13" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, target / max, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Ticks + labels */}
        {ticks.map(({ val, o, inn, lbl }) => (
          <g key={val}>
            <line x1={inn.x} y1={inn.y} x2={o.x} y2={o.y} stroke="#D1D5DB" strokeWidth="1.2" />
            <text x={lbl.x} y={lbl.y} textAnchor="middle" dominantBaseline="middle" fontSize="5.5" fill="#9CA3AF">{val}</text>
          </g>
        ))}

        {/* Needle */}
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={{ rotate: -90 }}
          animate={{ rotate: [-90, needleRot, -90] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <line x1={cx} y1={cy} x2={cx} y2={cy - 70} stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
          <polygon points={`${cx},${cy - 70} ${cx - 4},${cy - 58} ${cx + 4},${cy - 58}`} fill="#22C55E" />
        </motion.g>

        {/* Center */}
        <circle cx={cx} cy={cy} r="8" fill="white" stroke="#FF6B00" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r="3" fill="#FF6B00" />

        {/* Value */}
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e293b">460</text>
        <text x={cx} y={cy + 27} textAnchor="middle" fontSize="6" fill="#9CA3AF">kcal</text>
      </svg>
    </div>
  );
};

export default CalorieGauge;
