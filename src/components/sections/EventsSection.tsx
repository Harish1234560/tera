import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, CalendarDays, Cpu, Presentation, Puzzle, Zap } from "lucide-react";

const events = [
  { title: "SIMUVERSE", icon: Cpu },
  { title: "Project Expo", icon: Presentation },
  { title: "PPT", icon: BookOpen },
  { title: "Electro Escape Room", icon: Puzzle },
  { title: "Technical Quiz", icon: Zap },
];

const EventsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="events" className="relative py-24 md:py-32 cosmic-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-3">
            Event Lineup
          </p>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-gradient-gold mb-3">
            Events &amp; Competitions
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            Compete in exciting challenges at TERA 2K26.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map(({ title, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="card-cosmic group relative flex min-h-[270px] flex-col overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1"
            >
              <Icon className="absolute right-7 top-7 h-20 w-20 text-primary opacity-[0.08] transition-opacity group-hover:opacity-[0.15]" />

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>

              <span className="mb-2 font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Technical
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">
                {title}
              </h3>

              <div className="mt-auto border-t border-border/70 pt-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>November 11–12, 2026</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
