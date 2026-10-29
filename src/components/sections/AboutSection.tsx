import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, GraduationCap, Sparkles, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

/* VERIFY these against official MITS figures */
const stats = [
  { value: 25, suffix: "+", label: "Years of Excellence" },
  { value: 7000, suffix: "+", label: "Students" },
  { value: 10, suffix: "", label: "Programs" },
  { value: 500, suffix: "+", label: "Faculty" },
];

interface Block {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  desc: string;
  image: string; // replace with real MITS / EEE / event photos
}

const aboutBlocks: Block[] = [
  {
    icon: GraduationCap,
    title: "Madanapalle Institute of Technology & Science",
    subtitle: "Deemed to be University",
    desc: "Established in 1998, MITS is a premier institution located in the serene surroundings of Madanapalle on a 26.17-acre campus. With NAAC A+ accreditation and NBA-recognized programs, the institute has built a legacy of academic excellence over 27 years. In 2025, the Government of India conferred MITS with the status of Deemed to be University. Guided by visionary leadership, MITS continues its journey toward global standards in education and innovation.",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
  },
  {
    icon: Zap,
    title: "Department of EEE",
    subtitle: "Electrical and Electronics Engineering",
    desc: "The Department of Electrical and Electronics Engineering explores the technologies that power modern life, from electrical systems and electronics to energy and automation. Through hands-on learning and innovation, students develop skills to solve real-world engineering challenges.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
  },
  {
    icon: Sparkles,
    title: "About TERA 2K26",
    subtitle: "National Level Two-Days Symposium",
    desc: "TERA 2K26 is a National Level Two-Days Symposium organized by the Department of EEE. It brings together students, researchers, and industry experts for competitions, workshops, tech talks, and creative showcases celebrating electrical engineering and emerging technologies.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  },
];

const AboutSection = () => {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        /* header */
        const head = root.querySelector("[data-head]");
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

        /* stats: stagger in + count up */
        const grid = root.querySelector("[data-stats]");
        if (grid) {
          gsap.from(grid.children, {
            y: 40,
            opacity: 0,
            scale: 0.94,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: grid, start: "top 88%", once: true },
          });

          root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
            const target = Number(el.dataset.count);
            const suffix = el.dataset.suffix ?? "";
            const o = { v: 0 };
            el.textContent = `0${suffix}`;
            gsap.to(o, {
              v: target,
              duration: 1.8,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = `${Math.round(o.v).toLocaleString("en-IN")}${suffix}`;
              },
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            });
          });
        }

        /* blocks */
        root.querySelectorAll<HTMLElement>("[data-block]").forEach((block) => {
          const media = block.querySelector<HTMLElement>("[data-media]");
          const img = block.querySelector<HTMLElement>("[data-img]");
          const text = block.querySelector<HTMLElement>("[data-text]");

          if (media) {
            gsap.fromTo(
              media,
              { clipPath: "inset(0% 0% 100% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.2,
                ease: "power3.inOut",
                scrollTrigger: { trigger: block, start: "top 82%", once: true },
              }
            );
          }
          if (img) {
            gsap.fromTo(
              img,
              { scale: 1.3 },
              {
                scale: 1,
                duration: 1.6,
                ease: "power3.out",
                scrollTrigger: { trigger: block, start: "top 82%", once: true },
              }
            );
            gsap.fromTo(
              img,
              { yPercent: -7 },
              {
                yPercent: 7,
                ease: "none",
                scrollTrigger: {
                  trigger: block,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            );
          }
          if (text) {
            gsap.from(text.children, {
              y: 36,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.12,
              delay: 0.25,
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: block, start: "top 78%", once: true },
            });
          }
        });
      },
      root
    );

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  return (
    <section ref={rootRef} id="about" className="relative py-24 md:py-32 cosmic-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* header */}
        <div data-head className="mb-12 text-center">
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-secondary">
            Discover
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold text-gradient-gold md:text-5xl">
            About Us
          </h2>
          <p className="mx-auto max-w-xl font-body text-muted-foreground">
            Discover the legacy of excellence and innovation
          </p>
          <div className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-primary" />
        </div>

        {/* stats */}
        <div data-stats className="mb-20 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl border border-border bg-card px-3 py-6 text-center"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
              <p
                data-count={s.value}
                data-suffix={s.suffix}
                className="relative font-display text-3xl font-bold tabular-nums text-primary md:text-4xl"
              >
                {s.value.toLocaleString("en-IN")}
                {s.suffix}
              </p>
              <p className="relative mt-1.5 font-body text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:text-xs">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* blocks */}
        <div className="space-y-16 md:space-y-24">
          {aboutBlocks.map((block, i) => {
            const Icon = block.icon;
            const reverse = i % 2 === 1;
            return (
              <div
                key={block.title}
                data-block
                className={`flex flex-col items-stretch gap-6 md:gap-12 ${
                  reverse ? "md:flex-row-reverse" : "md:flex-row"
                } md:items-center`}
              >
                {/* image */}
                <div className="w-full shrink-0 md:w-5/12">
                  <div
                    data-media
                    className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
                  >
                    <img
                      data-img
                      src={block.image}
                      alt={block.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="absolute inset-[-8%] h-[116%] w-[116%] max-w-none object-cover will-change-transform"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute bottom-4 left-5 font-display text-5xl font-black leading-none text-white/20">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* text */}
                <div className="w-full md:w-7/12">
                  <div
                    data-text
                    className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8"
                  >
                    <Icon className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 text-white opacity-[0.05]" />
                    <div className="relative mb-4 flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold leading-snug text-primary md:text-xl">
                          {block.title}
                        </h3>
                        <p className="font-body text-xs text-muted-foreground">
                          {block.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className="relative font-body text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                      {block.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center md:mt-20">
          <Link
            to="/events"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-white px-8 font-body text-sm font-bold text-black shadow-[0_12px_36px_-10px_rgba(251,191,36,0.6)] transition active:scale-[0.97]"
          >
            Explore Events &amp; Register
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;