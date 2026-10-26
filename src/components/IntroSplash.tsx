import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const IntroSplash = ({ onComplete }: { onComplete: () => void }) => {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onComplete, 600);
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(dismiss, 4000);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onClick={dismiss}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden cursor-pointer"
        >
          {/* 🔥 Animated Gradient Background */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(270deg, #0f172a, #111827, #1e293b, #0f172a)",
              backgroundSize: "400% 400%",
            }}
          />

          {/* ✨ Moving Tech Grid */}
          <motion.div
            animate={{ y: [0, -50] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,215,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.15) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* 🌟 Radial Gold Glow */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-[700px] h-[700px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,215,0,0.35), transparent 70%)",
            }}
          />

          {/* 🌌 Floating Particles */}
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              initial={{
                opacity: 0,
                y: Math.random() * 800,
                x: Math.random() * 1200,
              }}
              animate={{
                y: [null, -100],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}

          {/* 🔥 CONTENT */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6 text-white">

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-lg md:text-xl tracking-wide"
            >
              Department of EEE
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg md:text-xl tracking-wide"
            >
              Presents
            </motion.p>

            {/* ⭐ MAIN TITLE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <motion.h1
                animate={{
                  scale: [1, 1.05, 1],
                  textShadow: [
                    "0 0 15px rgba(255,215,0,0.4)",
                    "0 0 60px rgba(255,215,0,0.9)",
                    "0 0 15px rgba(255,215,0,0.4)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight"
              >
                <span>TERA </span>
                <span className="text-yellow-400 italic">2K26</span>
              </motion.h1>

              {/* Shimmer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-base md:text-xl max-w-xl"
            >
              Madanapalle Institute of Technology & Science
              <br />
              (Deemed to be University)
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-sm md:text-base max-w-xl"
            >
              A National Level One-Day Symposium celebrating electrical
              engineering, innovation, and the future of technology
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.5 }}
              className="text-xs tracking-widest uppercase mt-6"
            >
              Tap anywhere to continue
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroSplash;