import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeProvider";
import { getLenis } from "@/components/SmoothScroll";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Schedule", href: "/schedule" },
  { label: "Gallery", href: "/gallery" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  /* scrolled state */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* lock scroll + Esc to close while the menu is open */
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    getLenis()?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const isActive = (href: string) => location.pathname === href;
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div
          className={`mx-auto flex items-center justify-between transition-[max-width,margin,padding,background-color,border-color,box-shadow,border-radius] duration-500 ${
            scrolled || mobileOpen
              ? "mt-2 max-w-6xl rounded-full border border-white/10 bg-background/70 px-3 py-2 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:mx-auto sm:px-4 max-md:mx-3"
              : "mt-0 max-w-7xl rounded-none border border-transparent bg-transparent px-4 py-3 sm:px-6"
          }`}
        >
          {/* logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="h-10 w-10 overflow-hidden rounded-full bg-white ring-2 ring-primary/40">
              <img
                src="/EEElogo.png"
                alt="TERA Ignite 2K26 2.0 logo"
                className="h-full w-full scale-[1.14] object-cover"
              />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-body text-xs font-bold tracking-[0.14em] text-foreground sm:text-sm">
                TERA IGNITE 2K26
              </span>
              <span className="hidden font-body text-[9px] tracking-[0.28em] text-primary sm:block">
                DEPARTMENT OF EEE
              </span>
            </span>
          </Link>

          {/* desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`relative rounded-full px-4 py-2 font-body text-sm tracking-wider transition-colors duration-300 ${
                    active
                      ? "font-semibold text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-primary/25 bg-primary/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            >
              <ThemeIcon className="h-4 w-4" />
            </button>
          </div>

          {/* mobile controls */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition active:scale-90 hover:text-foreground"
            >
              <ThemeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-foreground transition active:scale-90"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          {/* scroll progress */}
          <motion.div
            style={{ scaleX: progress }}
            className={`pointer-events-none absolute bottom-0 left-6 right-6 h-[2px] origin-left rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 transition-opacity duration-300 ${
              scrolled && !mobileOpen ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </motion.nav>

      {/* mobile full-screen menu (outside <nav> so fixed positioning stays reliable) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            data-lenis-prevent
            className="fixed inset-0 z-40 h-[100dvh] overflow-y-auto overscroll-contain bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 40% at 50% 0%, rgba(255,90,40,0.16), transparent 70%), radial-gradient(50% 35% at 50% 100%, rgba(255,184,0,0.10), transparent 70%)",
              }}
            />

            <div
              className="relative flex min-h-full flex-col px-6"
              style={{
                paddingTop: "calc(env(safe-area-inset-top) + 5.5rem)",
                paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)",
              }}
            >
              <nav className="flex flex-col">
                {navItems.map((item, i) => {
                  const active = isActive(item.href);
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.08 + i * 0.06,
                        duration: 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        to={item.href}
                        className="group flex min-h-[60px] items-center gap-4 border-b border-white/10 py-3 active:opacity-70"
                      >
                        <span
                          className={`font-body text-xs tabular-nums tracking-widest ${
                            active ? "text-primary" : "text-muted-foreground/60"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-display text-3xl font-bold ${
                            active ? "text-gradient-gold" : "text-foreground"
                          }`}
                        >
                          {item.label}
                        </span>
                        {active && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-auto pt-10"
              >
                <Link
                  to="/events"
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-body text-sm font-bold text-black shadow-[0_10px_30px_-10px_rgba(251,191,36,0.6)] transition active:scale-[0.97]"
                >
                  Explore Events &amp; Register
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <p className="mt-5 text-center font-body text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
                  Department of EEE · MITS
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;