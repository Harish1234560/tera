import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";

const logo = "/EEElogo.png";

const SEGMENTS = 28;
const RING_TEXT = "DEPARTMENT OF EEE  ·  MITS MADANAPALLE  ·  NATIONAL LEVEL SYMPOSIUM  ·  ";

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")";

const RAYS =
  "conic-gradient(from 0deg, transparent 0deg, rgba(255,70,40,0.16) 10deg, transparent 22deg, transparent 60deg, rgba(255,184,0,0.10) 72deg, transparent 84deg, transparent 120deg, rgba(255,70,40,0.14) 132deg, transparent 144deg, transparent 180deg, rgba(255,184,0,0.10) 192deg, transparent 204deg, transparent 240deg, rgba(255,70,40,0.14) 252deg, transparent 264deg, transparent 300deg, rgba(255,184,0,0.10) 312deg, transparent 324deg)";

/* ---------- seeded circuit-trace generator (same layout every visit) ---------- */
const mulberry32 = (seed: number) => () => {
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

interface Trace {
  d: string;
  end: [number, number];
}

/* units: 100 = logo diameter, logo centre = (0,0) */
const buildTraces = (count: number): Trace[] => {
  const rnd = mulberry32(2026);
  const out: Trace[] = [];
  for (let k = 0; k < count; k++) {
    const base = (k / count) * Math.PI * 2 + (rnd() - 0.5) * 0.25;
    let x = Math.cos(base) * 66;
    let y = Math.sin(base) * 66;
    let di = ((Math.round(base / (Math.PI / 4)) % 8) + 8) % 8;
    const pts: [number, number][] = [[x, y]];
    const segs = 3 + Math.floor(rnd() * 3);
    for (let s = 0; s < segs; s++) {
      const len = 22 + rnd() * 48;
      x += DIRS[di][0] * len;
      y += DIRS[di][1] * len;
      pts.push([x, y]);
      const turn = rnd() < 0.5 ? -1 : 1;
      di = (di + turn + 8) % 8;
      if (DIRS[di][0] * x + DIRS[di][1] * y < 0) di = (di - 2 * turn + 16) % 8;
    }
    out.push({
      d: pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" "),
      end: pts[pts.length - 1],
    });
  }
  return out;
};

