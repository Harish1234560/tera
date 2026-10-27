import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ChiefGuestsSection from "@/components/sections/ChiefGuestsSection";
import EventsSection from "@/components/sections/EventsSection";
import ScheduleSection from "@/components/sections/ScheduleSection";
import TeamSection from "@/components/sections/TeamSection";
import { GalleryStrip } from "@/components/sections/GallerySection";
import ContactSection from "@/components/sections/ContactSection";
import IntroSplash from "@/components/IntroSplash";
import PageLayout from "@/components/PageLayout";
import { ThreeBackground } from "@/components/ui/three-background";
import { useState } from "react";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}
      <div className={showIntro ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        <PageLayout>
        <ThreeBackground />
          <HeroSection />
          <div className="section-divider" />
          <GalleryStrip />
          <EventsSection solidCards />
          <div className="section-divider" />
          <ChiefGuestsSection />
          <div className="section-divider" />
          <AboutSection />
        </PageLayout>
      </div>
    </>
  );
};

export default Index;
