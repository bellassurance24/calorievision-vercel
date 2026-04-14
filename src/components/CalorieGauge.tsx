import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface CalorieGaugeProps {
  value?: number;
  max?: number;
}

// Arc geometry constants
const CX = 120;
const CY = 120;
const R  = 95;

// Pre-compute 11 tick marks along the arc (180° → 0°, step 18°)
const TICKS = Array.from({ length: 11 }, (_, i) => {
  const deg = 180 - i * 18;
  const rad = (deg * Math.PI) / 180;
  const innerR = 104;
  const outerR = 113;
  return {
    x1: +(CX + innerR * Math.cos(rad)).toFixed(2),
    y1: +(CY - innerR * Math.sin(rad)).toFixed(2),
    x2: +(CX + outerR * Math.cos(rad)).toFixed(2),
    y2: +(CY - outerR * Math.sin(rad)).toFixed(2),
  };
});

const CalorieGauge = ({ value = 460, max = 1000 }: CalorieGaugeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [displayVal, setDisplayVal] = useState(0);

  // CountUp: 0 → value in 1.5s easeOutCubic
  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const start = performance.now();
    let rafId: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayVal(Math.round(eased * value));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, value]);

  // Needle angle: -90° (left) → +90° (right)
  const targetAngle = (value / max) * 180 - 90;

  // Arc path
  const arcPath = `M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`;

  return (
    <div
      ref={containerRef}
      className="relative w-72 flex flex-col items-center rounded-3xl bg-white py-4 px-2"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)" }}
    >
      <svg viewBox="0 0 240 128" className="w-full">
        <defs>
          <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
          <filter id="needle-shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.25)" />
          </filter>
        </defs>

        {/* Background track */}
        <path
          d={arcPath}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Animated progress arc */}
        <motion.path
          d={arcPath}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth="16"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: value / max } : { pathLength: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        {/* Tick marks */}
        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke="#D1D5DB"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        {/* Labels: 0 and 1000 */}
        <text x="18"  y="124" fontSize="9" fill="#9CA3AF" textAnchor="middle" fontFamily="system-ui,sans-serif">0</text>
        <text x="222" y="124" fontSize="9" fill="#9CA3AF" textAnchor="middle" fontFamily="system-ui,sans-serif">1000</text>

        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={isInView ? { rotate: targetAngle } : { rotate: -90 }}
          transition={{ type: "spring", stiffness: 40, damping: 8, delay: 0.3 }}
          style={{ originX: `${CX}px`, originY: `${CY}px` }}
          filter="url(#needle-shadow)"
        >
          {/* Needle body */}
          <line
            x1={CX} y1={CY}
            x2={CX} y2={CY - 78}
            stroke="#22C55E"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Needle tip — effilée */}
          <polygon
            points={`${CX},${CY - 88} ${CX - 3},${CY - 74} ${CX + 3},${CY - 74}`}
            fill="#22C55E"
          />
        </motion.g>

        {/* Center pivot: white circle with orange border */}
        <circle cx={CX} cy={CY} r="11" fill="white" stroke="#FF6B00" strokeWidth="3" />
        <circle cx={CX} cy={CY} r="4.5" fill="#FF6B00" />
      </svg>

      {/* Value display */}
      <motion.div
        className="flex flex-col items-center -mt-1 pb-1"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <span className="text-4xl font-bold text-gray-900 tabular-nums leading-none">
          {displayVal}
          <span className="text-sm font-medium text-gray-400 ml-1.5">kcal</span>
        </span>
      </motion.div>
    </div>
  );
};

export default CalorieGauge;
