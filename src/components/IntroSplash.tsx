import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";

const logo = "/EEElogo.png";

const TITLE = "TERA";
const ACCENT = "2K26";

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")";

const Word = ({ text, className }: { text: string; className: string }) => (
  <span className="inline-flex" aria-hidden="true">
    {text.split("").map((c, i) => (
      <span
        key={i}
        className="inline-block overflow-hidden pb-[0.1em] pr-[0.06em]"
      >
        <span data-char className={`inline-block ${className}`}>
          {c}
        </span>
      </span>
    ))}
  </span>
);

const IntroSplash = ({ onComplete }: { onComplete: () => void }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const exitRef = useRef<gsap.core.Timeline | null>(null);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [gone, setGone] = useState(false);

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
      gsap.to(q("[data-glow]"), {
        scale: 1.15,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(q("[data-float]"), {
        y: -8,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.fromTo(
        q("[data-scan]"),
        { y: -10 },
        {
          y: window.innerHeight,
          duration: 3.2,
          ease: "none",
          repeat: -1,
          repeatDelay: 1.2,
          delay: 1,
        }
      );

      /* pointer parallax (desktop only) */
      if (window.matchMedia("(pointer: fine)").matches) {
        const par = q("[data-parallax]")[0];
        if (par) {
          const mx = gsap.quickTo(par, "x", { duration: 0.8, ease: "power3" });
          const my = gsap.quickTo(par, "y", { duration: 0.8, ease: "power3" });
          const onMove = (e: PointerEvent) => {
            mx((e.clientX / window.innerWidth - 0.5) * 24);
            my((e.clientY / window.innerHeight - 0.5) * 18);
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

      tl.fromTo(q("[data-grid]"), { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0)
        .fromTo(q("[data-hud]"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.9, stagger: 0.08 }, 0.3)

        /* strike -> flash -> logo */
        .fromTo(
          q("[data-bolt]"),
          { strokeDashoffset: boltLen },
          { strokeDashoffset: 0, duration: 0.45, ease: "power2.in" },
          0.25
        )
        .set(q("[data-flash]"), { opacity: 1, scale: 0.2 }, 0.7)
        .to(q("[data-flash]"), { scale: 2.6, opacity: 0, duration: 0.9, ease: "power2.out" }, 0.7)
        .to(q("[data-bolt]"), { opacity: 0, duration: 0.3 }, 0.75)
        .fromTo(q("[data-glow-wrap]"), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.7)
        .fromTo(
          q("[data-medal]"),
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.1, ease: "expo.out" },
          0.7
        )
        .fromTo(
          q("[data-ring-draw]"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" },
          0.85
        )
        .fromTo(q("[data-ring-fade]"), { opacity: 0 }, { opacity: 1, duration: 1.1, stagger: 0.15 }, 0.95)

        /* text */
        .fromTo(q("[data-dept]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 1.2)
        .fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, 1.25)
        .fromTo(q("[data-presents]"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 }, 1.4)
        .fromTo(
          q("[data-char]"),
          { yPercent: 115 },
          { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 },
          1.55
        )
        .fromTo(
          q("[data-sheen]"),
          { xPercent: -130 },
          { xPercent: 260, duration: 1.2, ease: "power2.inOut" },
          2.25
        )
        .fromTo(
          q("[data-fade]"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.14 },
          2.3
        )
        .fromTo(
          q("[data-cta]"),
          { opacity: 0, y: 20, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7 },
          2.7
        )

        /* the progress bar doubles as the auto-continue timer */
        .fromTo(
          q("[data-progress]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 3.4, ease: "none", onComplete: dismiss },
          2.8
        );
    }, root);

    return () => {
      removePointer();
      exitRef.current?.kill();
      ctx.revert();
    };
  }, [dismiss]);

  /* ---------- ember canvas ---------- */
  useEffect(() => {
    if (gone) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();

    type Ember = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      age: number;
      life: number;
      hue: number;
    };
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

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = w < 768 ? 26 : 54;
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
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
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
      onClick={dismiss}
      role="dialog"
      aria-label="TERA 2K26 introduction"
      className="fixed inset-0 z-[9999] cursor-pointer select-none overflow-hidden bg-[#050507] text-white"
    >
      {/* ---------- background layers ---------- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 38%, rgba(255,60,40,0.16), transparent 70%), radial-gradient(55% 40% at 50% 100%, rgba(255,184,0,0.10), transparent 70%)",
        }}
      />
      <div
        data-grid
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(70% 55% at 50% 38%, #000 25%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(70% 55% at 50% 38%, #000 25%, transparent 100%)",
        }}
      />
      <div
        data-scan
        className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-red-500/60 to-transparent"
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 45%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      {/* ---------- HUD corner brackets ---------- */}
      <span data-hud className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l border-t border-white/30" style={{ marginTop: "env(safe-area-inset-top)" }} />
      <span data-hud className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r border-t border-white/30" style={{ marginTop: "env(safe-area-inset-top)" }} />
      <span data-hud className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 border-b border-l border-white/30" style={{ marginBottom: "env(safe-area-inset-bottom)" }} />
      <span data-hud className="pointer-events-none absolute bottom-4 right-4 h-5 w-5 border-b border-r border-white/30" style={{ marginBottom: "env(safe-area-inset-bottom)" }} />

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
            <div className="relative aspect-square w-[min(54vw,34dvh,300px)]">
              {/* glow */}
              <div
                data-glow-wrap
                className="pointer-events-none absolute -inset-[38%]"
              >
                <div
                  data-glow
                  className="h-full w-full rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,60,40,0.38) 0%, rgba(255,150,30,0.14) 40%, transparent 68%)",
                  }}
                />
              </div>

              {/* lightning bolt: ends at the centre of the logo */}
              <svg
                className="pointer-events-none absolute bottom-1/2 left-1/2 -translate-x-1/2"
                width="60"
                height="600"
                viewBox="0 0 60 600"
                fill="none"
                style={{ filter: "drop-shadow(0 0 8px rgba(255,90,40,0.95))" }}
              >
                <path
                  data-bolt
                  d="M30 0 L25 110 L37 170 L23 260 L35 330 L24 420 L33 480 L28 540 L30 600"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </svg>

              {/* rings */}
              <svg
                data-spin-a
                className="pointer-events-none absolute -inset-[12%] h-[124%] w-[124%]"
                viewBox="0 0 100 100"
                fill="none"
              >
                <defs>
                  <linearGradient id="tera-ring-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ff2d2d" />
                    <stop offset="0.55" stopColor="#ff7a1a" />
                    <stop offset="1" stopColor="#ffc233" />
                  </linearGradient>
                </defs>
                <circle
                  data-ring-draw
                  cx="50"
                  cy="50"
                  r="49.3"
                  pathLength={1}
                  strokeDasharray="1"
                  stroke="url(#tera-ring-grad)"
                  strokeWidth="0.35"
                  strokeLinecap="round"
                />
                <circle
                  data-ring-fade
                  cx="50"
                  cy="50"
                  r="47.3"
                  pathLength={1}
                  strokeDasharray="0.003 0.01215"
                  stroke="#ffffff"
                  strokeOpacity="0.45"
                  strokeWidth="0.9"
                />
                <circle data-ring-fade cx="50" cy="0.7" r="1.1" fill="#ffd166" />
              </svg>
              <svg
                data-spin-b
                className="pointer-events-none absolute -inset-[12%] h-[124%] w-[124%]"
                viewBox="0 0 100 100"
                fill="none"
              >
                <circle
                  data-ring-fade
                  cx="50"
                  cy="50"
                  r="45.3"
                  pathLength={1}
                  strokeDasharray="0.19 0.06"
                  stroke="url(#tera-ring-grad)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>

              {/* medallion */}
              <div
                data-medal
                className="relative z-10 h-full w-full overflow-hidden rounded-full bg-white will-change-transform"
                style={{
                  boxShadow:
                    "0 0 0 2px rgba(255,255,255,0.12), 0 0 60px rgba(255,50,40,0.45), 0 20px 60px rgba(0,0,0,0.6)",
                }}
              >
                <img
                  src={logo}
                  alt="TERA Ignite 2K26 2.0 logo"
                  draggable={false}
                  decoding="async"
                  className="h-full w-full scale-[1.14] object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    boxShadow: "inset 0 0 28px rgba(0,0,0,0.14)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.35), transparent 45%)",
                  }}
                />
              </div>

              {/* ignition flash */}
              <div
                data-flash
                className="pointer-events-none absolute -inset-[10%] z-20 rounded-full opacity-0 mix-blend-screen"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,90,40,0.5) 35%, transparent 70%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* department */}
        <div data-dept className="flex items-center gap-3">
          <span data-rule className="h-px w-8 origin-right bg-gradient-to-l from-red-500/80 to-transparent md:w-14" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.38em] text-white/70 md:text-xs">
            Department of EEE
          </span>
          <span data-rule className="h-px w-8 origin-left bg-gradient-to-r from-red-500/80 to-transparent md:w-14" />
        </div>

        <p
          data-presents
          className="mt-3 text-[10px] uppercase tracking-[0.5em] text-amber-300/80"
        >
          Presents
        </p>

        {/* title */}
        <h1
          className="relative mt-3 overflow-hidden font-display text-[clamp(2.6rem,14vw,7rem)] font-black leading-[1.05] tracking-tight"
          style={{ filter: "drop-shadow(0 0 22px rgba(255,80,40,0.35))" }}
        >
          <span className="sr-only">
            {TITLE} {ACCENT}
          </span>
          <Word
            text={TITLE}
            className="bg-gradient-to-b from-white via-amber-100 to-amber-300 bg-clip-text text-transparent"
          />
          <span className="inline-block w-[0.25em]" aria-hidden="true" />
          <Word
            text={ACCENT}
            className="bg-gradient-to-b from-red-400 via-red-500 to-orange-500 bg-clip-text italic text-transparent"
          />
          <span
            data-sheen
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent mix-blend-overlay"
          />
        </h1>

        <p data-fade className="mt-4 max-w-sm text-sm leading-relaxed text-white/80 md:max-w-xl md:text-base">
          Madanapalle Institute of Technology &amp; Science
          <br />
          <span className="text-white/55">(Deemed to be University)</span>
        </p>

        <p
          data-fade
          className="mt-3 hidden max-w-md text-xs leading-relaxed text-white/50 md:max-w-xl md:text-sm [@media(min-height:700px)]:block"
        >
          A National Level One-Day Symposium celebrating electrical engineering,
          innovation, and the future of technology
        </p>

        {/* CTA + progress */}
        <div data-cta className="mt-7 flex flex-col items-center gap-4">
          <button
            type="button"
            className="group relative inline-flex min-h-[48px] items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-white/[0.06] px-7 py-3 text-xs font-bold uppercase tracking-[0.26em] text-white transition-colors hover:border-white/30"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-orange-500/25 to-amber-400/30" />
            <span className="relative">Enter the Experience</span>
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
            <div
              data-progress
              className="h-full w-full origin-left bg-gradient-to-r from-red-500 to-amber-400"
            />
          </div>

          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
            Tap anywhere to skip
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntroSplash;