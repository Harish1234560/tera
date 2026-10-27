import { Link } from "react-router-dom";
import {
  ArrowUp,
  ArrowUpRight,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { getLenis } from "@/components/SmoothScroll";

/* Replace with your real handle, e.g. https://instagram.com/your_handle */
const INSTAGRAM_URL = "https://www.instagram.com/";

const PHONE_DISPLAY = "+91 63004 81038";
const PHONE_TEL = "+916300481038";
const WHATSAPP_URL = "https://wa.me/916300481038";
const EMAIL = "teraeee@mits.ac.in";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Madanapalle+Institute+of+Technology+and+Science";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Schedule", href: "/schedule" },
  { label: "Gallery", href: "/gallery" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

const socials = [
  { label: "WhatsApp", href: WHATSAPP_URL, icon: MessageCircle, external: true },
  { label: "Instagram", href: INSTAGRAM_URL, icon: Instagram, external: true },
  { label: "Email", href: `mailto:${EMAIL}`, icon: Mail, external: false },
];

const contactRow =
  "group flex min-h-[52px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-primary/40 active:bg-white/[0.06]";

const Footer = () => {
  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-card/50">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 0%, rgba(255,90,40,0.10), transparent 70%), radial-gradient(40% 50% at 100% 100%, rgba(255,184,0,0.07), transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 md:pt-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr]">
          {/* brand */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-primary/40">
                <img
                  src="/EEElogo.png"
                  alt="TERA Ignite 2K26 2.0 logo"
                  loading="lazy"
                  className="h-full w-full scale-[1.14] object-cover"
                />
              </span>
              <div>
                <h3 className="font-display text-2xl font-bold leading-none text-gradient-gold">
                  TERA IGNITE 2K26
                </h3>
                <p className="mt-1.5 font-body text-[10px] uppercase tracking-[0.3em] text-primary">
                  Department of EEE
                </p>
              </div>
            </div>
            <p className="max-w-sm font-body text-sm leading-relaxed text-muted-foreground">
              Madanapalle Institute of Technology &amp; Science
              <br />
              (Deemed to be University)
            </p>

            <Link
              to="/events"
              className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-6 font-body text-sm font-bold text-black shadow-[0_10px_30px_-10px_rgba(251,191,36,0.6)] transition active:scale-[0.97]"
            >
              Explore Events &amp; Register
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* quick links */}
          <div>
            <h4 className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Explore
            </h4>
            <div className="grid grid-cols-2 gap-x-4">
              {quickLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  className="flex min-h-[44px] items-center font-body text-sm text-muted-foreground transition-colors hover:text-foreground active:text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* contact */}
          <div>
            <h4 className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={contactRow}
              >
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span className="font-body text-sm text-muted-foreground group-hover:text-foreground">
                  Madanapalle, Andhra Pradesh
                </span>
              </a>
              <a href={`tel:${PHONE_TEL}`} className={contactRow}>
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <span className="font-body text-sm text-muted-foreground group-hover:text-foreground">
                  {PHONE_DISPLAY}
                </span>
              </a>
              <a href={`mailto:${EMAIL}`} className={contactRow}>
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <span className="min-w-0 truncate font-body text-sm text-muted-foreground group-hover:text-foreground">
                  {EMAIL}
                </span>
              </a>
            </div>

            <div className="mt-5 flex items-center gap-3">
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
          </div>
        </div>

        {/* bottom bar */}
        <div
          className="mt-12 flex flex-col items-center gap-4 border-t border-white/10 pt-6 sm:flex-row sm:justify-between"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
        >
          <p className="text-center font-body text-xs text-muted-foreground sm:text-left">
            © 2026 TERA IGNITE, Department of EEE, MITS
          </p>
          <p className="text-center font-body text-xs text-muted-foreground">
            Made by Arc Club for TERA 2K26
          </p>
          <button
            onClick={toTop}
            aria-label="Back to top"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-muted-foreground transition hover:border-primary/40 hover:text-primary active:scale-90"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;