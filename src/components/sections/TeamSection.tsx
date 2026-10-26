import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, Mail } from "lucide-react";

interface Person {
  name: string;
  phone: string;
  image?: string;
  designation?: string;
  department?: string;
  email?: string;
}

interface CoordinatorGroup {
  eventName: string;
  students: Person[];
  showCoordinatorLabel?: boolean;
}

const coordinatorGroups: CoordinatorGroup[] = [

  {
    eventName: "Vice-president",
    showCoordinatorLabel: false,
    students: [
      { name: "A.Venkatesh", phone: "9014790550" },
    ],
  },
  {
    eventName: "Events-Student  Coordinator",
    showCoordinatorLabel: false,
    students: [
      { name: "S Abdul", phone: "8978876609" },
    ],
  },
  {
    eventName: "SIMUVERSE",
    students: [
      { name: "Ramisetty Karthik Jayanth", phone: "7981921653" },
      { name: "Nandineni Govardhan Naidu", phone: "+91 78935 37998" },
    ],
  },
  {
    eventName: "Project Expo",
    students: [
      { name: "Manasa Pothani", phone: "6309657446" },
      { name: "Sireesha Kona", phone: "6304713584" },
  
    ],
  },
  {
    eventName: "PPT",
    students: [
      { name: "Vishnuteja", phone: "9440645337" },
      { name: "Prudhvi", phone: "6300067360" },

    ],
  },
  {
    eventName: "Electro Escape Room",
    students: [
      { name: "A. Sreeteja", phone: "6300357791" },
      { name: "M. Ram Charan", phone: "9177290083" }
    ],
  },
  {
    eventName: "Technical Quiz",
    students: [
      { name: "Varun", phone: "7416668177" },
    ],
  },
];
const TeamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="team" className="relative py-24 md:py-32 cosmic-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-3">
            The Minds Behind
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold mb-4">
            Event Coordinators
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            Contact the coordinators for event information.
          </p>
        </motion.div>

        {/* EVENTS GRID (2 PER ROW) */}
        <div className="grid md:grid-cols-2 gap-12">
          {coordinatorGroups.map((group, gi) => (
            <motion.div
              key={group.eventName}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: gi * 0.1 }}
              className="card-cosmic p-8"
            >
              <h3 className="font-display text-xl md:text-2xl font-bold text-gradient-gold mb-8 text-center">
                {group.eventName}
              </h3>

              <div
                className="grid grid-cols-1 gap-8"
              >
                {group.students && (
                  <div>
                    {group.showCoordinatorLabel !== false && (
                      <p className="font-body text-xs uppercase tracking-widest text-secondary font-semibold mb-6 text-center">
                        Coordinators
                      </p>
                    )}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-8">
                      {group.students.map((p) => (
                        <PersonCard key={p.name} person={p} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

const PersonCard = ({
  person,
}: {
  person: Person;
}) => (
  <div className="flex w-36 flex-col items-center text-center">
    <div className="relative w-28 h-28 mb-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-4px] rounded-full"
        style={{
          border: "2px solid transparent",
          borderTopColor: "hsl(var(--primary))",
          borderRightColor: "hsl(var(--primary) / 0.3)",
        }}
      />
      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/30">
        {person.image ? (
          <img
            src={person.image}
            alt={person.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 font-display text-2xl font-semibold text-primary">
            {person.name
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}
      </div>
    </div>

    <h4 className="font-display text-sm font-semibold text-foreground">
      {person.name}
    </h4>

    {person.designation && (
      <p className="text-xs text-gradient-gold mt-1 font-semibold">
        {person.designation}
      </p>
    )}

    {person.department && (
      <p className="text-[11px] text-muted-foreground">
        {person.department}
      </p>
    )}

    {person.email && (
      <a
        href={`mailto:${person.email}`}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors mt-1"
      >
        <Mail className="w-3 h-3" />
        {person.email}
      </a>
    )}

    <a
      href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-body mt-2"
    >
      <Phone className="w-3 h-3" />
      {person.phone}
    </a>
  </div>
);

export default TeamSection;