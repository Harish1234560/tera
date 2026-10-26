import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Phone, Mail, Instagram, Globe } from "lucide-react";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-3">
            Connect
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold mb-4">
            Get In Touch
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            Ready to be part of TERA 2K26? Reach out or visit us below.
          </p>
        </motion.div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left Side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Venue */}
            <div className="card-cosmic flex items-start gap-4">
              <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
              <div>
                <h4 className="font-display text-sm font-semibold text-foreground mb-1">
                  Venue
                </h4>
                <p className="font-body text-sm text-muted-foreground">
                  Madanapalle Institute of Technology & Science <br />
                  (Deemed to be University) <br />
                  Madanapalle, Andhra Pradesh, India
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="card-cosmic flex items-start gap-4">
              <Phone className="w-5 h-5 text-primary mt-1 shrink-0" />
              <div>
                <h4 className="font-display text-sm font-semibold text-foreground mb-1">
                  Phone
                </h4>
                <p className="font-body text-sm text-muted-foreground">
                  +91 98765 43210
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="card-cosmic flex items-start gap-4">
              <Mail className="w-5 h-5 text-primary mt-1 shrink-0" />
              <div>
                <h4 className="font-display text-sm font-semibold text-foreground mb-1">
                  Email
                </h4>
                <p className="font-body text-sm text-muted-foreground">
                  dfesta2k26@mits.ac.in
                </p>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 pt-4">
              <a href="#" className="social-icon">
                <Instagram className="w-4 h-4 text-primary" />
              </a>
              <a href="#" className="social-icon">
                <Globe className="w-4 h-4 text-primary" />
              </a>
              <a href="#" className="social-icon">
                <Mail className="w-4 h-4 text-primary" />
              </a>
            </div>
          </motion.div>

          {/* Right Side - Google Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card-cosmic p-4"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">
              College Location
            </h3>

            <div className="w-full h-[350px] rounded-xl overflow-hidden">
              <iframe
                title="MITS Location"
                src="https://www.google.com/maps?q=Madanapalle+Institute+of+Technology+%26+Science&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                className="rounded-xl"
              />
            </div>
          </motion.div>

        </div>

        {/* Footer Tagline (Outside Grid) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mt-24 pt-12"
        >
          <div className="section-divider mb-12" />
          <p className="font-display text-2xl md:text-4xl font-bold text-gradient-gold glow-text mb-4">
            Power Ideas. Shape Futures.
          </p>
          <p className="font-body text-xs text-muted-foreground tracking-wider">
            © 2026 TERA — Department of EEE, MITS
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default ContactSection;