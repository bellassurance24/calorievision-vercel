import { motion } from "framer-motion";

const cx = 120;
const cy = 115;
const r = 90;

function polarToCartesian(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

const startAngle = 180;
const endAngle = 0;
const startPt = polarToCartesian(startAngle);
const endPt = polarToCartesian(endAngle);
const arcPath = `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 0 1 ${endPt.x} ${endPt.y}`;

const CalorieGauge = () => {
  const maxValue = 1000;
  const targetValue = 460;
  const targetAngle = 180 - (targetValue / maxValue) * 180;
  const needleRotateTarget = 180 - (targetValue / maxValue) * 180 - 90;

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const val = i * 100;
    const angle = 180 - (val / maxValue) * 180;
    const rad = (angle * Math.PI) / 180;
    const inner = { x: cx + (r - 8) * Math.cos(rad), y: cy + (r - 8) * Math.sin(rad) };
    const outer = { x: cx + (r + 2) * Math.cos(rad), y: cy + (r + 2) * Math.sin(rad) };
    const label = { x: cx + (r - 20) * Math.cos(rad), y: cy + (r - 20) * Math.sin(rad) };
    return { val, inner, outer, label };
  });

  return (
    <div className="flex items-center justify-center w-80 h-56 bg-white rounded-2xl shadow-md">
      <svg viewBox="0 0 240 140" className="w-full h-full">
        {/* Background arc */}
        <path d={arcPath} fill="none" stroke="#F3F4F6" strokeWidth="14" strokeLinecap="round" />

        {/* Animated orange arc */}
        <motion.path
          d={arcPath}
          fill="none"
          stroke="url(#og)"
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, targetValue / maxValue, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <defs>
          <linearGradient id="og" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
        </defs>

        {/* Tick marks and labels */}
        {ticks.map(({ val, inner, outer, label }) => (
          <g key={val}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="#D1D5DB" strokeWidth="1.5" />
            <text x={label.x} y={label.y} textAnchor="middle"
              dominantBaseline="middle" fontSize="6" fill="#9CA3AF">
              {val}
            </text>
          </g>
        ))}

        {/* Needle — vertical line rotating from center pivot */}
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={{ rotate: -90 }}
          animate={{ rotate: [-90, needleRotateTarget, -90] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <line
            x1={cx} y1={cy}
            x2={cx} y2={cy - 75}
            stroke="#22C55E"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </motion.g>

        {/* Center circle */}
        <circle cx={cx} cy={cy} r="8" fill="white" stroke="#FF6B00" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r="3" fill="#FF6B00" />

        {/* Calorie counter */}
        <motion.text
          x={cx} y={cy + 20}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#1e293b"
        >
          <motion.tspan
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
          >
            460
          </motion.tspan>
        </motion.text>
        <text x={cx} y={cy + 30} textAnchor="middle" fontSize="6" fill="#9CA3AF">kcal</text>
      </svg>
    </div>
  );
};

export default CalorieGauge;
