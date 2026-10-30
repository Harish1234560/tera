import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* ---------- status line ---------- */
const MESSAGES = ["Energising", "Routing the grid", "Syncing phases", "Igniting"];

/* ---------- seeded PCB traces (same layout every time) ---------- */
const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const DIRS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return [Math.cos(a), Math.sin(a)] as const;
});

/* units: viewBox is -100..100, the logo disc has radius 28 */
const TRACES = (() => {
  const rnd = seeded(2026);
  const out: { d: string; pad: [number, number] }[] = [];
  const count = 14;
  for (let k = 0; k < count; k++) {
    const a = (k / count) * Math.PI * 2 + (rnd() - 0.5) * 0.2;
    let x = Math.cos(a) * 48;
    let y = Math.sin(a) * 48;
    let di = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
    const pts: [number, number][] = [[x, y]];
    const segs = 2 + Math.floor(rnd() * 3);
    for (let s = 0; s < segs; s++) {
      const len = 10 + rnd() * 16;
      const nx = x + DIRS[di][0] * len;
      const ny = y + DIRS[di][1] * len;
      if (Math.hypot(nx, ny) > 96) break;
      x = nx;
      y = ny;
      pts.push([x, y]);
      const turn = rnd() < 0.5 ? -1 : 1;
      di = (di + turn + 8) % 8;
      if (DIRS[di][0] * x + DIRS[di][1] * y < 0) di = (di - 2 * turn + 16) % 8;
    }
    if (pts.length < 2) continue;
    /* drawn outer -> inner, so pulses flow toward the logo */
    const d = pts
      .slice()
      .reverse()
      .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
      .join(" ");
    out.push({ d, pad: pts[pts.length - 1] });
  }
  return out;
})();

