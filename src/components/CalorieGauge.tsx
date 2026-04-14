import { motion } from "framer-motion";

interface CalorieGaugeProps {
  value?: number;
  max?: number;
}

const CalorieGauge = ({ value = 266, max = 1000 }: CalorieGaugeProps) => {
  const angle = (value / max) * 180 - 90;

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <motion.path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#calorie-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: value / max }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="calorie-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <motion.g
          initial={{ rotate: -90 }}
          whileInView={{ rotate: angle }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 60, damping: 10, delay: 0.5 }}
          style={{ originX: "100px", originY: "100px" }}
        >
          <line x1="100" y1="100" x2="100" y2="30"
            stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="6" fill="#1e293b" />
        </motion.g>
      </svg>
      <div className="absolute bottom-4 flex flex-col items-center">
        <motion.span
          className="text-3xl font-bold text-slate-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {value}
        </motion.span>
        <span className="text-xs text-slate-500 uppercase font-semibold">kcal</span>
      </div>
    </div>
  );
};

export default CalorieGauge;
