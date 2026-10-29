import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, CalendarDays, MapPin, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import CountdownTimer from "../CountdownTimer";

gsap.registerPlugin(ScrollTrigger);

const HERO_IMAGE = "/images/hero-bg.jpg";
const HERO_IMAGE_MOBILE = "/images/hero-bg-mobile.jpg";
const HERO_VIDEO = "/videos/hero-bg.mp4";
const HERO_VIDEO_MOBILE = "/videos/hero-bg-mobile.mp4";

const TICKER = [
  "SIMUVERSE",
  "PROJECT EXPO",
  "PAPER PRESENTATION",
  "ELECTRO ESCAPE ROOM",
  "TECHNICAL QUIZ",
];

const TERA = "TERA".split("");
const YEAR = "2K26".split("");

const charCls =
  "inline-block font-display text-[clamp(2.8rem,14vw,8rem)] font-black leading-[1.05] tracking-tight";

const shadowTxt = "[text-shadow:0_2px_20px_rgba(0,0,0,0.7)]";

/* ---------- lightning geometry ---------- */
type Pt = [number, number];

const jag = (ax: number, ay: number, bx: number, by: number, disp: number, depth: number): Pt[] => {
  let pts: Pt[] = [[ax, ay], [bx, by]];
  for (let d = 0; d < depth; d++) {
    const next: Pt[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const L = Math.hypot(dx, dy) || 1;
      const o = (Math.random() - 0.5) * 2 * disp;
      next.push(pts[i], [mx - (dy / L) * o, my + (dx / L) * o]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
    disp *= 0.55;
  }
  return pts;
};

const toPath = (pts: Pt[]) => {
  const p = new Path2D();
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  return p;
};

type Spark = { x: number; y: number; vx: number; vy: number; age: number; life: number };
type Bolt = {
  polys: { path: Path2D; w: number }[];
  born: number;
  life: number;
  tx: number;
  ty: number;
  sparks: Spark[];
};

const HeroSection = () => {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();

  const [imgOk, setImgOk] = useState(true);
  const [mobileImgOk] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  /* pick the video once, on the client */
  useEffect(() => {
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as any).connection?.saveData === true;
    if (noMotion || saveData) return;
    const mobile = !window.matchMedia("(min-width: 768px)").matches;
    setVideoSrc(mobile ? HERO_VIDEO_MOBILE : HERO_VIDEO);
  }, []);

  /* play only while the hero is on screen */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [videoSrc]);

  /* scroll parallax + desktop tilt */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.to("[data-hero-bg]", {
          yPercent: 14,
          scale: 1.06,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-hero-content]", {
          yPercent: -6,
          opacity: 0.35,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "60% top", scrub: true },
        });
      },
      root
    );

    mm.add(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        const tilt = tiltRef.current;
        if (!tilt) return;
        gsap.set(tilt, { transformPerspective: 900 });
        const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3" });
        const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          const r = root.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 5);
        };
        const onLeave = () => {
          rx(0);
          ry(0);
        };
        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);
        return () => {
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
        };
      },
      root
    );

    return () => mm.revert();
  }, []);

  /* tap-to-ignite lightning */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = rootRef.current;
    const canvas = canvasRef.current;
    const title = titleRef.current;
    const hint = hintRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let last = performance.now();
    let inView = true;
    let firstTimer = 0;
    let idleTimer = 0;
    let lastTap = 0;
    const bolts: Bolt[] = [];

    const resize = () => {
      const r = section.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(section);
    resize();

    const glitch = (amp: number) => {
      if (!title) return;
      gsap.killTweensOf(title);
      gsap
        .timeline()
        .set(title, { filter: "drop-shadow(0 0 34px rgba(255,90,40,0.95))" })
        .to(title, { x: -5 * amp, skewX: -4 * amp, duration: 0.04 })
        .to(title, { x: 4 * amp, skewX: 3 * amp, duration: 0.04 })
        .to(title, { x: 0, skewX: 0, duration: 0.07 })
        .to(title, {
          filter: "drop-shadow(0 0 0px rgba(255,90,40,0))",
          duration: 0.6,
          ease: "power2.out",
        });
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        const t = (now - b.born) / 1000 / b.life;
        if (t >= 1) {
          bolts.splice(i, 1);
          continue;
        }
        const flick =
          t < 0.16 ? 1 : (Math.random() < 0.45 ? 0.4 : 0.85) * (1 - (t - 0.16) / 0.84);

        if (t < 0.12) {
          ctx.fillStyle = `rgba(255,80,40,${0.14 * (1 - t / 0.12)})`;
          ctx.fillRect(0, 0, w, h);
        }

        const r = Math.min(w, h) * 0.35 * (0.6 + flick * 0.4);
        const g = ctx.createRadialGradient(b.tx, b.ty, 0, b.tx, b.ty, r);
        g.addColorStop(0, `rgba(255,150,70,${0.35 * flick})`);
        g.addColorStop(1, "rgba(255,60,30,0)");
        ctx.fillStyle = g;
        ctx.fillRect(b.tx - r, b.ty - r, r * 2, r * 2);

        for (const p of b.polys) {
          ctx.strokeStyle = `rgba(255,50,30,${flick * 0.18})`;
          ctx.lineWidth = 12 * p.w;
          ctx.stroke(p.path);
          ctx.strokeStyle = `rgba(255,140,40,${flick * 0.45})`;
          ctx.lineWidth = 5 * p.w;
          ctx.stroke(p.path);
          ctx.strokeStyle = `rgba(255,245,225,${flick})`;
          ctx.lineWidth = 1.8 * p.w;
          ctx.stroke(p.path);
        }

        for (let s = b.sparks.length - 1; s >= 0; s--) {
          const sp = b.sparks[s];
          sp.age += dt;
          if (sp.age >= sp.life) {
            b.sparks.splice(s, 1);
            continue;
          }
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.vy += 520 * dt;
          ctx.fillStyle = `rgba(255,190,90,${1 - sp.age / sp.life})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 1.6, 0, 6.283);
          ctx.fill();
        }
      }

      if (bolts.length) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
        ctx.clearRect(0, 0, w, h);
      }
    };

    const strike = (tx: number, ty: number, amp: number) => {
      if (!w) return;
      if (bolts.length >= 3) bolts.shift();

      const sx = Math.min(w - 20, Math.max(20, tx + (Math.random() - 0.5) * w * 0.35));
      const main = jag(sx, -10, tx, ty, Math.min(w, h) * 0.12, 7);
      const polys = [{ path: toPath(main), w: 1 }];

      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const k = 8 + Math.floor(Math.random() * Math.max(1, main.length - 16));
        const [bx, by] = main[k];
        const ang = Math.PI / 2 + (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.55);
        const len = h * (0.1 + Math.random() * 0.12);
        const br = jag(bx, by, bx + Math.cos(ang) * len, by + Math.sin(ang) * len, 18, 5);
        polys.push({ path: toPath(br), w: 0.45 });
      }

      const sparks: Spark[] = Array.from({ length: 14 }, () => ({
        x: tx,
        y: ty,
        vx: (Math.random() - 0.5) * 260,
        vy: -Math.random() * 220,
        age: 0,
        life: 0.5 + Math.random() * 0.3,
      }));

      bolts.push({ polys, born: performance.now(), life: 0.7, tx, ty, sparks });
      glitch(amp);

      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    /* user strikes */
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a,button")) return;
      const now = performance.now();
      if (now - lastTap < 220) return;
      lastTap = now;
      const r = section.getBoundingClientRect();
      strike(e.clientX - r.left, e.clientY - r.top, 0.6);
      navigator.vibrate?.(12);
      if (hint) hint.style.opacity = "0";
    };
    section.addEventListener("click", onClick);

    /* automatic strikes */
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(section);

    const idle = () => {
      idleTimer = window.setTimeout(() => {
        if (inView && !document.hidden) {
          const left = Math.random() < 0.5;
          const x = w * (left ? 0.08 + Math.random() * 0.2 : 0.72 + Math.random() * 0.2);
          const y = h * (0.3 + Math.random() * 0.4);
          strike(x, y, 0.5);
        }
        idle();
      }, 5500 + Math.random() * 4000);
    };

    firstTimer = window.setTimeout(() => {
      if (title) {
        const sr = section.getBoundingClientRect();
        const tr = title.getBoundingClientRect();
        strike(tr.left - sr.left + tr.width * 0.62, tr.top - sr.top + tr.height * 0.7, 1);
      }
      idle();
    }, 1500);

    return () => {
      window.clearTimeout(firstTimer);
      window.clearTimeout(idleTimer);
      cancelAnimationFrame(raf);
      section.removeEventListener("click", onClick);
      ro.disconnect();
      io.disconnect();
      if (title) gsap.killTweensOf(title);
    };
  }, []);

  const posterIsMobile = videoSrc === HERO_VIDEO_MOBILE;

  return (
    <section
      ref={rootRef}
      id="home"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#050507] text-white"
    >
      {/* ---------- background ---------- */}
      <div data-hero-bg className="absolute inset-0 z-0 will-change-transform">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 30%, rgba(255,60,40,0.30), transparent 70%), radial-gradient(60% 45% at 85% 90%, rgba(255,184,0,0.18), transparent 70%), radial-gradient(50% 40% at 10% 80%, rgba(255,60,40,0.14), transparent 70%)",
          }}
        />

        {imgOk && (
          <picture>
            {mobileImgOk && <source media="(max-width: 767px)" srcSet={HERO_IMAGE_MOBILE} />}
            <motion.img
              src={HERO_IMAGE}
              alt=""
              ref={(image) => image?.setAttribute("fetchpriority", "high")}
              onError={() => setImgOk(false)}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 0.95, scale: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-cover"
              decoding="async"
            />
          </picture>
        )}

        {videoSrc && (
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            poster={imgOk ? (posterIsMobile ? HERO_IMAGE_MOBILE : HERO_IMAGE) : undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoSrc(null)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

      {/* legibility + depth */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/15 to-black/60" />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* lightning layer */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] h-full w-full"
      />

      {/* ---------- content ---------- */}
      <div
        data-hero-content
        className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-28 pt-28 text-center sm:px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-primary/40 bg-black/30 px-5 py-2 font-body text-[11px] uppercase tracking-[0.24em] text-primary sm:px-7 sm:py-2.5 sm:text-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(255,60,40,0.9)]" />
            Department of EEE
          </span>
        </motion.div>

        {/* title (tilt wrapper -> glitch target) */}
        <div ref={tiltRef} className="mb-5 will-change-transform">
          <h1 ref={titleRef} aria-label="TERA 2K26">
            <span className="relative inline-block" aria-hidden="true">
              <span className="absolute -inset-x-6 inset-y-2 animate-pulse rounded-full bg-red-500/10 blur-3xl" />
              <span className="relative inline-flex flex-wrap justify-center gap-x-[0.25em]">
                <span className="inline-flex overflow-hidden pb-[0.08em]">
                  {TERA.map((c, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: "115%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.45 + i * 0.07, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                      className={`${charCls} bg-gradient-to-b from-white via-white to-amber-200 bg-clip-text text-transparent`}
                    >
                      {c}
                    </motion.span>
                  ))}
                </span>
                <span className="inline-flex overflow-hidden pb-[0.08em] pr-[0.06em]">
                  {YEAR.map((c, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: "115%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.85 + i * 0.07, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                      className={`${charCls} bg-gradient-to-b from-red-400 via-red-500 to-orange-500 bg-clip-text italic text-transparent`}
                    >
                      {c}
                    </motion.span>
                  ))}
                </span>
              </span>
            </span>
          </h1>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.3, duration: 0.9, ease: "easeOut" }}
          className="mx-auto mb-6 h-[3px] w-40 origin-center rounded-full bg-gradient-to-r from-transparent via-red-500 to-transparent sm:w-64"
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7 }}
          className={`mb-1 font-display text-base font-semibold tracking-wide text-white/90 sm:text-xl md:text-2xl ${shadowTxt}`}
        >
          Madanapalle Institute of Technology &amp; Science
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.7 }}
          className={`mb-5 font-body text-xs uppercase tracking-[0.22em] text-white/65 sm:text-sm ${shadowTxt}`}
        >
          (Deemed to be University)
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.7 }}
          className={`mx-auto mb-6 max-w-2xl px-2 font-body text-sm leading-relaxed text-white/80 sm:text-lg ${shadowTxt}`}
        >
          A National Level Two-Day Symposium celebrating electrical engineering,
          innovation, and the future of technology.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.75, duration: 0.7 }}
          className="mb-8 flex flex-wrap justify-center gap-2.5"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 font-body text-xs text-white/85 sm:text-sm">
            <CalendarDays className="h-4 w-4 text-primary" />
            November 11–12, 2026
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 font-body text-xs text-white/85 sm:text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            MITS, Madanapalle
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.8 }}
          className="mb-9"
        >
          <CountdownTimer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="flex flex-col justify-center gap-3 px-2 sm:flex-row sm:px-0"
        >
          <Link
            to="/events"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-white px-8 font-body text-sm font-bold text-black shadow-[0_12px_36px_-10px_rgba(255,80,40,0.7)] transition active:scale-[0.97]"
          >
            Explore Events &amp; Register
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/schedule"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/25 bg-white/[0.06] px-8 font-body text-sm font-bold text-white transition hover:bg-white/10 active:scale-[0.97]"
          >
            View Schedule
          </Link>
        </motion.div>

        <motion.p
          ref={hintRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.8 }}
          className="mt-6 inline-flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.3em] text-white/50 transition-opacity duration-700"
        >
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          <span>
            <span className="hidden [@media(hover:hover)]:inline">Click</span>
            <span className="[@media(hover:hover)]:hidden">Tap</span> anywhere to ignite
          </span>
        </motion.p>
      </div>

      {/* event ticker */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden border-t border-white/10 bg-black/45"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <motion.div
          className="flex w-max items-center will-change-transform"
          animate={reduced ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          {[0, 1].map((g) => (
            <div key={g} className="flex shrink-0 items-center" aria-hidden={g === 1}>
              {[...TICKER, ...TICKER].map((t, i) => (
                <span
                  key={i}
                  className="flex items-center gap-5 py-3 pr-5 font-body text-[11px] font-semibold uppercase tracking-[0.32em] text-white/60"
                >
                  {t}
                  <Zap className="h-3 w-3 text-red-400" />
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;