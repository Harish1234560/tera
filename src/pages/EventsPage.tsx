import PageLayout from "@/components/PageLayout";
import EventsSection from "@/components/sections/EventsSection";
import { ThreeBackground } from "@/components/ui/three-background";

const EventsPage = () => (
  <PageLayout>
    <ThreeBackground />
    <div className="pt-20" />
    <EventsSection />
  </PageLayout>
);

export default EventsPage;