/* ---------- three-phase waveform strip ---------- */
const WAVE_W = 480;
const WAVE_H = 44;
const WAVE_PERIOD = 60;
const wavePath = (phase: number) => {
  let d = "";
  for (let x = 0; x <= WAVE_W; x += 3) {
    const y = WAVE_H / 2 - 14 * Math.sin((2 * Math.PI * x) / WAVE_PERIOD + phase);
    d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)} `;
  }
  return d;
};
const WAVES = [
  { d: wavePath(0), c: "#ff3d2e" },
  { d: wavePath(2.0944), c: "#ffb400" },
  { d: wavePath(4.1888), c: "#ffffff" },
];

const CSS = `
@keyframes tera-spin { to { transform: rotate(360deg); } }
@keyframes tera-spin-rev { to { transform: rotate(-360deg); } }
@keyframes tera-pulse {
  0% { stroke-dashoffset: 0.07; opacity: 0; }
  12% { opacity: 1; }
  88% { opacity: 1; }
  100% { stroke-dashoffset: -1; opacity: 0; }
}
@keyframes tera-ring { from { transform: scale(1); opacity: .7; } to { transform: scale(2.2); opacity: 0; } }
@keyframes tera-wave { to { transform: translateX(-50%); } }
@keyframes tera-glow { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
.tera-ld .spin { animation: tera-spin 2.4s linear infinite; }
.tera-ld .spin-slow { animation: tera-spin-rev 16s linear infinite; }
.tera-ld .pulse { animation: tera-pulse 1.7s cubic-bezier(.5,0,.9,.6) infinite; }
.tera-ld .ring { animation: tera-ring 1.9s ease-out infinite; }
.tera-ld .wave { animation: tera-wave 2.6s linear infinite; }
.tera-ld .glow { animation: tera-glow 1.9s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .tera-ld .spin, .tera-ld .spin-slow, .tera-ld .pulse, .tera-ld .ring, .tera-ld .wave, .tera-ld .glow { animation: none !important; }
  .tera-ld .pulse { opacity: 0 !important; }
}
`;

const PageTransitionLoader = () => {
  const reduced = useReducedMotion();
  const [msg, setMsg] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setMsg((m) => (m + 1) % MESSAGES.length), 950);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="tera-ld relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#050507] px-6 text-white"
    >
      <style>{CSS}</style>
      <span className="sr-only">Loading</span>

      {/* ambient light */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 38% at 50% 42%, rgba(255,60,40,0.20), transparent 70%), radial-gradient(45% 30% at 50% 100%, rgba(255,184,0,0.10), transparent 70%)",
        }}
      />

      {/* ---------- stage ---------- */}
      <div className="relative aspect-square w-[min(86vw,420px)]">
        {/* traces, rings, arcs */}
        <svg
          viewBox="-100 -100 200 200"
          className="absolute inset-0 h-full w-full"
          fill="none"
          aria-hidden="true"
        >
          {/* PCB traces with current pulses flowing toward the logo */}
          {TRACES.map((t, i) => (
            <g key={i}>
              <path d={t.d} stroke="rgba(255,150,70,0.22)" strokeWidth="0.5" strokeLinejoin="round" />
              <circle cx={t.pad[0]} cy={t.pad[1]} r="1.3" stroke="rgba(255,170,70,0.7)" strokeWidth="0.4" fill="#050507" />
              <path
                className="pulse"
                d={t.d}
                pathLength={1}
                stroke="rgba(255,70,40,0.45)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray="0.07 1"
                style={{ animationDelay: `${((i * 0.37) % 1.7).toFixed(2)}s` }}
              />
              <path
                className="pulse"
                d={t.d}
                pathLength={1}
                stroke="#fff1d6"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeDasharray="0.07 1"
                style={{ animationDelay: `${((i * 0.37) % 1.7).toFixed(2)}s` }}
              />
            </g>
          ))}

          {/* tick ring (60 ticks) */}
          <g className="spin-slow">
            <circle r="44" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeDasharray="1 3.608" />
          </g>

          {/* faint inner guide */}
          <circle r="31" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

          {/* three phase arcs, 120 degrees apart */}
          <g className="spin">
            {(
              [
                ["#ff3d2e", 0],
                ["#ffb400", 120],
                ["#ffffff", 240],
              ] as const
            ).map(([c, rot]) => (
              <circle
                key={c}
                r="36"
                pathLength={1}
                stroke={c}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="0.2 0.8"
                transform={`rotate(${rot})`}
              />
            ))}
          </g>
        </svg>

        {/* logo medallion */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glow absolute h-[56%] w-[56%] rounded-full bg-[radial-gradient(circle,rgba(255,60,40,0.45),transparent_68%)]" />
          {[0, 0.95].map((d) => (
            <span
              key={d}
              aria-hidden
              className="ring absolute h-[28%] w-[28%] rounded-full border border-red-400/60"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
          <div className="relative h-[28%] w-[28%] overflow-hidden rounded-full bg-white shadow-[0_0_40px_rgba(255,50,40,0.45),0_14px_40px_rgba(0,0,0,0.55)]">
            <img
              src="/EEElogo.png"
              alt=""
              draggable={false}
              className="h-full w-full scale-[1.14] object-cover"
            />
          </div>
        </div>
      </div>

      {/* ---------- status ---------- */}
      <div className="relative mt-6 h-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={reduced ? "static" : msg}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="font-body text-[11px] font-semibold uppercase tracking-[0.4em] text-white/65"
          >
            {reduced ? "Loading" : MESSAGES[msg]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* three-phase waveform */}
      <div
        className="relative mt-5 h-11 w-60 overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)",
        }}
        aria-hidden="true"
      >
        <svg
          className="wave absolute left-0 top-0"
          width={WAVE_W}
          height={WAVE_H}
          viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
          fill="none"
        >
          {WAVES.map((w) => (
            <path key={w.c} d={w.d} stroke={w.c} strokeWidth="1.6" strokeLinejoin="round" opacity="0.9" />
          ))}
        </svg>
      </div>

      <p className="relative mt-5 font-body text-[10px] uppercase tracking-[0.35em] text-white/30">
        TERA 2K26 · Dept. of EEE
      </p>
    </motion.div>
  );
};

export default PageTransitionLoader;