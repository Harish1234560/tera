import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock,
  Cpu,
  MapPin,
  Presentation,
  Puzzle,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getLenis } from "@/components/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

/** Used by every event that has no formUrl of its own. Replace this later. */
const DEFAULT_FORM_URL = "https://forms.gle/REPLACE_ME";

type Mode = "solo" | "team" | "both";

interface EventItem {
  id: string;
  title: string;
  icon: LucideIcon;
  mode: Mode;
  teamSize?: string;
  description: string;
  date: string;
  venue: string;
  time: string;
  internalFee: number;
  externalFee: number;
  rules: string[];
  formUrl?: string; // optional per-event Google Form link
}

const events: EventItem[] = [
  {
    id: "simuverse",
    title: "SIMUVERSE",
    icon: Cpu,
    mode: "team",
    teamSize: "2-4 MEMBERS",
    description:
      "Design, simulate and demonstrate circuits and systems using industry-grade simulation tools.",
    date: "November 11, 2026",
    venue: "To be updated",
    time: "10:00 AM",
    internalFee: 49,
    externalFee: 59,
    rules: [
      "Teams of 2 to 4 members.",
      "Participants must bring their own laptops.",
      "Problem statement is revealed at the start of the event.",
      "Judges' decision is final.",
    ],
  },
  {
    id: "project-expo",
    title: "Project Expo",
    icon: Presentation,
    mode: "both",
    teamSize: "1-4 MEMBERS",
    description:
      "Showcase your working prototype or project to a panel of judges and win recognition.",
    date: "November 11, 2026",
    venue: "To be updated",
    time: "11:00 AM",
    internalFee: 99,
    externalFee: 149,
    rules: [
      "Working model or prototype is mandatory.",
      "Maximum 4 members per project.",
      "Each team gets 7 minutes to present, followed by Q&A.",
      "Plagiarised projects will be disqualified.",
    ],
  },
  {
    id: "ppt",
    title: "Paper Presentation",
    icon: BookOpen,
    mode: "both",
    teamSize: "1-2 MEMBERS",
    description:
      "Present your innovative ideas and research on emerging technologies through an engaging paper presentation.",
    date: "November 12, 2026",
    venue: "To be updated",
    time: "2:00 PM",
    internalFee: 49,
    externalFee: 59,
    rules: [
      "Abstract and slides must follow the given template.",
      "Presentation time is 8 minutes plus 2 minutes of Q&A.",
      "Original work only.",
      "Maximum 2 members per team.",
    ],
  },
  {
    id: "escape-room",
    title: "Electro Escape Room",
    icon: Puzzle,
    mode: "team",
    teamSize: "3-4 MEMBERS",
    description:
      "Crack electronics puzzles, decode clues and escape before the clock runs out.",
    date: "November 12, 2026",
    venue: "To be updated",
    time: "10:30 AM",
    internalFee: 59,
    externalFee: 79,
    rules: [
      "Teams of 3 to 4 members.",
      "No mobile phones during the event.",
      "The fastest team to clear all rooms wins.",
      "Damaging equipment leads to disqualification.",
    ],
  },
  {
    id: "tech-quiz",
    title: "Technical Quiz",
    icon: Zap,
    mode: "solo",
    description:
      "Take the quiz, get your team, stand out to win. Test your core technical knowledge.",
    date: "November 11, 2026",
    venue: "To be updated",
    time: "2:00 PM",
    internalFee: 49,
    externalFee: 59,
    rules: [
      "Round 1 is an individual written quiz.",
      "Top scorers qualify for the final round.",
      "No electronic devices allowed.",
      "Judges' decision is final.",
    ],
  },
];

const modeMeta: Record<Mode, { label: string; icon: LucideIcon; cls: string }> = {
  solo: {
    label: "SOLO ONLY",
    icon: User,
    cls: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },
  team: {
    label: "TEAM ONLY",
    icon: Users,
    cls: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  },
  both: {
    label: "SOLO OR TEAM",
    icon: Users,
    cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
};

const ModeBadge = ({ mode }: { mode: Mode }) => {
  const { label, icon: Icon, cls } = modeMeta[mode];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-body text-[10px] font-bold tracking-[0.12em] ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const InfoRow = ({ icon: Icon, text }: { icon: LucideIcon; text: string }) => (
  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
    <Icon className="h-4 w-4 shrink-0 text-muted-foreground/80" />
    <span className="font-body">{text}</span>
  </div>
);

const FeeRow = ({
  label,
  amount,
  color,
}: {
  label: string;
  amount: number;
  color: string;
}) => (
  <div className="flex items-center gap-3">
    <span className={`h-4 w-[3px] rounded-full ${color}`} />
    <span className="w-16 font-body text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
      {label}
    </span>
    <span className="font-body text-sm font-bold text-foreground">
      ₹{amount} per person
    </span>
  </div>
);

const RegisterButton = ({
  url,
  className = "",
}: {
  url?: string;
  className?: string;
}) => (
  <a
    href={url || DEFAULT_FORM_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3 font-body text-sm font-bold text-black shadow-[0_8px_24px_-8px_rgba(251,191,36,0.55)] transition-[background-color,box-shadow] duration-200 hover:bg-amber-50 hover:shadow-[0_12px_30px_-6px_rgba(251,191,36,0.7)] active:scale-[0.97] ${className}`}
  >
    Register
    <ArrowUpRight className="h-4 w-4" />
  </a>
);

const EventModal = ({
  event,
  onClose,
}: {
  event: EventItem;
  onClose: () => void;
}) => {
  const Icon = event.icon;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    getLenis()?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      getLenis()?.start();
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${event.title} details`}
        data-lenis-prevent
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-[#0b0b0d] p-6 shadow-2xl sm:rounded-3xl sm:p-7"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="h-7 w-7" />
        </div>

        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Technical
        </span>
        <h3 className="mb-3 mt-1 font-display text-2xl font-bold text-foreground">
          {event.title}
        </h3>
        <ModeBadge mode={event.mode} />

        <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>

        <div className="my-5 space-y-2.5 border-t border-white/10 pt-5">
          <InfoRow icon={CalendarDays} text={event.date} />
          <InfoRow icon={MapPin} text={event.venue} />
          <InfoRow icon={Clock} text={event.time} />
          {event.teamSize && <InfoRow icon={Users} text={event.teamSize} />}
        </div>

        <div className="space-y-2.5 border-t border-white/10 pt-5">
          <FeeRow label="Internal" amount={event.internalFee} color="bg-amber-400" />
          <FeeRow label="External" amount={event.externalFee} color="bg-emerald-400" />
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <h4 className="mb-3 font-body text-xs font-bold uppercase tracking-[0.18em] text-foreground">
            Rules
          </h4>
          <ul className="space-y-2">
            {event.rules.map((rule) => (
              <li
                key={rule}
                className="flex gap-2.5 font-body text-sm text-muted-foreground"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <RegisterButton url={event.formUrl} className="mt-7 w-full" />
      </motion.div>
    </motion.div>
  );
};

const EventsSection = ({ solidCards = false }: { solidCards?: boolean }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<EventItem | null>(null);

  // Warn in production if any event still uses the placeholder link.
  useEffect(() => {
    if (
      import.meta.env.PROD &&
      DEFAULT_FORM_URL.includes("REPLACE_ME") &&
      events.some((e) => !e.formUrl)
    ) {
      console.warn(
        "[EventsSection] DEFAULT_FORM_URL is still the placeholder. Replace it before launch."
      );
    }
  }, []);

  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isMobile: "(max-width: 767px)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { isMobile, reduce } = ctx.conditions as {
          isMobile: boolean;
          reduce: boolean;
        };
        if (reduce) return; // content stays visible, no animation

        /* ---------- header ---------- */
        const head = root.querySelector<HTMLElement>("[data-head]");
        if (head) {
          gsap.from(head.children, {
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: head, start: "top 88%", once: true },
          });
        }

        const line = root.querySelector<HTMLElement>("[data-line]");
        if (line && head) {
          gsap.fromTo(
            line,
            { scaleX: 0, opacity: 0.4 },
            {
              scaleX: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: head,
                start: "top 90%",
                end: "bottom 45%",
                scrub: true,
              },
            }
          );
        }

        /* ---------- cards ---------- */
        const cards = Array.from(
          root.querySelectorAll<HTMLElement>("[data-card]")
        );
        const cols = isMobile ? 1 : window.innerWidth >= 1280 ? 3 : 2;

        cards.forEach((card, i) => {
          const parts = card.querySelectorAll("[data-part]");
          const watermark = card.querySelector("[data-watermark]");

          // entrance
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: isMobile ? "top 90%" : "top 86%",
              once: true,
            },
            delay: isMobile ? 0 : (i % cols) * 0.1,
          });

          tl.from(card, {
            opacity: 0,
            y: isMobile ? 80 : 60,
            scale: isMobile ? 0.93 : 0.96,
            duration: 0.9,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }).from(
            parts,
            {
              opacity: 0,
              y: 22,
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.07,
              clearProps: "transform,opacity",
            },
            "-=0.6"
          );

          // scrubbed parallax on the big watermark icon
          if (watermark) {
            gsap.fromTo(
              watermark,
              { yPercent: -22, rotate: -10 },
              {
                yPercent: 22,
                rotate: 10,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            );
          }

          // mobile: highlight the card that sits in the middle of the screen
          if (isMobile) {
            ScrollTrigger.create({
              trigger: card,
              start: "top 62%",
              end: "bottom 38%",
              onToggle: (self) => {
                card.dataset.active = self.isActive ? "true" : "false";
              },
            });
          }
        });
      },
      root
    );

    // fonts change layout height, so recalc trigger positions once they load
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="events"
      className="relative py-24 md:py-32 cosmic-bg"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div data-head className="mb-6 text-center">
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-secondary">
            Event Lineup
          </p>
          <h2 className="mb-3 font-display text-2xl font-bold text-gradient-gold md:text-4xl">
            Events &amp; Competitions
          </h2>
          <p className="mx-auto max-w-xl font-body text-muted-foreground">
            Compete in exciting challenges at TERA 2K26.
          </p>
        </div>

        <div
          data-line
          className="mx-auto mb-12 h-px w-40 origin-center bg-gradient-to-r from-transparent via-primary to-transparent md:w-64"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <div
                key={event.id}
                data-card
                data-active="false"
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 ${
                  solidCards ? "bg-card" : "bg-gradient-to-b from-white/[0.05] to-black/40 md:backdrop-blur-md"
                } p-6 transition-[border-color,box-shadow] duration-500 will-change-transform hover:border-primary/40 hover:shadow-2xl data-[active=true]:border-primary/50 data-[active=true]:shadow-[0_0_40px_-12px_rgba(251,191,36,0.45)] md:data-[active=true]:border-white/10 md:data-[active=true]:shadow-none md:hover:border-primary/40`}
              >
                {/* soft glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl md:blur-3xl" />

                {/* big watermark icon (parallax target) */}
                <Icon
                  data-watermark
                  className="pointer-events-none absolute right-6 top-6 h-20 w-20 text-white opacity-[0.07] group-hover:opacity-[0.14]"
                />

                <div
                  data-part
                  className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20"
                >
                  <Icon className="h-7 w-7" />
                </div>

                <span
                  data-part
                  className="relative mb-1 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
                >
                  Technical
                </span>
                <h3
                  data-part
                  className="relative mb-3 font-display text-2xl font-bold text-foreground"
                >
                  {event.title}
                </h3>

                <div data-part className="relative mb-3">
                  <ModeBadge mode={event.mode} />
                </div>

                <p
                  data-part
                  className="relative mb-5 line-clamp-2 min-h-[2.5rem] font-body text-sm text-muted-foreground"
                >
                  {event.description}
                </p>

                <div
                  data-part
                  className="relative mt-auto space-y-2.5 border-t border-white/10 pt-5"
                >
                  <InfoRow icon={CalendarDays} text={event.date} />
                  <InfoRow icon={MapPin} text={event.venue} />
                  <InfoRow icon={Clock} text={event.time} />

                  <div className="space-y-2 pt-2">
                    <FeeRow label="Internal" amount={event.internalFee} color="bg-amber-400" />
                    <FeeRow label="External" amount={event.externalFee} color="bg-emerald-400" />
                  </div>

                  <div className="h-5 pt-1">
                    {event.teamSize && (
                      <div className="flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                        <Users className="h-3.5 w-3.5" />
                        {event.teamSize}
                      </div>
                    )}
                  </div>
                </div>

                <div data-part className="relative mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelected(event)}
                    className="min-h-[48px] rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-body text-sm font-bold text-foreground transition-[background-color,border-color] duration-200 hover:border-white/30 hover:bg-white/10 active:scale-[0.97]"
                  >
                    Details
                  </button>
                  <RegisterButton url={event.formUrl} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <EventModal event={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default EventsSection;