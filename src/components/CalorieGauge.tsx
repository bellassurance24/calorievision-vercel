import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useMotionValueEvent,
} from "framer-motion";

/* ── Geometry ─────────────────────────────────────────────────── */
const CX = 120;
const CY = 120;
const R  = 95;
const ARC_PATH = `M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`;

/* 11 tick marks evenly spaced along the arc (180° → 0°) */
const TICKS = Array.from({ length: 11 }, (_, i) => {
  const rad = ((180 - i * 18) * Math.PI) / 180;
  return {
    x1: +(CX + 104 * Math.cos(rad)).toFixed(2),
    y1: +(CY - 104 * Math.sin(rad)).toFixed(2),
    x2: +(CX + 113 * Math.cos(rad)).toFixed(2),
    y2: +(CY - 113 * Math.sin(rad)).toFixed(2),
    // label sits just outside the tick (r=118), following the arc curve
    lx: +(CX + 118 * Math.cos(rad)).toFixed(2),
    ly: +(CY - 118 * Math.sin(rad)).toFixed(2),
    value: i * 100,
    anchor: i === 0 ? "start" : i === 10 ? "end" : "middle",
  };
});

/* ── Component ───────────────────────────────────────────────── */
interface CalorieGaugeProps {
  max?: number;
}

const TARGET = 460;

const CalorieGauge = ({ max = 1000 }: CalorieGaugeProps) => {
  /* One master progress value: 0 → 1, looping forever */
  const progress = useMotionValue(0);

  /* Arc fill: 0 → TARGET/max */
  const pathLength = useTransform(progress, (v) => v * (TARGET / max));

  /* Needle angle: -90° (far left) → targetAngle° */
  const TARGET_ANGLE = (TARGET / max) * 180 - 90; // ≈ −7.2°
  const needleAngle = useTransform(
    progress,
    (v) => v * (TARGET / max) * 180 - 90
  );

  /* Counter: 0 → TARGET, synced to progress */
  const displayFloat = useTransform(progress, (v) => v * TARGET);
  const [displayVal, setDisplayVal] = useState(0);
  useMotionValueEvent(displayFloat, "change", (v) => {
    setDisplayVal(Math.round(v));
  });

  /* Start infinite loop on mount */
  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    });
    return controls.stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative w-72 flex flex-col items-center rounded-3xl bg-white py-4 px-2"
      style={{
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <svg viewBox="0 -8 240 148" className="w-full">
        <defs>
          <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Animated progress arc — driven by pathLength MotionValue */}
        <motion.path
          d={ARC_PATH}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth="16"
          strokeLinecap="round"
          style={{ pathLength }}
        />

        {/* Tick marks + numeric labels */}
        {TICKS.map((tick, i) => (
          <g key={i}>
            <line
              x1={tick.x1} y1={tick.y1}
              x2={tick.x2} y2={tick.y2}
              stroke="#D1D5DB"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <text
              x={tick.lx}
              y={tick.ly}
              fontSize="8"
              fill="#6B7280"
              textAnchor={tick.anchor}
              dominantBaseline="middle"
              fontFamily="system-ui,sans-serif"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* Needle — rotates around pivot (CX, CY) */}
        <motion.g
          style={{
            rotate: needleAngle,
            originX: `${CX}px`,
            originY: `${CY}px`,
            filter: "drop-shadow(0 0 4px #22C55E)",
          }}
        >
          {/* Body */}
          <line
            x1={CX} y1={CY}
            x2={CX} y2={CY - 78}
            stroke="#22C55E"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Effilée tip */}
          <polygon
            points={`${CX},${CY - 90} ${CX - 3.5},${CY - 74} ${CX + 3.5},${CY - 74}`}
            fill="#22C55E"
          />
        </motion.g>

        {/* Pivot: white circle + orange dot */}
        <circle cx={CX} cy={CY} r="11" fill="white" stroke="#FF6B00" strokeWidth="3" />
        <circle cx={CX} cy={CY} r="4.5" fill="#FF6B00" />
      </svg>

      {/* Calorie counter */}
      <div className="flex flex-col items-center pb-1 -mt-2">
        <span
          className="text-4xl font-bold tabular-nums leading-none"
          style={{ color: "#1e293b" }}
        >
          {displayVal}
          <span className="text-sm font-medium text-gray-400 ml-1.5">kcal</span>
        </span>
      </div>
    </div>
  );
};

export default CalorieGauge;