/* ---------- jagged lightning polyline (midpoint displacement) ---------- */
type Pt = [number, number];
const jag = (ax: number, ay: number, bx: number, by: number, disp: number, depth: number): Pt[] => {
  let pts: Pt[] = [[ax, ay], [bx, by]];
  for (let d = 0; d < depth; d++) {
    const next: Pt[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const L = Math.hypot(dx, dy) || 1;
      const o = (Math.random() - 0.5) * 2 * disp;
      next.push(pts[i], [(x1 + x2) / 2 - (dy / L) * o, (y1 + y2) / 2 + (dx / L) * o]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
    disp *= 0.55;
  }
  return pts;
};

const Word = ({ text, className }: { text: string; className: string }) => (
  <span className="inline-flex" aria-hidden="true">
    {text.split("").map((c, i) => (
      <span key={i} className="inline-block overflow-hidden pb-[0.1em] pr-[0.06em]">
        <span data-char className={`inline-block ${className}`}>
          {c}
        </span>
      </span>
    ))}
  </span>
);

interface Pointer {
  x: number;
  y: number;
  down: boolean;
  last: number;
  tap: boolean;
}

const IntroSplash = ({ onComplete }: { onComplete: () => void }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const medalRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const exitRef = useRef<gsap.core.Timeline | null>(null);
  const doneRef = useRef(false);
  const ptr = useRef<Pointer>({ x: 0, y: 0, down: false, last: -1e9, tap: false });
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [gone, setGone] = useState(false);

  const traces = useMemo(
    () => buildTraces(typeof window !== "undefined" && window.innerWidth < 768 ? 10 : 18),
    []
  );

  /* ---------- dismiss: iris-close reveal of the site ---------- */
  const dismiss = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    tlRef.current?.kill();

    const finish = () => {
      setGone(true);
      onCompleteRef.current();
    };

    const root = rootRef.current;
    if (!root) {
      finish();
      return;
    }

    exitRef.current = gsap
      .timeline({ onComplete: finish })
      .to(
        root.querySelector("[data-content]"),
        { scale: 1.08, opacity: 0, duration: 0.55, ease: "power2.in" },
        0
      )
      .fromTo(
        root,
        { clipPath: "circle(150% at 50% 38%)" },
        { clipPath: "circle(0% at 50% 38%)", duration: 0.85, ease: "power3.inOut" },
        0.2
      );
  }, []);

  /* ---------- lock page scroll while visible ---------- */
  useEffect(() => {
    if (gone) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [gone]);

  /* ---------- keyboard skip ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss]);

  /* ---------- pointer input (drives the plasma arcs) ---------- */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const p = ptr.current;
    p.x = e.clientX;
    p.y = e.clientY;
    p.down = true;
    p.last = performance.now();
    p.tap = true;
    navigator.vibrate?.(10);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = ptr.current;
    p.x = e.clientX;
    p.y = e.clientY;
    if (e.pointerType === "mouse" || p.down) p.last = performance.now();
  };
  const onPointerUp = () => {
    ptr.current.down = false;
  };

  /* ---------- circular text: stretch to exactly fill the ring ---------- */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fit = () => {
      const tp = root.querySelector<SVGTextPathElement>("[data-textpath]");
      if (!tp) return;
      tp.setAttribute("letter-spacing", "0");
      const len = tp.getComputedTextLength();
      const target = 2 * Math.PI * 60;
      if (len > 0) tp.setAttribute("letter-spacing", ((target - len) / RING_TEXT.length).toFixed(3));
    };
    fit();
    document.fonts?.ready.then(fit);
  }, []);

  /* ---------- main choreography ---------- */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let removePointer = () => {};

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.delayedCall(2.5, dismiss);
        return;
      }

      const q = gsap.utils.selector(root);

      /* idle loops */
      gsap.to(q("[data-spin-a]"), { rotation: 360, duration: 26, ease: "none", repeat: -1 });
      gsap.to(q("[data-spin-b]"), { rotation: -360, duration: 38, ease: "none", repeat: -1 });
      gsap.to(q("[data-textring]"), { rotation: 360, duration: 60, ease: "none", repeat: -1 });
      gsap.to(q("[data-rays]"), { rotation: 360, duration: 70, ease: "none", repeat: -1 });
      gsap.to(q("[data-rim]"), { rotation: 360, duration: 6, ease: "none", repeat: -1 });
      gsap.to(q("[data-glow]"), { scale: 1.15, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(q("[data-float]"), { y: -8, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });

      /* glass sweep across the medallion */
      gsap.fromTo(
        q("[data-medal-sheen]"),
        { xPercent: -160 },
        { xPercent: 260, duration: 1.4, ease: "power2.inOut", repeat: -1, repeatDelay: 3.2, delay: 2.6 }
      );

      /* neon flicker on the accent, in short bursts */
      gsap
        .timeline({ repeat: -1, repeatDelay: 3.2, delay: 4 })
        .to(q("[data-accent]"), { opacity: 0.35, duration: 0.05 })
        .to(q("[data-accent]"), { opacity: 1, duration: 0.05 })
        .to(q("[data-accent]"), { opacity: 0.55, duration: 0.05 })
        .to(q("[data-accent]"), { opacity: 1, duration: 0.14 });

      /* pointer parallax + 3D tilt (desktop only) */
      if (window.matchMedia("(pointer: fine)").matches) {
        const par = q("[data-parallax]")[0];
        if (par) {
          gsap.set(par, { transformPerspective: 900 });
          const mx = gsap.quickTo(par, "x", { duration: 0.8, ease: "power3" });
          const my = gsap.quickTo(par, "y", { duration: 0.8, ease: "power3" });
          const rx = gsap.quickTo(par, "rotationX", { duration: 0.9, ease: "power3" });
          const ry = gsap.quickTo(par, "rotationY", { duration: 0.9, ease: "power3" });
          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            mx(nx * 24);
            my(ny * 18);
            ry(nx * 14);
            rx(-ny * 10);
          };
          root.addEventListener("pointermove", onMove);
          removePointer = () => root.removeEventListener("pointermove", onMove);
        }
      }

      /* lightning bolt setup */
      const bolt = root.querySelector<SVGPathElement>("[data-bolt]");
      const boltLen = bolt ? bolt.getTotalLength() : 600;
      if (bolt) gsap.set(bolt, { strokeDasharray: boltLen });

      /* intro timeline */
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tlRef.current = tl;

      tl.fromTo(q("[data-hud]"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.9, stagger: 0.06 }, 0.3)

        /* strike -> flash -> logo */
        .fromTo(q("[data-bolt]"), { strokeDashoffset: boltLen }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.in" }, 0.25)
        .set(q("[data-flash]"), { opacity: 1, scale: 0.2 }, 0.7)
        .to(q("[data-flash]"), { scale: 2.6, opacity: 0, duration: 0.9, ease: "power2.out" }, 0.7)
        .set(q("[data-flare]"), { opacity: 1, scaleX: 0 }, 0.7)
        .to(q("[data-flare]"), { scaleX: 1, duration: 0.5, ease: "power3.out" }, 0.7)
        .to(q("[data-flare]"), { opacity: 0, duration: 0.9, ease: "power2.in" }, 1.1)
        .set(q("[data-shock]"), { scale: 0.6, opacity: 0.9 }, 0.72)
        .to(q("[data-shock]"), { scale: 4.5, opacity: 0, duration: 1.6, ease: "power2.out", stagger: 0.18 }, 0.72)
        .to(q("[data-bolt]"), { opacity: 0, duration: 0.3 }, 0.75)
        .fromTo(q("[data-glow-wrap]"), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.7)
        .fromTo(q("[data-rays]"), { opacity: 0 }, { opacity: 1, duration: 1.8 }, 0.8)
        .fromTo(q("[data-medal]"), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, ease: "expo.out" }, 0.7)
        .fromTo(q("[data-rim]"), { opacity: 0 }, { opacity: 1, duration: 1.1 }, 0.9)
        .fromTo(q("[data-textring]"), { opacity: 0 }, { opacity: 1, duration: 1.4 }, 1.1)
        .fromTo(q("[data-ring-draw]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, 0.85)
        .fromTo(q("[data-ring-fade]"), { opacity: 0 }, { opacity: 1, duration: 1.1, stagger: 0.15 }, 0.95);

      /* circuit traces bloom outward with the shockwave */
      root.querySelectorAll<SVGPathElement>("[data-trace]").forEach((el, i) => {
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(el, { strokeDashoffset: 0, duration: 1.4, ease: "power2.out" }, 0.8 + i * 0.05);
      });
      tl.fromTo(
        q("[data-node]"),
        { opacity: 0, scale: 0.2, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.04 },
        1.7
      );

      /* current pulses running along the traces */
      root.querySelectorAll<SVGGElement>("[data-pulse-g]").forEach((g, i) => {
        const paths = Array.from(g.querySelectorAll<SVGPathElement>("path"));
        const len = paths[0].getTotalLength();
        gsap.set(paths, { strokeDasharray: `6 ${len + 10}`, strokeDashoffset: 6 });
        gsap.to(paths, {
          strokeDashoffset: -len,
          duration: 1.6 + ((i * 37) % 17) / 10,
          ease: "power1.in",
          repeat: -1,
          repeatDelay: 0.4 + ((i * 53) % 20) / 10,
          delay: 2.1 + ((i * 29) % 15) / 10,
        });
      });

      /* text */
      tl.fromTo(q("[data-dept]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 1.2)
        .fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, 1.25)
        .fromTo(q("[data-presents]"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 }, 1.4)
        .fromTo(q("[data-char]"), { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }, 1.55)
        .fromTo(q("[data-mid]"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(2)" }, 2.1)
        .fromTo(q("[data-midrule]"), { scaleY: 0 }, { scaleY: 1, duration: 0.6, stagger: 0.1 }, 2.25)
        .fromTo(q("[data-sheen]"), { xPercent: -130 }, { xPercent: 260, duration: 1.2, ease: "power2.inOut" }, 2.45)
        .fromTo(q("[data-fade]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.14 }, 2.4)
        .fromTo(q("[data-cta]"), { opacity: 0, y: 20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, 2.7);

      /* charging meter doubles as the auto-continue timer */
      const segs = q("[data-seg]") as HTMLElement[];
      const kv = root.querySelector<HTMLElement>("[data-kv]");
      const hz = root.querySelector<HTMLElement>("[data-hz]");
      const rulers = q("[data-ruler]") as HTMLElement[];
      const prog = { v: 0 };
      let lit = 0;
      let tick = 0;
      tl.to(
        prog,
        {
          v: 100,
          duration: 3.4,
          ease: "none",
          onUpdate: () => {
            const n = Math.floor((prog.v / 100) * segs.length);
            while (lit < n) {
              const s = segs[lit++];
              s.style.opacity = "1";
              s.style.boxShadow = "0 0 8px rgba(255,120,40,0.8)";
            }
            if (kv) kv.textContent = `${((prog.v / 100) * 11).toFixed(1)} kV`;
            rulers.forEach((r) => (r.style.top = `${prog.v}%`));
            if (hz && ++tick % 5 === 0) hz.textContent = `${(50 + (Math.random() - 0.5) * 0.06).toFixed(2)} Hz`;
          },
          onComplete: dismiss,
        },
        2.8
      );
    }, root);

    return () => {
      removePointer();
      exitRef.current?.kill();
      ctx.revert();
    };
  }, [dismiss]);

  /* ---------- canvas fx: warp tunnel, embers, plasma arcs ---------- */
  useEffect(() => {
    if (gone) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const medal = medalRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !medal || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    const t0 = performance.now();
    let last = t0;

    /* embers */
    type Ember = { x: number; y: number; vx: number; vy: number; r: number; age: number; life: number; hue: number };
    const embers: Ember[] = [];
    const spawn = (e: Ember, scatter: boolean) => {
      e.x = Math.random() * w;
      e.y = scatter ? Math.random() * h : h + 10;
      e.vx = (Math.random() - 0.5) * 12;
      e.vy = -(30 + Math.random() * 70);
      e.r = 0.6 + Math.random() * 1.6;
      e.life = 3 + Math.random() * 4;
      e.age = scatter ? Math.random() * e.life : 0;
      e.hue = 8 + Math.random() * 38;
    };

    /* warp rings + speed streaks */
    const RINGS = 12;
    const ringP = Array.from({ length: RINGS }, (_, i) => i / RINGS);
    const streaks = Array.from({ length: 44 }, () => ({
      a: Math.random() * Math.PI * 2,
      p: Math.random(),
      s: 0.6 + Math.random() * 0.8,
    }));

    /* arcs */
    type Arc = { pts: Pt[]; born: number; life: number; w: number };
    const arcs: Arc[] = [];
    let cx = 0;
    let cy = 0;
    let R = 0;
    let liveArc: { pts: Pt[]; branch: Pt[]; at: number } | null = null;

    const strokeArc = (pts: Pt[], a: number, wd: number) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.strokeStyle = `rgba(255,50,30,${0.18 * a})`;
      ctx.lineWidth = wd * 5;
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,140,40,${0.5 * a})`;
      ctx.lineWidth = wd * 2.2;
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,245,225,${a})`;
      ctx.lineWidth = wd * 0.9;
      ctx.stroke();
    };

    const burst = (count: number, len: number, a0: number) => {
      for (let i = 0; i < count; i++) {
        const a = a0 + (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        const ex = cx + Math.cos(a) * (R + len);
        const ey = cy + Math.sin(a) * (R + len);
        arcs.push({
          pts: jag(cx + Math.cos(a) * R * 0.6, cy + Math.sin(a) * R * 0.6, ex, ey, len * 0.16, 5),
          born: performance.now(),
          life: 0.5,
          w: 1,
        });
      }
    };
    const burstAt = [0.72, 2.3, 3.9, 5.3];
    let burstIdx = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = w < 768 ? 22 : 44;
      while (embers.length < target) {
        const e = {} as Ember;
        spawn(e, true);
        embers.push(e);
      }
      embers.length = Math.min(embers.length, target);
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = (now - t0) / 1000;

      const mr = medal.getBoundingClientRect();
      cx = mr.left + mr.width / 2;
      cy = mr.top + mr.height / 2;
      R = mr.width / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      /* warp: strong for the first ~2.4s, then a calm idle tunnel */
      const warp = Math.max(0, 1 - t / 2.4);
      const w2 = warp * warp;
      const maxR = Math.hypot(w, h) * 0.62;
      const speed = 0.1 + 1.5 * w2;
      for (let i = 0; i < RINGS; i++) {
        ringP[i] = (ringP[i] + speed * dt) % 1;
        const p = ringP[i];
        const r = R * 0.9 + Math.pow(p, 2.2) * maxR;
        const a = Math.sin(Math.PI * p) * (0.1 + 0.5 * w2);
        ctx.strokeStyle = `rgba(255,${90 + (i % 3) * 40},40,${a})`;
        ctx.lineWidth = 0.6 + p * 2.4 * (0.5 + w2);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 6.283);
        ctx.stroke();
      }
      if (w2 > 0.02) {
        for (const s of streaks) {
          s.p = (s.p + (0.6 + 2.2 * w2) * s.s * dt) % 1;
          const r1 = R * 1.1 + Math.pow(s.p, 2) * maxR;
          const r2 = r1 + 12 + 160 * w2 * s.p;
          const ca = Math.cos(s.a);
          const sa = Math.sin(s.a);
          ctx.strokeStyle = `rgba(255,200,140,${w2 * Math.sin(Math.PI * s.p) * 0.8})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx + ca * r1, cy + sa * r1);
          ctx.lineTo(cx + ca * r2, cy + sa * r2);
          ctx.stroke();
        }
      }

      /* embers */
      for (const e of embers) {
        e.age += dt;
        if (e.age >= e.life) {
          spawn(e, false);
          continue;
        }
        e.x += (e.vx + Math.sin(e.age * 2 + e.y * 0.01) * 8) * dt;
        e.y += e.vy * dt;
        const a = Math.sin(Math.PI * (e.age / e.life));
        ctx.fillStyle = `hsla(${e.hue},100%,60%,${a * 0.18})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 4, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = `hsla(${e.hue},100%,70%,${a * 0.9})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, 6.283);
        ctx.fill();
      }

      /* scheduled zaps around the logo */
      while (burstIdx < burstAt.length && t >= burstAt[burstIdx]) {
        burst(burstIdx === 0 ? 7 : 3, Math.min(w, h) * (burstIdx === 0 ? 0.34 : 0.22), Math.random() * 6.283);
        burstIdx++;
      }

      /* tap = a held arc to the finger */
      const p = ptr.current;
      if (p.tap) {
        p.tap = false;
        const d = Math.hypot(p.x - cx, p.y - cy);
        if (d > R) {
          arcs.push({ pts: jag(cx, cy, p.x, p.y, Math.min(120, d * 0.18), 6), born: now, life: 0.55, w: 1.2 });
        }
      }

      /* live plasma arc while the pointer moves / is held */
      const idle = now - p.last;
      if (p.down || idle < 700) {
        const d = Math.hypot(p.x - cx, p.y - cy);
        if (d > R) {
          if (!liveArc || now - liveArc.at > 55) {
            const disp = Math.min(110, d * 0.18);
            const pts = jag(cx, cy, p.x, p.y, disp, 6);
            const k = 8 + Math.floor(Math.random() * Math.max(1, pts.length - 16));
            const [bx, by] = pts[k];
            const ang = Math.atan2(p.y - cy, p.x - cx) + (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.6);
            const bl = 40 + Math.random() * 70;
            liveArc = { pts, branch: jag(bx, by, bx + Math.cos(ang) * bl, by + Math.sin(ang) * bl, 12, 4), at: now };
          }
          const a = p.down ? 1 : 1 - idle / 700;
          strokeArc(liveArc.pts, a, 1);
          strokeArc(liveArc.branch, a * 0.8, 0.5);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 46);
          g.addColorStop(0, `rgba(255,170,80,${0.5 * a})`);
          g.addColorStop(1, "rgba(255,60,30,0)");
          ctx.fillStyle = g;
          ctx.fillRect(p.x - 46, p.y - 46, 92, 92);
        }
      } else {
        liveArc = null;
      }

      /* fixed arcs (bursts, taps) with a flicker */
      for (let i = arcs.length - 1; i >= 0; i--) {
        const ar = arcs[i];
        const age = (now - ar.born) / 1000 / ar.life;
        if (age >= 1) {
          arcs.splice(i, 1);
          continue;
        }
        const flick = (Math.random() < 0.3 ? 0.5 : 1) * (1 - age);
        strokeArc(ar.pts, flick, ar.w);
      }

      raf = requestAnimationFrame(frame);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      role="dialog"
      aria-label="TERA Ignite 2K26 introduction"
      className="fixed inset-0 z-[9999] touch-none select-none overflow-hidden bg-[#050507] text-white"
    >
      {/* ---------- background layers ---------- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 38%, rgba(255,60,40,0.20), transparent 70%), radial-gradient(55% 40% at 50% 100%, rgba(255,184,0,0.12), transparent 70%), radial-gradient(40% 30% at 0% 0%, rgba(255,60,40,0.08), transparent 70%)",
        }}
      />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(0,0,0,0.75) 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      {/* anamorphic lens flare on ignition */}
      <div
        data-flare
        className="pointer-events-none absolute left-1/2 top-[38%] h-[2px] w-[160vw] -translate-x-1/2 opacity-0 mix-blend-screen"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,120,60,0.8) 30%, #fff 50%, rgba(255,120,60,0.8) 70%, transparent)",
        }}
      />

      {/* ---------- HUD corners + labels ---------- */}
      <span data-hud className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l border-t border-white/30" style={{ marginTop: "env(safe-area-inset-top)" }} />
      <span data-hud className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r border-t border-white/30" style={{ marginTop: "env(safe-area-inset-top)" }} />
      <span data-hud className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b border-l border-white/30" style={{ marginBottom: "env(safe-area-inset-bottom)" }} />
      <span data-hud className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b border-r border-white/30" style={{ marginBottom: "env(safe-area-inset-bottom)" }} />
      <span
        data-hud
        className="pointer-events-none absolute left-11 top-4 font-body text-[9px] font-semibold uppercase tracking-[0.3em] text-white/35"
        style={{ marginTop: "calc(env(safe-area-inset-top) + 3px)" }}
      >
        MITS · EEE
      </span>
      <span
        data-hud
        className="pointer-events-none absolute right-11 top-4 font-body text-[9px] font-semibold uppercase tracking-[0.3em] text-white/35"
        style={{ marginTop: "calc(env(safe-area-inset-top) + 3px)" }}
      >
        Nov 11–12 · 2026
      </span>

      {/* side rulers (desktop): the marker follows the charge */}
      {[0, 1].map((side) => (
        <div
          key={side}
          data-hud
          className={`pointer-events-none absolute top-1/2 hidden h-56 w-4 -translate-y-1/2 md:block ${side ? "right-7" : "left-7"}`}
        >
          <div className={`absolute inset-y-0 w-px bg-white/15 ${side ? "right-0" : "left-0"}`} />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.35) 0 1px, transparent 1px 8px)",
              backgroundSize: "10px 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: side ? "right" : "left",
            }}
          />
          {side === 0 && (
            <span
              data-ruler
              className="absolute left-0 h-[2px] w-4 bg-gradient-to-r from-red-500 to-amber-300 shadow-[0_0_10px_rgba(255,120,40,0.9)]"
              style={{ top: "0%" }}
            />
          )}
        </div>
      ))}

      {/* ---------- content ---------- */}
      <div
        data-content
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        }}
      >
        {/* logo medallion */}
        <div data-parallax className="relative mb-8 md:mb-10">
          <div data-float className="relative">
            <div className="relative aspect-square w-[min(50vw,32dvh,290px)]">
              {/* light rays */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[900%] w-[900%] -translate-x-1/2 -translate-y-1/2">
                <div
                  data-rays
                  className="h-full w-full will-change-transform"
                  style={{
                    background: RAYS,
                    WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 60%)",
                    maskImage: "radial-gradient(circle, #000 0%, transparent 60%)",
                  }}
                />
              </div>

              {/* circuit traces (100 units = logo diameter) */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600%] w-[600%] -translate-x-1/2 -translate-y-1/2">
                <svg viewBox="-300 -300 600 600" className="h-full w-full" fill="none" aria-hidden="true">
                  {traces.map((t, i) => (
                    <g key={i}>
                      <path data-trace d={t.d} stroke="rgba(255,120,60,0.38)" strokeWidth="0.35" strokeLinejoin="round" />
                      <circle data-node cx={t.end[0]} cy={t.end[1]} r="1.3" stroke="rgba(255,170,70,0.85)" strokeWidth="0.3" fill="#050507" />
                      <g data-pulse-g>
                        <path d={t.d} stroke="rgba(255,90,40,0.35)" strokeWidth="1.8" strokeDasharray="0 9999" />
                        <path d={t.d} stroke="#fff1d6" strokeWidth="0.7" strokeDasharray="0 9999" />
                      </g>
                    </g>
                  ))}
                </svg>
              </div>

              {/* glow */}
              <div data-glow-wrap className="pointer-events-none absolute -inset-[38%]">
                <div
                  data-glow
                  className="h-full w-full rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255,60,40,0.38) 0%, rgba(255,150,30,0.14) 40%, transparent 68%)",
                  }}
                />
              </div>

              {/* shockwave rings */}
              <div data-shock className="pointer-events-none absolute inset-0 rounded-full border border-red-400/70 opacity-0" />
              <div data-shock className="pointer-events-none absolute inset-0 rounded-full border border-amber-300/50 opacity-0" />

              {/* lightning bolt: ends at the centre of the logo */}
              <svg
                className="pointer-events-none absolute bottom-1/2 left-1/2 -translate-x-1/2"
                width="60"
                height="600"
                viewBox="0 0 60 600"
                fill="none"
                style={{ filter: "drop-shadow(0 0 8px rgba(255,90,40,0.95))" }}
              >
                <path data-bolt d="M30 0 L25 110 L37 170 L23 260 L35 330 L24 420 L33 480 L28 540 L30 600" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              {/* rotating text ring (radius 60 of 100 = just outside the medallion) */}
              <svg
                data-textring
                className="pointer-events-none absolute -inset-[30%] h-[160%] w-[160%]"
                viewBox="-80 -80 160 160"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <path id="tera-text-circle" d="M 0 -60 A 60 60 0 1 1 -0.01 -60" />
                </defs>
                <text fill="rgba(255,255,255,0.55)" fontSize="4.2" fontWeight="600" className="font-body">
                  <textPath data-textpath href="#tera-text-circle">
                    {RING_TEXT}
                  </textPath>
                </text>
              </svg>

              {/* rings */}
              <svg data-spin-a className="pointer-events-none absolute -inset-[12%] h-[124%] w-[124%]" viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id="tera-ring-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ff2d2d" />
                    <stop offset="0.55" stopColor="#ff7a1a" />
                    <stop offset="1" stopColor="#ffc233" />
                  </linearGradient>
                </defs>
                <circle data-ring-draw cx="50" cy="50" r="49.3" pathLength={1} strokeDasharray="1" stroke="url(#tera-ring-grad)" strokeWidth="0.35" strokeLinecap="round" />
                <circle data-ring-fade cx="50" cy="50" r="47.3" pathLength={1} strokeDasharray="0.003 0.01215" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.9" />
                <circle data-ring-fade cx="50" cy="0.7" r="1.1" fill="#ffd166" />
              </svg>
              <svg data-spin-b className="pointer-events-none absolute -inset-[12%] h-[124%] w-[124%]" viewBox="0 0 100 100" fill="none">
                <circle data-ring-fade cx="50" cy="50" r="45.3" pathLength={1} strokeDasharray="0.19 0.06" stroke="url(#tera-ring-grad)" strokeWidth="1.1" strokeLinecap="round" />
              </svg>

              {/* spinning gradient rim (the medallion covers its centre) */}
              <div
                data-rim
                className="pointer-events-none absolute -inset-[4px] z-[9] rounded-full will-change-transform"
                style={{
                  background: "conic-gradient(from 0deg, #ff2d2d, #ffb400 25%, transparent 45%, transparent 55%, #ff7a1a 75%, #ff2d2d)",
                }}
              />

              {/* medallion */}
              <div
                ref={medalRef}
                data-medal
                className="relative z-10 h-full w-full overflow-hidden rounded-full bg-white will-change-transform"
                style={{
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.12), 0 0 60px rgba(255,50,40,0.45), 0 20px 60px rgba(0,0,0,0.6)",
                }}
              >
                <img src={logo} alt="TERA Ignite 2K26 2.0 logo" draggable={false} decoding="async" className="h-full w-full scale-[1.14] object-cover" />
                <div
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    boxShadow: "inset 0 0 28px rgba(0,0,0,0.14)",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.35), transparent 45%)",
                  }}
                />
                {/* glass sweep */}
                <div
                  data-medal-sheen
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                />
              </div>

              {/* ignition flash */}
              <div
                data-flash
                className="pointer-events-none absolute -inset-[10%] z-20 rounded-full opacity-0 mix-blend-screen"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,90,40,0.5) 35%, transparent 70%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* department */}
        <div data-dept className="relative z-[1] flex items-center gap-3">
          <span data-rule className="h-px w-8 origin-right bg-gradient-to-l from-red-500/80 to-transparent md:w-14" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.38em] text-white/70 md:text-xs">
            Department of EEE
          </span>
          <span data-rule className="h-px w-8 origin-left bg-gradient-to-r from-red-500/80 to-transparent md:w-14" />
        </div>

        <p data-presents className="relative z-[1] mt-3 text-[10px] uppercase tracking-[0.5em] text-amber-300/80">
          Presents
        </p>

        {/* title: TERA  Ignite  2K26 (middle word small) */}
        <h1
          className="relative z-[1] mt-3 overflow-hidden whitespace-nowrap font-display text-[clamp(2.2rem,10.5vw,6.5rem)] font-black leading-[1.05] tracking-tight"
          style={{ filter: "drop-shadow(0 0 22px rgba(255,80,40,0.35))" }}
          aria-label="TERA Ignite 2K26"
        >
          <span className="sr-only">TERA Ignite 2K26</span>
          <span className="relative flex items-center justify-center gap-[0.16em]" aria-hidden="true">
            <Word text="TERA" className="bg-gradient-to-b from-white via-amber-100 to-amber-300 bg-clip-text text-transparent" />

            <span data-mid className="flex flex-col items-center self-center">
              <span data-midrule className="h-[0.22em] w-px origin-bottom bg-gradient-to-t from-red-400 to-transparent" />
              <span className="py-[0.06em] font-display text-[max(0.3em,0.85rem)] font-semibold italic leading-none tracking-[0.08em] bg-gradient-to-r from-red-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                Ignite
              </span>
              <span data-midrule className="h-[0.22em] w-px origin-top bg-gradient-to-b from-amber-300 to-transparent" />
            </span>

            <span data-accent className="inline-flex">
              <Word text="2K26" className="bg-gradient-to-b from-red-400 via-red-500 to-orange-500 bg-clip-text italic text-transparent" />
            </span>
          </span>
          <span
            data-sheen
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent mix-blend-overlay"
          />
        </h1>

        <p data-fade className="relative z-[1] mt-4 max-w-sm text-sm leading-relaxed text-white/80 md:max-w-xl md:text-base">
          Madanapalle Institute of Technology &amp; Science
          <br />
          <span className="text-white/55">(Deemed to be University)</span>
        </p>

        {/* CTA + charging meter */}
        <div data-cta className="relative z-[1] mt-7 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={dismiss}
            className="group relative inline-flex min-h-[48px] items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-white/[0.06] px-7 py-3 text-xs font-bold uppercase tracking-[0.26em] text-white backdrop-blur-sm transition-colors hover:border-white/30 active:scale-[0.97]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-orange-500/25 to-amber-400/30" />
            <span className="relative">Enter the Experience</span>
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="w-[min(78vw,260px)]">
            <div className="mb-2 flex items-center justify-between font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-white/45">
              <span>Charging</span>
              <span data-kv className="tabular-nums text-amber-300">
                0.0 kV
              </span>
            </div>
            <div className="flex items-end gap-[3px]">
              {Array.from({ length: SEGMENTS }).map((_, i) => (
                <span
                  key={i}
                  data-seg
                  className="h-3 flex-1 rounded-[1px] bg-gradient-to-t from-red-600 to-amber-300"
                  style={{ opacity: 0.14 }}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between font-body text-[9px] font-semibold uppercase tracking-[0.25em] text-white/35">
              <span className="flex items-center gap-1.5">
                <i className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <i className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <i className="h-1.5 w-1.5 rounded-full bg-white" />
                R · Y · B
              </span>
              <span data-hz className="tabular-nums">
                50.00 Hz
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="min-h-[44px] px-4 text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-white/70"
          >
            Skip intro
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroSplash;