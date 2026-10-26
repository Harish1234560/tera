import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Zap, Sparkles, Award, Users, BookOpen, Star } from "lucide-react";
 
const stats = [
  { value: "25+", label: "Years of Excellence" },
  { value: "7000+", label: "Students" },
  { value: "10", label: "Programs" },
  { value: "500+", label: "Faculty" },
];

const aboutBlocks = [
  {
    icon: GraduationCap,
    title: "Madanapalle Institute of Technology & Science",
    subtitle: "Deemed to be University",
    desc: "Established in 1998, MITS is a premier institution located in the serene surroundings of Madanapalle on a 26.17-acre campus. With NAAC A+ accreditation and NBA-recognized programs, the institute has built a legacy of academic excellence over 27 years. In 2025, the Government of India conferred MITS with the status of Deemed to be University. Guided by visionary leadership, MITS continues its journey toward global standards in education and innovation.",
    image: "/img1.jpeg",
  },
  {
    icon: Zap,
    title: "Department of EEE",
    subtitle: "Electrical and Electronics Engineering",
    desc: "The Department of Electrical and Electronics Engineering explores the technologies that power modern life, from electrical systems and electronics to energy and automation. Through hands-on learning and innovation, students develop skills to solve real-world engineering challenges.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
  },
  {
    icon: Sparkles,
    title: "About TERA 2K26",
    subtitle: "National Level One-Day Symposium",
    desc: "TERA 2K26 is a National Level One-Day Symposium organized by the Department of EEE. It brings together students, researchers, and industry experts for competitions, workshops, tech talks, and creative showcases celebrating electrical engineering and emerging technologies.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-24 md:py-32 cosmic-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-3">Discover</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold mb-4">About Us</h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            Discover the legacy of excellence and innovation
          </p>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="card-cosmic text-center py-6"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="font-display text-2xl md:text-3xl font-bold text-primary mb-1"
              >
                {stat.value}
              </motion.p>
              <p className="font-body text-xs text-muted-foreground tracking-wider uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Alternating About Blocks */}
        <div className="space-y-20">
          {aboutBlocks.map((block, i) => {
            const isEven = i % 2 === 0;
            const Icon = block.icon;
            return (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-8 md:gap-12 items-center`}
              >
                {/* Image */}
                <div className="w-full md:w-5/12 shrink-0">
                  <div className="relative rounded-xl overflow-hidden group">
                    <img
                      src={block.image}
                      alt={block.title}
                      className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Text */}
                <div className="w-full md:w-7/12">
                  <div className="card-cosmic">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg md:text-xl font-bold text-primary">{block.title}</h3>
                        {block.subtitle && (
                          <p className="font-body text-xs text-muted-foreground">{block.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{block.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
