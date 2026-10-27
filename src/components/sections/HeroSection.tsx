import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import CountdownTimer from "../CountdownTimer";

gsap.registerPlugin(ScrollTrigger);

/* Put your photo here: public/images/hero-bg.jpg (16:9, under ~300 KB) */
const HERO_IMAGE = "/images/hero-bg.jpg";
/* Optional portrait crop for phones: public/images/hero-bg-mobile.jpg */
const HERO_IMAGE_MOBILE = "/images/hero-bg-mobile.jpg";
const HERO_VIDEO = "/videos/hero-bg.mp4";
const HERO_VIDEO_MOBILE = "/videos/hero-bg-mobile.mp4";

const CIRCUIT =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' fill='none' stroke='white' stroke-width='1' stroke-linecap='round'><path d='M0 60h70l20 20h60M60 0v40l20 20M240 150h-80l-20 20v70M120 240v-40l20-20h50l20-20h50'/><circle cx='70' cy='60' r='3'/><circle cx='150' cy='80' r='3'/><circle cx='160' cy='150' r='3'/><circle cx='190' cy='180' r='3'/></svg>\")";

const TERA = "TERA".split("");
const YEAR = "2K26".split("");

const charCls =
  "inline-block font-display text-[clamp(2.8rem,14vw,8rem)] font-black italic-none leading-[1.05] tracking-tight";

const HeroSection = () => {
  const rootRef = useRef<HTMLElement>(null);
  const [imgOk, setImgOk] = useState(true);
  const [mobileImgOk, setMobileImgOk] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setShowVideo(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* scroll parallax: background drifts, content fades as you leave */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to("[data-hero-bg]", {
        yPercent: 18,
        scale: 1.08,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-content]", {
        yPercent: -8,
        opacity: 0.1,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "70% top", scrub: true },
      });
    }, root);
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="home"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#050507] text-white"
    >
      {/* ---------- background stack ---------- */}
      <div data-hero-bg className="absolute inset-0 z-0 will-change-transform">
        {/* drawn layer: always works, matches the logo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 30%, rgba(255,60,40,0.30), transparent 70%), radial-gradient(60% 45% at 85% 90%, rgba(255,184,0,0.18), transparent 70%), radial-gradient(50% 40% at 10% 80%, rgba(255,60,40,0.14), transparent 70%)",
          }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: CIRCUIT, backgroundSize: "240px 240px" }}
          animate={{ backgroundPosition: ["0px 0px", "240px 240px"] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />

        {/* photo layer */}
        {imgOk && (
          <picture>
            {mobileImgOk && (
              <source media="(max-width: 767px)" srcSet={HERO_IMAGE_MOBILE} />
            )}
            <motion.img
              src={HERO_IMAGE}
              alt=""
              ref={(image) => image?.setAttribute("fetchpriority", "high")}
              onError={() => setImgOk(false)}
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 0.75, scale: 1 }}
              transition={{ duration: 2.4, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-cover"
              decoding="async"
            />
          </picture>
        )}

        {showVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={imgOk ? HERO_IMAGE : undefined}
            onLoadStart={() => setVideoReady(false)}
            onCanPlay={() => setVideoReady(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <source
              src={HERO_VIDEO_MOBILE}
              type="video/mp4"
              media="(max-width: 767px)"
            />
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
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

      {/* ---------- content ---------- */}
      <div
        data-hero-content
        className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 pt-28 text-center sm:px-6"
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

        {/* title */}
        <h1 className="mb-5" aria-label="TERA 2K26">
          <span className="relative inline-block" aria-hidden="true">
            <span className="absolute -inset-x-6 inset-y-2 rounded-full bg-red-500/10 blur-3xl" />
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
          className="mb-1 font-display text-base font-semibold tracking-wide text-white/90 sm:text-xl md:text-2xl"
        >
          Madanapalle Institute of Technology &amp; Science
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.7 }}
          className="mb-5 font-body text-xs uppercase tracking-[0.22em] text-white/55 sm:text-sm"
        >
          (Deemed to be University)
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.7 }}
          className="mx-auto mb-6 max-w-2xl px-2 font-body text-sm leading-relaxed text-white/75 sm:text-lg"
        >
          A National Level One-Day Symposium celebrating electrical engineering,
          innovation, and the future of technology.
        </motion.p>

        {/* date + place chips */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.75, duration: 0.7 }}
          className="mb-8 flex flex-wrap justify-center gap-2.5"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 font-body text-xs text-white/85 sm:text-sm">
            <CalendarDays className="h-4 w-4 text-primary" />
            November 11–12, 2026
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 font-body text-xs text-white/85 sm:text-sm">
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
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 0.8 }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 text-white/50"
        >
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;