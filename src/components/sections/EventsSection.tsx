import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
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
    cls: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  },
  team: {
    label: "TEAM ONLY",
    icon: Users,
    cls: "border-red-400/30 bg-red-400/10 text-red-300",
  },
  both: {
    label: "SOLO OR TEAM",
    icon: Users,
    cls: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  },
};

/* ---------- ticket notch: semicircle cut-outs on both edges ---------- */
/* distance from the card bottom to the dashed tear line */
const NOTCH_Y = 93;
const NOTCH_R = 9;
const notchMask = `radial-gradient(circle ${NOTCH_R}px at 0 calc(100% - ${NOTCH_Y}px), #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle ${NOTCH_R}px at 100% calc(100% - ${NOTCH_Y}px), #0000 98%, #000) right / 51% 100% no-repeat`;
const ticketMask: CSSProperties = { WebkitMask: notchMask, mask: notchMask };

const parseDay = (date: string) => {
  const m = date.match(/([A-Za-z]+)\s+(\d{1,2})/);
  return {
    month: m ? m[1].slice(0, 3).toUpperCase() : "",
    day: m ? m[2] : "",
  };
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

const DateBadge = ({ date }: { date: string }) => {
  const { month, day } = parseDay(date);
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center overflow-hidden rounded-2xl border border-white/15 bg-black/40 text-center">
      <span className="w-full bg-gradient-to-r from-red-600 to-orange-500 py-0.5 font-body text-[9px] font-bold tracking-[0.2em] text-white">
        {month}
      </span>
      <span className="flex flex-1 items-center font-display text-xl font-black leading-none text-foreground">
        {day}
      </span>
    </div>
  );
};

const InfoRow = ({ icon: Icon, text }: { icon: LucideIcon; text: string }) => (
  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
    <Icon className="h-4 w-4 shrink-0 text-amber-300/80" />
    <span className="font-body">{text}</span>
  </div>
);

