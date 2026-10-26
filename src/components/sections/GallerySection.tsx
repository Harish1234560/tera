import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryYear = "2025" | "2024" | "2023";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

const galleryByYear: Record<GalleryYear, GalleryImage[]> = {
  "2025": [
    { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80", alt: "Tech conference", caption: "TERA 2K25 — Grand Opening Ceremony" },
    { src: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80", alt: "Speaker on stage", caption: "Keynote by Industry Expert" },
    { src: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&q=80", alt: "Students collaborating", caption: "Hackathon in Action" },
    { src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80", alt: "Award ceremony", caption: "Prize Distribution Ceremony" },
    { src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80", alt: "Team discussion", caption: "Team Brainstorming Session" },
    { src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80", alt: "Workshop", caption: "Hands-on Workshop" },
    { src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80", alt: "Coding hackathon", caption: "Code Nexus Competition" },
    { src: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=600&q=80", alt: "Networking", caption: "Networking & Fun" },
  ],
  "2024": [
    { src: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=600&q=80", alt: "Conference hall", caption: "TERA 2K24 — Inauguration" },
    { src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80", alt: "Panel discussion", caption: "Expert Panel Discussion" },
    { src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80", alt: "Group photo", caption: "Participants Group Photo" },
    { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80", alt: "Team work", caption: "Collaborative Coding Session" },
    { src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80", alt: "Presentation", caption: "Student Presentations" },
    { src: "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=600&q=80", alt: "Data viz", caption: "Data Visualization Contest" },
  ],
  "2023": [
    { src: "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=600&q=80", alt: "Campus event", caption: "TERA 2K23 — Opening Day" },
    { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80", alt: "Classroom session", caption: "Workshop on ML Basics" },
    { src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80", alt: "Awards", caption: "Winners Felicitation" },
    { src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80", alt: "Event stage", caption: "Cultural Evening" },
    { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80", alt: "Crowd", caption: "Enthusiastic Audience" },
  ],
};

const years: GalleryYear[] = ["2025", "2024", "2023"];

export const GalleryStrip = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    let animationId: number;
    let position = 0;
    const scroll = () => {
      position += 0.5;
      if (position >= element.scrollWidth / 2) position = 0;
      element.scrollLeft = position;
      animationId = requestAnimationFrame(scroll);
    };
    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => {
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    element.addEventListener("mouseenter", pause);
    element.addEventListener("mouseleave", resume);
    return () => {
      cancelAnimationFrame(animationId);
      element.removeEventListener("mouseenter", pause);
      element.removeEventListener("mouseleave", resume);
    };
  }, []);

  const images = galleryByYear["2025"];

  return (
    <section aria-label="Event photo highlights" className="relative py-8 overflow-hidden">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {[...images, ...images].map((image, index) => (
          <img
            key={`${image.src}-${index}`}
            src={image.src}
            alt={index < images.length ? image.alt : ""}
            aria-hidden={index >= images.length}
            className="h-36 w-64 shrink-0 rounded-xl object-cover md:h-48 md:w-80"
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
};

const GallerySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeYear, setActiveYear] = useState<GalleryYear>("2025");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentImages = galleryByYear[activeYear];

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    let pos = 0;
    const speed = 0.5;
    const scroll = () => {
      pos += speed;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      animId = requestAnimationFrame(scroll);
    };
    animId = requestAnimationFrame(scroll);
    const pause = () => cancelAnimationFrame(animId);
    const resume = () => { animId = requestAnimationFrame(scroll); };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, [activeYear]);

  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i !== null ? (i - 1 + currentImages.length) % currentImages.length : null));
  const next = () => setLightboxIndex((i) => (i !== null ? (i + 1) % currentImages.length : null));

  return (
    <section id="gallery" className="relative py-24 md:py-32 cosmic-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-3">Memories</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold mb-4">Gallery</h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto mb-8">
            Relive the moments from previous editions of TERA.
          </p>

          {/* Year Tabs */}
          <div className="flex justify-center gap-3">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => { setActiveYear(year); setLightboxIndex(null); }}
                className={`px-6 py-2.5 rounded-full font-body text-sm font-semibold tracking-wider transition-all duration-300 ${
                  activeYear === year
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted/50 text-muted-foreground border border-border hover:border-primary/40"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Auto-scrolling strip */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-hidden mb-12 cursor-grab"
          style={{ scrollbarWidth: "none" }}
        >
          {[...currentImages, ...currentImages].map((img, i) => (
            <div
              key={`${activeYear}-${i}`}
              className="relative shrink-0 w-64 md:w-80 rounded-xl overflow-hidden group cursor-pointer"
              onClick={() => setLightboxIndex(i % currentImages.length)}
            >
              <img src={img.src} alt={img.alt} className="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 font-body text-xs text-foreground/90 truncate">{img.caption}</p>
            </div>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeYear}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {currentImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
                onClick={() => setLightboxIndex(i)}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="absolute bottom-2 left-2 right-2 font-body text-[10px] text-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
                  {img.caption}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }} className="absolute top-6 right-6 text-foreground/60 hover:text-foreground transition-colors">
              <X className="w-8 h-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 md:left-8 text-foreground/60 hover:text-foreground transition-colors">
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 md:right-8 text-foreground/60 hover:text-foreground transition-colors">
              <ChevronRight className="w-10 h-10" />
            </button>
            <div className="text-center" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                src={currentImages[lightboxIndex].src.replace("w=600", "w=1200")}
                alt={currentImages[lightboxIndex].alt}
                className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg"
              />
              <p className="font-body text-sm text-muted-foreground mt-4">
                {currentImages[lightboxIndex].caption}
                <span className="ml-2 text-xs text-primary">— {activeYear}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
