import { motion, useReducedMotion } from "framer-motion";

const PageTransitionLoader = () => {
  const reduced = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-background"
    >
      <span className="sr-only">Loading</span>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 35% at 50% 45%, rgba(255,60,40,0.14), transparent 70%), radial-gradient(40% 30% at 50% 100%, rgba(255,184,0,0.08), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center px-6">
        <div className="relative h-24 w-24">
          {[0, 0.9].map((delay) => (
            <motion.span
              key={delay}
              aria-hidden
              className="absolute inset-0 rounded-full border border-red-400/50"
              animate={reduced ? undefined : { scale: [1, 1.9], opacity: [0.7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay }}
            />
          ))}

          <motion.span
            aria-hidden
            className="absolute -inset-[3px] rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #ff2d2d, #ffb400 25%, transparent 45%, transparent 55%, #ff7a1a 75%, #ff2d2d)",
            }}
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative z-10 h-full w-full overflow-hidden rounded-full bg-white shadow-[0_0_40px_rgba(255,50,40,0.4),0_14px_40px_rgba(0,0,0,0.5)]">
            <img
              src="/EEElogo.png"
              alt=""
              draggable={false}
              className="h-full w-full scale-[1.14] object-cover"
            />
          </div>
        </div>

        <p className="mt-7 font-body text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Igniting
        </p>

        <div className="mt-3 h-[2px] w-36 overflow-hidden rounded-full bg-foreground/10">
          <motion.div
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-red-500 to-amber-300"
            animate={reduced ? { x: "50%" } : { x: ["-100%", "200%"] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PageTransitionLoader;