const FeeTile = ({
  label,
  amount,
  tone,
}: {
  label: string;
  amount: number;
  tone: "amber" | "orange";
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 px-3.5 py-3">
    <span
      className={`absolute inset-y-3 left-0 w-[3px] rounded-r-full ${
        tone === "amber" ? "bg-amber-400" : "bg-orange-500"
      }`}
    />
    <p className="font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </p>
    <p className="mt-1 font-display text-xl font-bold leading-none text-foreground">
      ₹{amount}
      <span className="ml-1 font-body text-[10px] font-medium text-muted-foreground">
        / person
      </span>
    </p>
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
    className={`inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3 font-body text-sm font-bold text-black shadow-[0_8px_24px_-8px_rgba(255,120,40,0.65)] transition-[background-color,box-shadow] duration-200 hover:bg-amber-50 hover:shadow-[0_12px_30px_-6px_rgba(255,120,40,0.8)] active:scale-[0.97] ${className}`}
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
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-[#0b0b0d] px-6 pt-6 shadow-2xl sm:rounded-3xl sm:px-7 sm:pt-7"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,80,40,0.18),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/25 to-amber-400/15 text-amber-300 ring-1 ring-red-400/25">
            <Icon className="h-7 w-7" />
          </div>
          <DateBadge date={event.date} />
        </div>

        <span className="relative font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
          Technical
        </span>
        <h3 className="relative mb-3 mt-1 font-display text-2xl font-bold text-foreground">
          {event.title}
        </h3>
        <div className="relative flex flex-wrap items-center gap-2">
          <ModeBadge mode={event.mode} />
          {event.teamSize && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 font-body text-[10px] font-bold tracking-[0.12em] text-muted-foreground">
              <Users className="h-3 w-3" />
              {event.teamSize}
            </span>
          )}
        </div>

        <p className="relative mt-4 font-body text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>

        <div className="relative my-5 space-y-2.5 border-t border-white/10 pt-5">
          <InfoRow icon={CalendarDays} text={event.date} />
          <InfoRow icon={Clock} text={event.time} />
          <InfoRow icon={MapPin} text={event.venue} />
        </div>

        <div className="relative grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
          <FeeTile label="Internal" amount={event.internalFee} tone="amber" />
          <FeeTile label="External" amount={event.externalFee} tone="orange" />
        </div>

        <div className="relative mt-5 border-t border-white/10 pt-5">
          <h4 className="mb-3 font-body text-xs font-bold uppercase tracking-[0.18em] text-foreground">
            Rules
          </h4>
          <ul className="space-y-2">
            {event.rules.map((rule) => (
              <li
                key={rule}
                className="flex gap-2.5 font-body text-sm text-muted-foreground"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-red-500 to-amber-400" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* pinned on phones so Register is always reachable */}
        <div className="sticky bottom-0 -mx-6 mt-6 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d] to-transparent px-6 pb-[max(env(safe-area-inset-bottom),1rem)] pt-6 sm:-mx-7 sm:px-7">
          <RegisterButton url={event.formUrl} className="w-full" />
        </div>
      </motion.div>
    </motion.div>
  );
};

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
    {children}
  </span>
);

const EventsSection = ({ solidCards = false }: { solidCards?: boolean }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<EventItem | null>(null);

  const minFee = Math.min(...events.map((e) => e.internalFee));
  const dayCount = new Set(events.map((e) => e.date)).size;

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

  /* desktop only: the spotlight follows the mouse */
  const onCardMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

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
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Chip>{events.length} Events</Chip>
            <Chip>{dayCount} Days</Chip>
            <Chip>From ₹{minFee}</Chip>
          </div>
        </div>

        <div
          data-line
          className="mx-auto mb-12 h-px w-40 origin-center bg-gradient-to-r from-transparent via-primary to-transparent md:w-64"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, index) => {
            const Icon = event.icon;
            return (
              <div
                key={event.id}
                data-card
                data-active="false"
                className="group relative h-full will-change-transform transition-[filter] duration-500 data-[active=true]:[filter:drop-shadow(0_0_16px_rgba(255,90,40,0.38))]"
              >
                <article
                  onPointerMove={onCardMove}
                  style={ticketMask}
                  className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 p-6 transition-colors duration-500 group-data-[active=true]:border-red-400/50 [@media(hover:hover)]:hover:border-red-400/40 ${
                    solidCards
                      ? "bg-card"
                      : "bg-gradient-to-b from-[#1a1310]/90 via-[#0f0d0e]/92 to-[#0a0a0c]/95"
                  }`}
                >
                  {/* top-edge light */}
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
                  {/* corner glow */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/15 blur-2xl md:blur-3xl" />
                  {/* mouse spotlight (desktop) */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [@media(hover:hover)]:group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(300px circle at var(--mx, 50%) var(--my, 30%), rgba(255,90,40,0.16), transparent 65%)",
                    }}
                  />
                  {/* big watermark icon (parallax target) */}
                  <Icon
                    data-watermark
                    className="pointer-events-none absolute -right-3 top-14 h-28 w-28 text-white opacity-[0.05] group-hover:opacity-[0.1]"
                  />

                  <div data-part className="relative mb-4 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/25 to-amber-400/15 text-amber-300 ring-1 ring-red-400/25">
                      <Icon className="h-7 w-7" />
                    </div>
                    <DateBadge date={event.date} />
                  </div>

                  <div data-part className="relative mb-1 flex items-center justify-between">
                    <span className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Technical
                    </span>
                    <span className="font-body text-[10px] font-semibold tracking-[0.2em] text-white/30">
                      {String(index + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}
                    </span>
                  </div>
                  <h3
                    data-part
                    className="relative mb-3 font-display text-2xl font-bold text-foreground"
                  >
                    {event.title}
                  </h3>

                  <div data-part className="relative mb-3 flex flex-wrap items-center gap-2">
                    <ModeBadge mode={event.mode} />
                    {event.teamSize && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 font-body text-[10px] font-bold tracking-[0.12em] text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {event.teamSize}
                      </span>
                    )}
                  </div>

                  <p
                    data-part
                    className="relative mb-5 line-clamp-2 min-h-[2.5rem] font-body text-sm text-muted-foreground"
                  >
                    {event.description}
                  </p>

                  <div data-part className="relative mt-auto space-y-2.5">
                    <InfoRow icon={Clock} text={event.time} />
                    <InfoRow icon={MapPin} text={event.venue} />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <FeeTile label="Internal" amount={event.internalFee} tone="amber" />
                      <FeeTile label="External" amount={event.externalFee} tone="orange" />
                    </div>
                  </div>

                  {/* ticket stub: the dashed line sits on the notches */}
                  <div
                    data-part
                    className="relative -mx-6 mt-5 grid grid-cols-2 gap-3 border-t border-dashed border-white/20 px-6 pt-5"
                  >
                    <button
                      onClick={() => setSelected(event)}
                      className="min-h-[48px] rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-body text-sm font-bold text-foreground transition-[background-color,border-color] duration-200 hover:border-white/30 hover:bg-white/10 active:scale-[0.97]"
                    >
                      Details
                    </button>
                    <RegisterButton url={event.formUrl} />
                  </div>
                </article>
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