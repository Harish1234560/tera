import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const dignitaries = [
  {
    name: "Dr. A. V. Pavan Kumar",
    title: "Professor & Assistant Dean",
    subtitle: "Ph.D. (BITS-Pilani, Hyderabad)",
    image: "image.png",
  },
  {
    name: "Dr. Manavaalan Gunasekaran",
    title: "Assoc. Professor & Head",
    subtitle: "Ph.D. (IIT, Kanpur)",
    image: "/image1.png", 
  },
];

const facultyCoordinators = [
  {
    name: "Dr. Sarat Kumar Mishra",
    title: "Asst. Professor",
    subtitle: "Ph.D. (B.I.T., Mesra)",
    image: "/image2.png",
  },
  {
    name: "Dr. Sovit Kumar Pradhan",
    title: "Asst. Professor",
    subtitle: "Ph.D. (NIT, Silchar)",
    image: "/image3.png",
  },
];

const ChiefGuestsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold mb-4 italic">
            Distinguished Dignitaries
          </h2>
        </motion.div>

        {[{ title: "Distinguished Dignitaries", guests: dignitaries }, { title: "Event Faculty Coordinators", guests: facultyCoordinators }].map((group, groupIndex) => (
          <div key={group.title} className={groupIndex > 0 ? "mt-16" : ""}>
            {groupIndex > 0 && (
              <h2 className="font-display text-2xl md:text-4xl font-bold text-gradient-gold mb-10 text-center italic">
                {group.title}
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-5xl mx-auto">
              {group.guests.map((guest, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={guest.name}
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.7, delay: (groupIndex * 2 + i) * 0.15 }}
                    className={`flex items-center gap-4 sm:gap-8 ${isEven ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div className="relative shrink-0">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-6px] rounded-full"
                        style={{
                          border: "2px solid transparent",
                          borderTopColor: "hsl(var(--primary))",
                          borderRightColor: "hsl(var(--primary) / 0.3)",
                        }}
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-12px] rounded-full"
                        style={{
                          border: "1px solid transparent",
                          borderBottomColor: "hsl(var(--accent) / 0.5)",
                          borderLeftColor: "hsl(var(--accent) / 0.2)",
                        }}
                      />
                      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-primary/30">
                        <img
                          src={guest.image}
                          alt={guest.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className={isEven ? "text-left" : "text-right"}>
                      <h3 className="font-display text-lg md:text-xl font-bold text-primary mb-1">{guest.name}</h3>
                      <p className="font-body text-sm text-muted-foreground">{guest.title}</p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{guest.subtitle}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChiefGuestsSection;
