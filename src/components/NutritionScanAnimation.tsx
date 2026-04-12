import { useEffect, useRef, useState } from "react";
import gaugeWheel from "@/assets/gauge-original.webp";

/* ─── Timing (ms) ──────────────────────────────────────────────────── */
const CYCLE       = 5000;
const RESET_END   =  320;   // needle snaps back to start
const COUNT_START =  320;
const COUNT_END   = 2300;

/* ─── Needle angles (degrees, SVG rotate — 0 = 12 o'clock, CW+) ─── */
const NEEDLE_ZERO = -130;  // 8 o'clock — far left, "empty tank"
const NEEDLE_FULL =   28;  // 1 o'clock — 487 kcal, matches baked needle

const TARGETS = { calories: 487, protein: 32, carbs: 45, fat: 18 };

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInCubic(t: number) {
  return t * t * t;
}

/* ─── Main component ────────────────────────────────────────────────── */
export function NutritionScanAnimation() {
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number>(0);
  const t0Ref  = useRef<number>(0);

  useEffect(() => {
    t0Ref.current = performance.now();
    const tick = (now: number) => {
      setPhase((now - t0Ref.current) % CYCLE);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* Count-up */
  const rawP   = Math.max(0, Math.min((phase - COUNT_START) / (COUNT_END - COUNT_START), 1));
  const countP = easeOutCubic(rawP);

  const calories = Math.round(countP * TARGETS.calories);
  const protein  = Math.round(countP * TARGETS.protein);
  const carbs    = Math.round(countP * TARGETS.carbs);
  const fat      = Math.round(countP * TARGETS.fat);

  /* Needle — quick CCW reset then slow CW sweep */
  let needleDeg: number;
  if (phase < RESET_END) {
    const resetP = easeInCubic(phase / RESET_END);
    needleDeg = NEEDLE_FULL - resetP * (NEEDLE_FULL - NEEDLE_ZERO);
  } else {
    needleDeg = NEEDLE_ZERO + countP * (NEEDLE_FULL - NEEDLE_ZERO);
  }

  /* Macro pill appearance */
  const pill1 = phase > 1700;
  const pill2 = phase > 2050;
  const pill3 = phase > 2400;

  /* Card glow at end */
  const holdP = Math.max(0, (phase - COUNT_END) / (CYCLE - COUNT_END));
  const pulse = Math.sin((phase / 1400) * Math.PI * 2) * 0.12 + 0.88;
  const glowPx = Math.round(holdP * 24);
  const glowA  = (holdP * 0.22 * pulse).toFixed(3);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "290px",
        background: "#ffffff",
        borderRadius: "22px",
        boxShadow: `0 6px 36px rgba(0,0,0,0.11), 0 1px 4px rgba(0,0,0,0.07), 0 0 ${glowPx}px ${Math.round(glowPx / 2)}px rgba(249,115,22,${glowA})`,
        overflow: "hidden",
        userSelect: "none",
        fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      {/* ── Top badge ──────────────────────────────────────────────── */}
      <div style={{ padding: "14px 18px 0", display: "flex", alignItems: "center", gap: "7px" }}>
        <span
          style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "#f97316",
            boxShadow: "0 0 0 3px rgba(249,115,22,0.18)",
            display: "inline-block",
            animation: "cvPulse 1.5s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontSize: "10.5px", fontWeight: 700, color: "#64748b",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}
        >
          Nutrition Analysis
        </span>
      </div>

      {/* ── Gauge wheel ───────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "10px 24px 4px" }}>
        <div
          style={{
            position: "relative",
            width: "192px",
            height: "192px",
            background: "#ffffff",
            borderRadius: "50%",
            filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.14))",
          }}
        >
          {/* Orange wheel */}
          <img
            src={gaugeWheel}
            alt=""
            aria-hidden
            draggable={false}
            style={{ width: "100%", height: "100%", display: "block" }}
          />

          {/* Animated needle overlay */}
          <svg
            aria-hidden
            viewBox="0 0 192 192"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              overflow: "visible",
            }}
          >
            <defs>
              <linearGradient id="cvNeedleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2dd4bf" />
                <stop offset="60%"  stopColor="#0d9488" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
              <filter id="cvNeedleShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="rgba(0,0,0,0.5)" />
              </filter>
            </defs>

            {/* Needle group — translated to circle center, then rotated */}
            <g
              transform={`translate(96,96) rotate(${needleDeg.toFixed(2)})`}
              filter="url(#cvNeedleShadow)"
            >
              {/* Main needle body — tapers from base to tip */}
              <polygon
                points="-3,12 3,12 1.2,-72 -1.2,-72"
                fill="url(#cvNeedleGrad)"
              />
              {/* Sharp tip */}
              <polygon
                points="-1.2,-72 1.2,-72 0,-84"
                fill="#2dd4bf"
              />
              {/* Highlight streak */}
              <line
                x1="0.6" y1="8"
                x2="0.6" y2="-78"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="0.7"
              />
              {/* Hub — outer dark ring */}
              <circle r="9"   fill="#0f172a" />
              {/* Hub — mid */}
              <circle r="6.5" fill="#1e293b" />
              {/* Hub — inner teal accent */}
              <circle r="3.5" fill="#0d9488" />
              {/* Hub — center glint */}
              <circle r="1.2" fill="rgba(255,255,255,0.55)" cx="0" cy="-0.5" />
            </g>
          </svg>
        </div>
      </div>

      {/* ── Calorie readout ───────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "6px 20px 4px" }}>
        <div
          style={{
            fontSize: "44px",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {calories.toLocaleString()}
          <span
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: "#94a3b8",
              marginLeft: "5px",
              letterSpacing: "0",
            }}
          >
            kcal
          </span>
        </div>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#cbd5e1",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginTop: "3px",
          }}
        >
          Total Calories
        </div>
      </div>

      {/* ── Macro pills ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "7px",
          padding: "10px 14px 16px",
          justifyContent: "center",
        }}
      >
        <MacroPill label="Protein" value={protein} unit="g" color="#0d9488" visible={pill1} />
        <MacroPill label="Carbs"   value={carbs}   unit="g" color="#f97316" visible={pill2} />
        <MacroPill label="Fat"     value={fat}     unit="g" color="#eab308" visible={pill3} />
      </div>

      {/* ── Keyframes ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes cvPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.45; transform:scale(0.82); }
        }
      `}</style>
    </div>
  );
}

/* ─── Macro pill ────────────────────────────────────────────────────── */
function MacroPill({
  label, value, unit, color, visible,
}: {
  label: string; value: number; unit: string; color: string; visible: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: `${color}12`,
        border: `1.5px solid ${color}28`,
        borderRadius: "14px",
        padding: "7px 8px",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.94)",
        transition: "opacity 0.38s cubic-bezier(0.34,1.56,0.64,1), transform 0.38s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 800,
          color,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        <span style={{ fontSize: "10px", fontWeight: 600, marginLeft: "1px" }}>{unit}</span>
      </div>
      <div
        style={{
          fontSize: "9px",
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginTop: "3px",
        }}
      >
        {label}
      </div>
    </div>
  );
}
