import { useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface Person {
  name: string;
  title: string;
  subtitle: string;
  image: string;
}

interface Group {
  eyebrow: string;
  heading: string;
  people: Person[];
}

const groups: Group[] = [
  {
    eyebrow: "Leadership",
    heading: "Distinguished Dignitaries",
    people: [
      {
        name: "Dr. A. V. Pavan Kumar",
        title: "Professor & Assistant Dean",
        subtitle: "Ph.D. (BITS-Pilani, Hyderabad)",
        image: "/image.png",
      },
      {
        name: "Dr. Manavaalan Gunasekaran",
        title: "Assoc. Professor & Head",
        subtitle: "Ph.D. (IIT, Kanpur)",
        image: "/image1.png",
      },
    ],
  },
  {
    eyebrow: "Coordination",
    heading: "Event Faculty Coordinators",
    people: [
      {
        name: "Dr. Sarat Kumar Mishra",
        title: "Asst. Professor",
        subtitle: "Ph.D. (B.I.T., Mesra)",
        image: "/image3.png",
      },
      {
        name: "Dr. Sovit Kumar Pradhan",
        title: "Asst. Professor",
        subtitle: "Ph.D. (NIT, Silchar)",
        image: "/image2.png",
      },
    ],
  },
];

const getInitials = (name: string) => {
  const words = name
    .replace(/^Dr\.?\s*/i, "")
    .replace(/\./g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
};

const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 32, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Avatar = ({ person }: { person: Person }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-4 rounded-full bg-primary/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-70" />
      <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-primary via-primary/40 to-red-500/60 p-[3px] sm:h-32 sm:w-32 md:h-36 md:w-36">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0b0b0d]">
          {failed ? (
            <span className="font-display text-3xl font-semibold text-primary">
              {getInitials(person.name)}
            </span>
          ) : (
            <img
              src={person.image}
              alt={person.name}
              loading="lazy"
              decoding="async"
              onError={() => setFailed(true)}
              className="h-full w-full object-cover object-top"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const PersonCard = ({ person, index }: { person: Person; index: number }) => (
  <Reveal delay={index * 0.1} className="h-full">
    <div className="group relative flex h-full flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-black/40 px-6 pb-7 pt-9 text-center transition-colors duration-300 hover:border-primary/40">
      <GraduationCap className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 text-white opacity-[0.05] transition-opacity group-hover:opacity-[0.1]" />

      <Avatar person={person} />

      <h3 className="relative mt-6 font-display text-lg font-bold leading-snug text-primary md:text-xl">
        {person.name}
      </h3>
      <p className="relative mt-1 font-body text-sm text-foreground/90">
        {person.title}
      </p>

      <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 font-body text-[11px] text-muted-foreground">
        <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary" />
        {person.subtitle}
      </span>
    </div>
  </Reveal>
);

const ChiefGuestsSection = () => (
  <section className="relative py-24 md:py-32 cosmic-bg">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {groups.map((group, gi) => (
        <div key={group.heading} className={gi > 0 ? "mt-20 md:mt-28" : ""}>
          <Reveal className="mb-10 text-center md:mb-14">
            <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-secondary">
              {group.eyebrow}
            </p>
            <h2 className="font-display text-3xl font-bold italic text-gradient-gold md:text-5xl">
              {group.heading}
            </h2>
            <div className="mx-auto mt-5 h-px w-32 bg-gradient-to-r from-transparent via-primary to-transparent md:w-48" />
          </Reveal>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 md:gap-8">
            {group.people.map((person, i) => (
              <PersonCard key={person.name} person={person} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ChiefGuestsSection;