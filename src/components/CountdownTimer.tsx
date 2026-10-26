import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TARGET_DATE = new Date(2026, 10, 11, 8, 30, 0);

function getTimeLeft() {
  const diff = TARGET_DATE.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const FlipNumber = ({
  value,
  flipKey,
}: {
  value: number;
  flipKey: string | number;
}) => {
  return (
    <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-xl bg-card border border-border flex items-center justify-center shadow-md overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={flipKey}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-4xl font-bold text-amber-400"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

const CountdownTimer = () => {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const blocks = [
    { label: "DAYS", value: time.days },
    { label: "HOURS", value: time.hours },
    { label: "MINUTES", value: time.minutes },
    { label: "SECONDS", value: time.seconds, flip: true },
  ];

  return (
    <div className="flex gap-3 md:gap-6 justify-center items-center">
      {blocks.map((b, i) => (
        <div key={b.label} className="flex items-center gap-3 md:gap-6">
          <div className="flex flex-col items-center">
            <FlipNumber
              value={b.value}
              flipKey={b.flip ? b.value : b.label} 
              // 🔥 Only seconds re-animate
            />

            <span className="text-xs md:text-sm tracking-[0.3em] text-white mt-2 font-body uppercase font-semibold">
              {b.label}
            </span>
          </div>

          {i < blocks.length - 1 && (
            <span
              className="text-2xl md:text-4xl font-bold text-amber-300/60 -mt-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;