import { Link } from "react-router-dom";
import { Instagram, Globe, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => (
  <footer className="relative border-t border-border bg-card/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        
        {/* Brand */}
        <div>
          <h3 className="font-display text-2xl font-bold text-gradient-gold mb-3">
            TERA 2K26
          </h3>
          <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
            Department of EEE<br />
            Madanapalle Institute of Technology & Science<br />
            (Deemed to be University)
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-body text-sm uppercase tracking-widest text-primary font-semibold mb-4">
            Contact
          </h4>
          <div className="space-y-3">
            <p className="flex items-start gap-2 font-body text-base text-muted-foreground">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
              Madanapalle, Andhra Pradesh
            </p>
            <p className="flex items-center gap-2 font-body text-base text-muted-foreground">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              +91 6300481038
            </p>
            <p className="flex items-center gap-2 font-body text-base text-muted-foreground">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              teraeee@mits.ac.in
            </p>
          </div>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-body text-sm uppercase tracking-widest text-primary font-semibold mb-4">
            Follow Us
          </h4>
          <div className="flex gap-4">
            <a href="#" className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary/10 transition-colors">
              <Instagram className="w-5 h-5 text-primary" />
            </a>
            <a href="#" className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary/10 transition-colors">
              <Globe className="w-5 h-5 text-primary" />
            </a>
            <a href="#" className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center hover:bg-primary/10 transition-colors">
              <Mail className="w-5 h-5 text-primary" />
            </a>
          </div>
        </div>
      </div>

      <div className="section-divider mb-6" />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="font-body text-sm text-muted-foreground text-center sm:text-left">
          © 2026 TERA — Department of EEE, MITS
        </p>
        <p className="font-body text-sm text-muted-foreground text-center sm:text-right">
          Made by Arc Club for TERA 2K26
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;