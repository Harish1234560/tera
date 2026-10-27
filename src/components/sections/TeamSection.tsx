import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Award,
  BookOpen,
  Cpu,
  MessageCircle,
  Phone,
  Presentation,
  Puzzle,
  Star,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Person {
  name: string;
  phone: string;
  image?: string;
}

interface Leader {
  role: string;
  icon: LucideIcon;
  person: Person;
}

interface EventGroup {
  eventName: string;
  icon: LucideIcon;
  students: Person[];
}

const leaders: Leader[] = [
  {
    role: "Vice President",
    icon: Award,
    person: { name: "A. Venkatesh", phone: "9014790550" },
  },
  {
    role: "Events Student Coordinator",
    icon: Star,
    person: { name: "S Abdul", phone: "8978876609" },
  },
];

const eventGroups: EventGroup[] = [
  {
    eventName: "SIMUVERSE",
    icon: Cpu,
    students: [
      { name: "Ramisetty Karthik Jayanth", phone: "7981921653" },
      { name: "Nandineni Govardhan Naidu", phone: "+91 78935 37998" },
    ],
  },
  {
    eventName: "Project Expo",
    icon: Presentation,
    students: [
      { name: "Manasa Pothani", phone: "6309657446" },
      { name: "Sireesha Kona", phone: "6304713584" },
    ],
  },
  {
    eventName: "Paper Presentation",
    icon: BookOpen,
    students: [
      { name: "Vishnuteja", phone: "9440645337" },
      { name: "Prudhvi", phone: "6300067360" },
    ],
  },
  {
    eventName: "Electro Escape Room",
    icon: Puzzle,
    students: [
      { name: "A. Sreeteja", phone: "6300357791" },
      { name: "M. Ram Charan", phone: "9177290083" },
    ],
  },
  {
    eventName: "Technical Quiz",
    icon: Zap,
    students: [{ name: "Varun", phone: "7416668177" }],
  },
];

/* ---------- helpers ---------- */

const nationalNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
};

const displayPhone = (phone: string) => {
  const n = nationalNumber(phone);
  return `+91 ${n.slice(0, 5)} ${n.slice(5)}`;
};

const getInitials = (name: string) =>
  name
    .replace(/\./g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ---------- small components ---------- */

const Avatar = ({
  person,
  size = "md",
}: {
  person: Person;
  size?: "md" | "lg";
}) => {
  const dim = size === "lg" ? "h-16 w-16 text-xl" : "h-12 w-12 text-base";
  return (
    <div
      className={`shrink-0 rounded-full bg-gradient-to-br from-primary via-primary/40 to-transparent p-[2px] ${dim}`}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0b0b0d]">
        {person.image ? (
          <img
            src={person.image}
            alt={person.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-display font-semibold text-primary">
            {getInitials(person.name)}
          </span>
        )}
      </div>
    </div>
  );
};

const ContactButtons = ({ phone, name }: { phone: string; name: string }) => {
  const n = nationalNumber(phone);
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95";
  return (
    <div className="flex shrink-0 items-center gap-2">
      <a
        href={`https://wa.me/91${n}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ${name}`}
        className={`${btn} border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20`}
      >
        <MessageCircle className="h-[18px] w-[18px]" />
      </a>
      <a
        href={`tel:+91${n}`}
        aria-label={`Call ${name}`}
        className={`${btn} border-white/90 bg-white text-black hover:bg-amber-50`}
      >
        <Phone className="h-[18px] w-[18px]" />
      </a>
    </div>
  );
};

const PersonRow = ({ person }: { person: Person }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3">
    <Avatar person={person} />
    <div className="min-w-0 flex-1">
      <p className="truncate font-display text-sm font-semibold text-foreground">
        {person.name}
      </p>
      <p className="mt-0.5 font-body text-xs text-muted-foreground">
        {displayPhone(person.phone)}
      </p>
    </div>
    <ContactButtons phone={person.phone} name={person.name} />
  </div>
);

const LeaderCard = ({ leader, index }: { leader: Leader; index: number }) => {
  const Icon = leader.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-white/[0.04] to-black/40 p-5 backdrop-blur-md sm:p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
      <Icon className="pointer-events-none absolute right-5 top-5 h-16 w-16 text-white opacity-[0.06]" />

      <span className="relative inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
        <Icon className="h-3 w-3" />
        {leader.role}
      </span>

      <div className="relative mt-5 flex items-center gap-4">
        <Avatar person={leader.person} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold text-foreground">
            {leader.person.name}
          </p>
          <p className="mt-0.5 font-body text-xs text-muted-foreground">
            {displayPhone(leader.person.phone)}
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <a
          href={`https://wa.me/91${nationalNumber(leader.person.phone)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 font-body text-sm font-bold text-emerald-300 transition active:scale-95 hover:bg-emerald-400/20"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <a
          href={`tel:+91${nationalNumber(leader.person.phone)}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white font-body text-sm font-bold text-black transition active:scale-95 hover:bg-amber-50"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
      </div>
    </motion.div>
  );
};

const GroupCard = ({ group, index }: { group: EventGroup; index: number }) => {
  const Icon = group.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-black/40 p-5 backdrop-blur-md transition-colors duration-300 hover:border-primary/40 sm:p-6"
    >
      <Icon className="pointer-events-none absolute right-5 top-5 h-16 w-16 text-white opacity-[0.06] transition-opacity group-hover:opacity-[0.12]" />

      <div className="relative mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <span className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            {group.students.length > 1 ? "Coordinators" : "Coordinator"}
          </span>
          <h3 className="truncate font-display text-lg font-bold text-foreground">
            {group.eventName}
          </h3>
        </div>
      </div>

      <div className="relative space-y-3">
        {group.students.map((p) => (
          <PersonRow key={p.name} person={p} />
        ))}
      </div>
    </motion.div>
  );
};

/* ---------- section ---------- */

const TeamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="team" className="relative py-20 md:py-32 cosmic-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-10 text-center md:mb-14"
        >
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-secondary">
            The Minds Behind
          </p>
          <h2 className="mb-3 font-display text-3xl font-bold text-gradient-gold md:text-5xl">
            Event Coordinators
          </h2>
          <p className="mx-auto max-w-xl font-body text-muted-foreground">
            Tap call or WhatsApp to reach a coordinator for event details.
          </p>
        </motion.div>

        {/* Leadership */}
        <div className="mx-auto mb-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:mb-8">
          {leaders.map((leader, i) => (
            <LeaderCard key={leader.role} leader={leader} index={i} />
          ))}
        </div>

        {/* Event coordinators */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {eventGroups.map((group, i) => (
            <GroupCard key={group.eventName} group={group} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;