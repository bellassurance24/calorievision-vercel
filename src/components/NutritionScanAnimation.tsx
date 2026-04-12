import { useEffect, useRef, useState } from "react";

/* ─── Timing constants (ms) ─────────────────────────────────────── */
const CYCLE       = 5000;  // full loop length
const SCAN_END    = 1900;  // scan line finishes travelling
const COUNT_START =  700;  // numbers begin counting
const COUNT_END   = 2300;  // numbers reach target

const TARGETS = { calories: 487, protein: 32, carbs: 45, fat: 18 };

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/* ─── Animated card ─────────────────────────────────────────────── */
export function NutritionScanAnimation() {
  const [phase, setPhase] = useState(0);
  const rafRef  = useRef<number>(0);
  const t0Ref   = useRef<number>(0);

  useEffect(() => {
    t0Ref.current = performance.now();
    const tick = (now: number) => {
      setPhase((now - t0Ref.current) % CYCLE);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* scan line */
  const scanPct     = Math.min(phase / SCAN_END, 1) * 100;
  const scanVisible = phase < SCAN_END + 300;

  /* counting */
  const rawP  = Math.max(0, Math.min((phase - COUNT_START) / (COUNT_END - COUNT_START), 1));
  const countP = easeOutCubic(rawP);

  const calories = Math.round(countP * TARGETS.calories);
  const protein  = Math.round(countP * TARGETS.protein);
  const carbs    = Math.round(countP * TARGETS.carbs);
  const fat      = Math.round(countP * TARGETS.fat);

  /* pulsing glow when scan is complete */
  const holdPhase = Math.max(0, phase - COUNT_END);
  const pulse     = Math.sin((holdPhase / 1400) * Math.PI * 2) * 0.4 + 0.6; // 0.2–1.0
  const glowAlpha = countP * 0.18 * (phase > COUNT_END ? pulse : 1);
  const glowPx    = Math.round(countP * 28);

  return (
    <div
      className="relative rounded-2xl bg-white overflow-hidden select-none"
      style={{
        width: "100%",
        maxWidth: "300px",
        boxShadow: `0 4px 28px rgba(0,0,0,0.09), 0 0 ${glowPx}px ${Math.round(glowPx / 2)}px rgba(13,148,136,${glowAlpha.toFixed(3)})`,
      }}
    >
      {/* ── Plate area ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(145deg,#f8fafc 0%,#f0fdf4 100%)" }}
      >
        <div className="flex items-center justify-center py-6 px-4">
          <PlateIllustration />
        </div>

        {/* scan line */}
        {scanVisible && (
          <>
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: "0 0 auto",
                top: `${scanPct}%`,
                height: "2px",
                background:
                  "linear-gradient(90deg,transparent 0%,#0d9488 15%,#2dd4bf 50%,#0d9488 85%,transparent 100%)",
                boxShadow: "0 0 12px 4px rgba(13,148,136,0.55)",
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: `${scanPct}%`,
                background: "rgba(13,148,136,0.055)",
                pointerEvents: "none",
              }}
            />
          </>
        )}
      </div>

      {/* ── Stats area ─────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        {/* Calories row */}
        <div
          className="flex items-baseline justify-between"
          style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            Calories
          </span>
          <span
            className="tabular-nums"
            style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}
          >
            {calories.toLocaleString()}
            <span style={{ fontSize: "11px", fontWeight: 400, color: "#94a3b8", marginLeft: "3px" }}>
              kcal
            </span>
          </span>
        </div>

        {/* Macro bars */}
        <MacroRow label="Protein" value={protein} unit="g" max={TARGETS.protein} color="#0d9488" />
        <MacroRow label="Carbs"   value={carbs}   unit="g" max={TARGETS.carbs}   color="#f97316" />
        <MacroRow label="Fat"     value={fat}     unit="g" max={TARGETS.fat}     color="#eab308" />
      </div>
    </div>
  );
}

/* ─── Macro bar row ─────────────────────────────────────────────── */
function MacroRow({
  label, value, unit, max, color,
}: {
  label: string; value: number; unit: string; max: number; color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: "4px" }}
      >
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>{label}</span>
        <span
          className="tabular-nums"
          style={{ fontSize: "11px", fontWeight: 700, color }}
        >
          {value}
          {unit}
        </span>
      </div>
      <div
        style={{
          height: "6px",
          width: "100%",
          borderRadius: "9999px",
          background: "#f1f5f9",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: "9999px",
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

/* ─── Plate illustration (SVG) ──────────────────────────────────── */
function PlateIllustration() {
  return (
    <svg
      viewBox="0 0 200 155"
      width="200"
      height="155"
      aria-hidden
      style={{ display: "block", overflow: "visible" }}
    >
      {/* drop shadow */}
      <ellipse cx="100" cy="148" rx="76" ry="9" fill="rgba(0,0,0,0.07)" />

      {/* plate */}
      <ellipse cx="100" cy="92" rx="82" ry="56" fill="white" />
      <ellipse cx="100" cy="92" rx="82" ry="56" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
      <ellipse cx="100" cy="92" rx="74" ry="50" fill="none" stroke="#f1f5f9" strokeWidth="1" />
      <ellipse cx="100" cy="93" rx="68" ry="46" fill="#fafafa" />

      {/* ── Greens / salad (left) ── */}
      <ellipse cx="70" cy="89" rx="29" ry="21" fill="#dcfce7" />
      <ellipse cx="62" cy="83" rx="15" ry="11" fill="#4ade80" opacity=".9" />
      <ellipse cx="75" cy="91" rx="12" ry="9"  fill="#22c55e" opacity=".85" />
      <ellipse cx="65" cy="96" rx="9"  rx2="9"  ry="7"  fill="#86efac" />
      {/* leaf veins */}
      <path d="M56 82 Q62 78 68 82" stroke="#15803d" strokeWidth=".9" fill="none" opacity=".5" />
      <path d="M70 89 Q76 85 82 89" stroke="#15803d" strokeWidth=".9" fill="none" opacity=".4" />

      {/* ── Chicken / protein (right) ── */}
      <ellipse cx="132" cy="84" rx="27" ry="19" fill="#fde68a" />
      <ellipse cx="131" cy="82" rx="21" ry="15" fill="#fbbf24" />
      <ellipse cx="132" cy="81" rx="15" ry="11" fill="#f59e0b" />
      {/* grill marks */}
      <path d="M122 78 Q131 76 140 78" stroke="#b45309" strokeWidth="1.3" fill="none" opacity=".6" strokeLinecap="round"/>
      <path d="M123 83 Q132 81 141 83" stroke="#b45309" strokeWidth="1.3" fill="none" opacity=".4" strokeLinecap="round"/>

      {/* ── Rice / carbs (bottom) ── */}
      <ellipse cx="100" cy="111" rx="24" ry="13" fill="#fef9c3" />
      <ellipse cx="100" cy="110" rx="17" ry="9"  fill="#fef3c7" />
      {[83,89,95,101,107,86,92,98,104].map((x, i) => (
        <ellipse key={i} cx={x} cy={109 + (i % 2 === 0 ? 0 : 2)} rx="1.6" ry="2.8" fill="#fde047" opacity=".7" />
      ))}

      {/* ── Sauce drizzle ── */}
      <path
        d="M106 100 Q112 104 117 101 Q121 98 124 103"
        stroke="#ef4444"
        strokeWidth="1.8"
        fill="none"
        opacity=".35"
        strokeLinecap="round"
      />
    </svg>
  );
}
