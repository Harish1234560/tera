import { useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Instagram,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* Replace with your real handle, e.g. https://instagram.com/your_handle */
const INSTAGRAM_URL = "https://www.instagram.com/";

const PHONE_DISPLAY = "+91 63004 81038";
const PHONE_TEL = "+916300481038";
const WHATSAPP_URL = "https://wa.me/916300481038";
const EMAIL = "teraeee@mits.ac.in";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Madanapalle+Institute+of+Technology+and+Science";
const MAP_EMBED =
  "https://www.google.com/maps?q=Madanapalle+Institute+of+Technology+%26+Science&output=embed";

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
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ContactCard = ({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  href: string;
  external?: boolean;
}) => (
  <a
    href={href}
    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    className="group relative flex min-h-[76px] items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-black/40 p-4 transition-colors duration-300 hover:border-primary/40 active:bg-white/[0.06] md:p-5"
  >
    <Icon className="pointer-events-none absolute -right-2 -top-2 h-20 w-20 text-white opacity-[0.05] transition-opacity group-hover:opacity-[0.1]" />
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
      <Icon className="h-5 w-5" />
    </div>
    <div className="relative min-w-0 flex-1">
      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
        {label}
      </p>
      <p className="mt-1 break-words font-body text-sm leading-snug text-foreground">
        {value}
      </p>
    </div>
    <ArrowUpRight className="relative h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
  </a>
);

const socials = [
  { label: "WhatsApp", href: WHATSAPP_URL, icon: MessageCircle, external: true },
  { label: "Instagram", href: INSTAGRAM_URL, icon: Instagram, external: true },
  { label: "Email", href: `mailto:${EMAIL}`, icon: Mail, external: false },
];

const ContactSection = () => {
  const [mapActive, setMapActive] = useState(false);

  return (
    <section id="contact" className="relative py-24 md:py-32 cosmic-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* heading */}
        <Reveal className="mb-12 text-center md:mb-16">
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-secondary">
            Connect
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold text-gradient-gold md:text-5xl">
            Get In Touch
          </h2>
          <p className="mx-auto max-w-xl font-body text-muted-foreground">
            Ready to be part of TERA 2K26? Reach out or visit us below.
          </p>
          <div className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-primary to-transparent md:w-64" />
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          {/* left: contact */}
          <Reveal className="space-y-4">
            <ContactCard
              icon={MapPin}
              label="Venue"
              href={DIRECTIONS_URL}
              external
              value={
                <>
                  Madanapalle Institute of Technology &amp; Science
                  <br />
                  <span className="text-muted-foreground">
                    (Deemed to be University)
                  </span>
                  <br />
                  <span className="text-muted-foreground">
                    Madanapalle, Andhra Pradesh, India
                  </span>
                </>
              }
            />
            <ContactCard
              icon={Phone}
              label="Phone"
              href={`tel:${PHONE_TEL}`}
              value={PHONE_DISPLAY}
            />
            <ContactCard
              icon={Mail}
              label="Email"
              href={`mailto:${EMAIL}`}
              value={EMAIL}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 font-body text-sm font-bold text-emerald-300 transition active:scale-[0.97] hover:bg-emerald-400/20"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${PHONE_TEL}`}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white font-body text-sm font-bold text-black shadow-[0_10px_30px_-10px_rgba(251,191,36,0.6)] transition active:scale-[0.97]"
              >
                <Phone className="h-4 w-4" />
                Call now
              </a>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {socials.map(({ label, href, icon: Icon, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 text-primary transition-all hover:bg-primary/10 active:scale-90"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </Reveal>

          {/* right: map */}
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-black/40 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-foreground">
                  College Location
                </h3>
                <span className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Madanapalle
                </span>
              </div>

              <div className="relative h-[300px] overflow-hidden rounded-2xl border border-white/10 md:h-[380px]">
                <iframe
                  title="MITS Location"
                  src={MAP_EMBED}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className={`h-full w-full border-0 ${
                    mapActive ? "" : "pointer-events-none"
                  }`}
                />

                {!mapActive && (
                  <button
                    type="button"
                    onClick={() => setMapActive(true)}
                    aria-label="Tap to interact with the map"
                    className="absolute inset-0 flex items-end justify-center bg-black/10 pb-4"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2.5 font-body text-xs font-semibold text-white">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Tap to explore map
                    </span>
                  </button>
                )}

                {mapActive && (
                  <button
                    type="button"
                    onClick={() => setMapActive(false)}
                    className="absolute right-3 top-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3.5 font-body text-xs font-semibold text-white"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Lock map
                  </button>
                )}
              </div>

              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-black/30 font-body text-sm font-bold text-foreground transition hover:border-white/30 hover:bg-white/10 active:scale-[0.97]"
              >
                <Navigation className="h-4 w-4 text-primary" />
                Get Directions
              </a>
            </div>
          </Reveal>
        </div>

        {/* tagline */}
        <Reveal className="mt-20 text-center md:mt-28">
          <div className="section-divider mb-10" />
          <p className="mb-6 font-display text-2xl font-bold text-gradient-gold glow-text md:text-4xl">
            Power Ideas. Shape Futures.
          </p>
          <Link
            to="/events"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-white px-8 font-body text-sm font-bold text-black shadow-[0_12px_36px_-10px_rgba(251,191,36,0.6)] transition active:scale-[0.97]"
          >
            Explore Events &amp; Register
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default ContactSection;