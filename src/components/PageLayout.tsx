import { motion } from "framer-motion";
import Navbar from "./sections/Navbar";
import Footer from "./sections/Footer";
import Scene3D from "./3d/Scene3D";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background relative overflow-x-hidden">
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Scene3D />
    </div>
    <div className="relative z-10">
      <Navbar />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  </div>
);

export default PageLayout;
