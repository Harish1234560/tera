import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryYear = "2025" | "2024";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

const eventImageFiles = [
  "WhatsApp Image 2026-10-27 at 12.34.18 PM.jpeg",
  "WhatsApp Image 2026-10-27 at 12.34.20 PM.jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.32 AM.jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.33 AM (1).jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.33 AM (2).jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.33 AM.jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.34 AM (1).jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.34 AM (2).jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.34 AM.jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.35 AM (1).jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.35 AM.jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.36 AM.jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.37 AM (1).jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.37 AM.jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.38 AM (1).jpeg",
  "WhatsApp Image 2026-10-28 at 11.59.38 AM.jpeg",
];

const createGalleryImages = (year: GalleryYear, files: string[]): GalleryImage[] =>
  files.map((file, index) => ({
    src: `/images/${encodeURIComponent(file)}`,
    alt: `${year} event photo ${index + 1}`,
    caption: `${year} — Event snapshot ${index + 1}`,
  }));

const galleryByYear: Record<GalleryYear, GalleryImage[]> = {
  "2025": createGalleryImages("2025", eventImageFiles.slice(0, 8)),
  "2024": createGalleryImages("2024", eventImageFiles.slice(8)),
};

const years: GalleryYear[] = ["2025", "2024"];

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
    <section aria-label="Event photo highlights" className="relative overflow-hidden py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h3 className="font-display text-3xl font-bold text-gradient-gold md:text-4xl">
            Our Journey in Frames
          </h3>
          <p className="mx-auto mt-3 max-w-xl font-body text-sm text-muted-foreground md:text-base">
            Relive the energy, creativity, and unforgettable moments from TERA.
          </p>
        </motion.div>

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

        <div className="mt-6 flex justify-center">
          <Link
            to="/gallery"
            className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-6 py-3 font-body text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
          >
            Explore Gallery
          </Link>
        </div>
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
