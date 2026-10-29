import { Suspense, lazy, useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "./sections/Navbar";
import Footer from "./sections/Footer";
import SmoothScroll, { getLenis } from "./SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

/* three.js stays out of the main bundle */
const Scene3D = lazy(() => import("./3d/Scene3D"));

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

/* mount the 3D scene only when the browser is idle, and not on weak devices */
const useDeferredScene = (enabled: boolean) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const nav = navigator as any;
    if (nav.connection?.saveData) return;
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return;

    const start = () => setReady(true);
    const w = window as any;
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 1500 });
      return () => w.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 800);
    return () => window.clearTimeout(id);
  }, [enabled]);

  return enabled && ready;
};

interface Props {
  children: ReactNode;
  /** Set false on pages that already cover the screen (e.g. Home with the hero video). */
  showScene?: boolean;
}

const PageLayout = ({ children, showScene = true }: Props) => {
  const { pathname, hash } = useLocation();
  const reduced = useReducedMotion();
  const scene = useDeferredScene(showScene);

  /* start every route at the top (unless the URL has a #hash) */
  useLayoutEffect(() => {
    if (hash) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="relative min-h-[100svh] overflow-x-hidden bg-background">
      <SmoothScroll />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-black"
      >
        Skip to content
      </a>

      {/* route-change sweep */}
      {!reduced && (
        <motion.div
          key={pathname}
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-red-500 via-orange-400 to-amber-300"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: [1, 1, 0] }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      )}

      {scene && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.6 }}
          >
            <Suspense fallback={null}>
              <Scene3D />
            </Suspense>
          </motion.div>
          <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />
        </>
      )}

      <div className="relative z-10">
        <Navbar />
        <motion.main
          id="main"
          tabIndex={-1}
          variants={pageVariants}
          initial={reduced ? false : "initial"}
          animate="animate"
          exit="exit"
          onAnimationComplete={() => ScrollTrigger.refresh()}
          className="outline-none"
        >
          {children}
        </motion.main>
        <Footer />
      </div>
    </div>
  );
};

export default PageLayout;