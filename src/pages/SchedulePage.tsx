import PageLayout from "@/components/PageLayout";
import ScheduleSection from "@/components/sections/ScheduleSection";
import { ThreeBackground } from "@/components/ui/three-background";
const SchedulePage = () => (
  <PageLayout>
    <ThreeBackground />
    <div className="pt-20" />
    <ScheduleSection />
  </PageLayout>
);

export default SchedulePage;
