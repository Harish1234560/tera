import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Coffee,
  Cpu,
  Flag,
  MapPin,
  Presentation,
  Puzzle,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Kind = "general" | "ceremony" | "tech" | "break";

interface ScheduleItem {
  time: string; // "10:00 AM"
  event: string;
  venue: string;
  kind: Kind;
  icon: LucideIcon;
  isCompetition?: boolean;
}

interface Day {
  label: string;
  short: string;
  date: string;
  items: ScheduleItem[];
}

/* PLACEHOLDER TIMES: replace with your real timetable */
const days: Day[] = [
  {
    label: "Day 1",
    short: "Nov 11",
    date: "November 11, 2026",
    items: [
      { time: "9:00 AM", event: "Registration & Check-in", venue: "Main Entrance", kind: "general", icon: Flag },
      { time: "9:30 AM", event: "Inaugural Ceremony", venue: "Auditorium", kind: "ceremony", icon: Sparkles },
      { time: "10:00 AM", event: "SIMUVERSE", venue: "To be updated", kind: "tech", icon: Cpu, isCompetition: true },
      { time: "11:00 AM", event: "Project Expo", venue: "To be updated", kind: "tech", icon: Presentation, isCompetition: true },
      { time: "1:00 PM", event: "Lunch Break & Networking", venue: "Cafeteria", kind: "break", icon: Coffee },
      { time: "2:00 PM", event: "Technical Quiz", venue: "To be updated", kind: "tech", icon: Zap, isCompetition: true },
    ],
  },
  {
    label: "Day 2",
    short: "Nov 12",
    date: "November 12, 2026",
    items: [
      { time: "10:30 AM", event: "Electro Escape Room", venue: "To be updated", kind: "tech", icon: Puzzle, isCompetition: true },
      { time: "1:00 PM", event: "Lunch Break & Networking", venue: "Cafeteria", kind: "break", icon: Coffee },
      { time: "2:00 PM", event: "Paper Presentation", venue: "To be updated", kind: "tech", icon: BookOpen, isCompetition: true },
      { time: "4:00 PM", event: "Awards & Valedictory", venue: "Auditorium", kind: "ceremony", icon: Trophy },
      { time: "4:45 PM", event: "Closing & Farewell", venue: "Auditorium", kind: "general", icon: Flag },
    ],
  },
];

const kindMeta: Record<
  Kind,
  { label: string; badge: string; dot: string; iconWrap: string }
> = {
  general: {
    label: "General",
    badge: "border-white/15 bg-white/5 text-white/60",
    dot: "bg-white/60",
    iconWrap: "bg-white/10 text-white/70",
  },
  ceremony: {
    label: "Ceremony",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
    iconWrap: "bg-amber-400/15 text-amber-300",
  },
  tech: {
    label: "Technical",
    badge: "border-red-400/30 bg-red-400/10 text-red-300",
    dot: "bg-red-400",
    iconWrap: "bg-red-400/15 text-red-300",
  },
  break: {
    label: "Break",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
    iconWrap: "bg-emerald-400/15 text-emerald-300",
  },
};

const TimelineRow = ({
  item,
  index,
  reduced,
}: {
  item: ScheduleItem;
  index: number;
  reduced: boolean;
}) => {
  const meta = kindMeta[item.kind];
  const Icon = item.icon;
  const [clock, ampm] = item.time.split(" ");

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index, 3) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-stretch pb-4 last:pb-0 md:pb-5"
    >
      {/* time */}
      <div className="w-14 shrink-0 pt-4 text-right md:w-24">
        <p className="font-display text-sm font-bold leading-none text-foreground md:text-lg">
          {clock}
        </p>
        <p className="mt-1 font-body text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">
          {ampm}
        </p>
      </div>

      {/* rail dot */}
      <div className="relative flex w-8 shrink-0 justify-center md:w-8">
        <motion.span
          initial={reduced ? false : { scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
          className={`relative z-10 mt-[18px] h-3.5 w-3.5 rounded-full ring-4 ring-background ${meta.dot}`}
        />
      </div>

      {/* card */}
      <div className="group relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-black/30 p-4 transition-colors duration-300 hover:border-primary/40 md:p-5">
        <Icon className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-white opacity-[0.05] transition-opacity group-hover:opacity-[0.1]" />

        <div className="relative flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconWrap}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span
              className={`inline-block rounded-full border px-2 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] ${meta.badge}`}
            >
              {meta.label}
            </span>
            <h4 className="mt-1.5 font-display text-base font-bold leading-snug text-foreground md:text-lg">
              {item.event}
            </h4>
            <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {item.venue}
            </p>
          </div>
        </div>

        {item.isCompetition && (
          <Link
            to="/events"
            className="relative mt-3 inline-flex min-h-[40px] items-center gap-1 font-body text-xs font-bold text-primary"
          >
            Details &amp; Register
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </motion.div>
  );
};

const ScheduleSection = () => {
  const [dayIndex, setDayIndex] = useState(0);
  const reduced = useReducedMotion() ?? false;
  const listRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 65%", "end 55%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });

  const day = days[dayIndex];

  return (
    <section id="schedule" className="relative py-24 md:py-32 cosmic-bg">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* header */}
        <div className="mb-8 text-center">
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-secondary">
            Timeline
          </p>
          <h2 className="mb-3 font-display text-3xl font-bold text-gradient-gold md:text-5xl">
            Event Schedule
          </h2>
          <p className="mx-auto max-w-md font-body text-muted-foreground">
            Two days of competitions. Timings may be updated, so check back before the event.
          </p>
        </div>

        {/* day switcher */}
        <div className="mx-auto mb-8 grid max-w-sm grid-cols-2 gap-1 rounded-full border border-white/10 bg-black/30 p-1">
          {days.map((d, i) => {
            const active = i === dayIndex;
            return (
              <button
                key={d.label}
                onClick={() => setDayIndex(i)}
                aria-pressed={active}
                className="relative min-h-[48px] rounded-full px-4 font-body text-sm font-bold transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="day-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-[0_8px_24px_-8px_rgba(251,191,36,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative ${active ? "text-black" : "text-muted-foreground"}`}>
                  {d.label}
                  <span className={`ml-1.5 text-[11px] font-semibold ${active ? "text-black/60" : "text-muted-foreground/60"}`}>
                    {d.short}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* legend */}
        <div className="mb-8 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {(Object.keys(kindMeta) as Kind[]).map((k) => (
            <div key={k} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${kindMeta[k].dot}`} />
              <span className="font-body text-xs text-muted-foreground">
                {kindMeta[k].label}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={day.label}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <p className="mb-6 text-center font-display text-lg font-bold text-foreground md:text-xl">
              {day.date}
            </p>

            <div ref={listRef} className="relative">
              {/* rail: dot column center = time col + 1rem */}
              <div className="pointer-events-none absolute bottom-3 left-[4.5rem] top-3 w-px -translate-x-1/2 bg-white/10 md:left-[7rem]" />
              <motion.div
                style={{ scaleY: fill }}
                className="pointer-events-none absolute bottom-3 left-[4.5rem] top-3 w-[2px] origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-red-500 via-orange-400 to-amber-300 md:left-[7rem]"
              />

              {day.items.map((item, i) => (
                <TimelineRow
                  key={`${day.label}-${item.event}-${item.time}`}
                  item={item}
                  index={i}
                  reduced={reduced}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ScheduleSection;