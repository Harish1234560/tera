import { motion } from "framer-motion";

const PageTransitionLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-6 w-full max-w-2xl px-6">
      <div className="flex justify-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-transparent border-t-primary border-r-primary/30"
        />
      </div>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          className="h-4 rounded-lg bg-muted"
          style={{ width: `${80 - i * 15}%` }}
        />
      ))}
    </div>
  </div>
);

export default PageTransitionLoader;
