import { motion } from "framer-motion";
import CountdownTimer from "../CountdownTimer";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-20 w-full">
        {/* Department badge */}
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, duration: 0.7 }}
  className="mb-6"
>
  <span className="inline-block whitespace-nowrap px-6 sm:px-7 py-2.5 sm:py-3 rounded-full border border-primary/40 text-primary font-body text-sm sm:text-base md:text-lg tracking-[0.18em] sm:tracking-[0.22em] uppercase">
    Department of EEE
  </span>
</motion.div>

        {/* TERA 2K26 Title */}
<div className="mb-4 overflow-hidden">
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.4, duration: 0.5 }}
    className="relative inline-block"
  >
    {/* Background Glow */}
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
      className="absolute inset-0 -inset-x-8 rounded-2xl bg-primary/5 blur-2xl origin-left"
    />

    <h1 className="relative">
      {/* TERA */}
      <span className="inline-block overflow-hidden">
        {"TERA".split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ y: 120, opacity: 0, rotateX: -90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{
              delay: 0.5 + i * 0.08,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block text-3xl sm:text-5xl md:text-7xl lg:text-[8rem] font-black tracking-tight text-foreground leading-none font-display"
          >
            {char}
          </motion.span>
        ))}
      </span>

      {" "}

      {/* 2K26 */}
      <span className="inline-block overflow-hidden">
        {"2K26".split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ y: 120, opacity: 0, rotateX: -90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{
              delay: 1.0 + i * 0.08,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block text-3xl sm:text-5xl md:text-7xl lg:text-[8rem] font-black tracking-tight text-gradient-gold leading-none italic font-display"
          >
            {char}
          </motion.span>
        ))}
      </span>
    </h1>

    {/* Animated Gradient Line */}
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
      className="h-1 mt-3 rounded-full origin-left"
      style={{
        background:
          "linear-gradient(90deg, hsl(var(--gold-bright)), hsl(var(--terracotta)), hsl(var(--gold)))",
      }}
    />
  </motion.div>
</div>

        {/* University name — prominent */}
       <motion.p
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.5, duration: 0.7 }}
  className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-foreground/90 mb-2 tracking-wide"
>
  Madanapalle Institute of Technology & Science ( Deemed to be University )
</motion.p>

<motion.p
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.5, duration: 0.7 }}
  className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-foreground/90 mb-2 tracking-wide"
>
  
</motion.p>

        <motion.p
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.8, duration: 0.7 }}
  className="font-body text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 px-2"
>
  A National Level One-Day Symposium celebrating electrical engineering, innovation, and the future of technology.
</motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.8 }}
          className="mb-8"
        >
          <CountdownTimer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 px-4 sm:px-0"
        >
          <Link to="/events" className="btn-cosmic text-sm py-3 px-6 text-center">Explore Events</Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.8 }}
        >
          
          
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
