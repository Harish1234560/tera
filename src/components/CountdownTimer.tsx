import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* Change this to your real start time */
const TARGET = new Date("2026-11-11T09:00:00+05:30").getTime();

interface Props {
  target?: Date | string | number;
}

const calc = (target: number) => {
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: diff === 0,
  };
};

const pad = (n: number) => String(n).padStart(2, "0");

const Digits = ({ value }: { value: string }) => (
  <span className="relative block h-[1.15em] overflow-hidden leading-[1.15]">
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="block text-center"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </span>
);

const CountdownTimer = ({ target }: Props) => {
  const t = target ? new Date(target).getTime() : TARGET;
  const [time, setTime] = useState(() => calc(t));

  useEffect(() => {
    setTime(calc(t));
    const id = setInterval(() => setTime(calc(t)), 1000);
    return () => clearInterval(id);
  }, [t]);

  if (time.done) {
    return (
      <div className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-red-400/40 bg-red-500/10 px-6 py-3 font-body text-sm font-bold uppercase tracking-[0.2em] text-red-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(255,60,40,0.9)]" />
        The event is live
      </div>
    );
  }

  const units = [
    { label: "Days", value: pad(time.days), accent: false },
    { label: "Hours", value: pad(time.hours), accent: false },
    { label: "Minutes", value: pad(time.minutes), accent: false },
    { label: "Seconds", value: pad(time.seconds), accent: true },
  ];

  return (
    <div className="mx-auto w-full max-w-[22rem] sm:max-w-md">
      <p className="mb-3 flex items-center justify-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-white/55">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        Event starts in
      </p>

      <div
        className="grid grid-cols-4 gap-2 sm:gap-3"
        role="timer"
        aria-live="off"
        aria-label={`${time.days} days ${time.hours} hours ${time.minutes} minutes ${time.seconds} seconds remaining`}
      >
        {units.map((u) => (
          <div
            key={u.label}
            className="relative min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.12] to-black/50 px-1 pb-2.5 pt-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:pb-3 sm:pt-4"
          >
            <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
            <div
              className={`font-display text-[clamp(1.6rem,8.5vw,2.6rem)] font-bold tabular-nums ${
                u.accent ? "text-red-400" : "text-white"
              }`}
            >
              <Digits value={u.value} />
            </div>
            <span className="mt-1 block font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:text-[10px] sm:tracking-[0.2em]">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;