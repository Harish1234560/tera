import PageLayout from "@/components/PageLayout";
import TeamSection from "@/components/sections/TeamSection";
import { ThreeBackground } from "@/components/ui/three-background";
const TeamPage = () => (
  <PageLayout>
    <ThreeBackground />
    <div className="pt-20" />
    <TeamSection />
  </PageLayout>
);

export default TeamPage;
