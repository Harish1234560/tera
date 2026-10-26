import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, MapPin, Sparkles, Coffee, Mic, Trophy, Flag } from "lucide-react";

interface ScheduleItem {
  event: string;
  venue: string;
  type: "general" | "talk" | "tech" | "fun";
  icon: React.ElementType;
}

const schedule: ScheduleItem[] = [
  { event: "Registration & Check-in", venue: "Main Entrance", type: "general", icon: Flag },
  { event: "Inaugural Ceremony", venue: "Auditorium", type: "general", icon: Sparkles },
  { event: "Keynote: Future of Electrical Engineering", venue: "Auditorium", type: "talk", icon: Mic },
  { event: "AI Alchemy & Code Nexus Begin", venue: "Lab 301 & 201", type: "tech", icon: Sparkles },
  { event: "Data Quest Treasure Hunt", venue: "Campus Wide", type: "fun", icon: Sparkles },
  { event: "Meme Factory & Tech Talks", venue: "Seminar Hall", type: "fun", icon: Sparkles },
  { event: "Lunch Break & Networking", venue: "Cafeteria", type: "general", icon: Coffee },
  { event: "Data Forge & Viz Odyssey", venue: "Lab 302 & Seminar Hall", type: "tech", icon: Sparkles },
  { event: "Idea Spark Pitching", venue: "Seminar Hall", type: "fun", icon: Sparkles },
  { event: "Awards & Valedictory", venue: "Auditorium", type: "general", icon: Trophy },
  { event: "Closing & Farewell", venue: "Auditorium", type: "general", icon: Flag },
];

const firstDayCount = Math.ceil(schedule.length / 2);
const scheduleDays = [
  { date: "November 11, 2026", items: schedule.slice(0, firstDayCount) },
  { date: "November 12, 2026", items: schedule.slice(firstDayCount) },
];

const typeConfig: Record<string, { color: string; bg: string; border: string; label: string; dot: string }> = {
  general: { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-muted-foreground/20", label: "General", dot: "bg-muted-foreground" },
  talk: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "Keynote", dot: "bg-primary" },
  tech: { color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30", label: "Technical", dot: "bg-secondary" },
  fun: { color: "text-accent", bg: "bg-accent/10", border: "border-accent/30", label: "Non-Tech", dot: "bg-accent" },
};

const ScheduleSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="schedule" className="relative py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-3">Timeline</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold mb-4">Event Schedule</h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto mb-8">
            Two days of events, from 11:00 AM to 2:00 PM each day.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(typeConfig).map(([key, conf]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${conf.dot}`} />
                <span className="font-body text-xs text-muted-foreground">{conf.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {scheduleDays.map((day) => (
          <div key={day.date} className="mb-16 last:mb-0">
            <div className="mb-8 text-center">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-gradient-gold">
                {day.date}
              </h3>
              <p className="mt-2 flex items-center justify-center gap-2 font-body text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                11:00 AM – 2:00 PM
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-5 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5">
                <div className="w-full h-full bg-gradient-to-b from-primary/60 via-secondary/40 to-muted-foreground/20 rounded-full" />
              </div>

              {day.items.map((item, i) => (
                <TimelineCard key={item.event} item={item} index={i} isLeft={i % 2 === 0} />
              ))}

              <div className="absolute left-5 md:left-1/2 -translate-x-1/2 bottom-0 w-4 h-4 rounded-full bg-primary glow-gold" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const TimelineCard = ({ item, index, isLeft }: { item: ScheduleItem; index: number; isLeft: boolean }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const config = typeConfig[item.type];
  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 20 }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-start mb-6 md:mb-4 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      } pl-14 md:pl-0`}
    >
      {/* Timeline dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.06 + 0.2, type: "spring" }}
        className={`absolute left-[12px] md:left-1/2 md:-translate-x-1/2 w-6 h-6 rounded-full border-2 border-background z-10 top-3 flex items-center justify-center ${config.dot}`}
      >
        <div className="w-2 h-2 rounded-full bg-background" />
      </motion.div>

      {/* Card */}
      <div className={`md:w-[calc(50%-2rem)] ${isLeft ? "md:pr-4 md:text-right" : "md:pl-4"}`}>
        <div className={`rounded-xl p-4 border ${config.border} ${config.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}>
          <div className={`flex items-center gap-2 mb-2 ${isLeft ? "md:justify-end" : ""}`}>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-body font-medium ${config.bg} ${config.color} border ${config.border}`}>
              {config.label}
            </span>
          </div>
          <p className="font-display text-sm md:text-base font-semibold text-foreground mb-1">{item.event}</p>
          <div className={`flex items-center gap-1.5 ${isLeft ? "md:justify-end" : ""}`}>
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="font-body text-xs text-muted-foreground">{item.venue}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleSection;
