import PageLayout from "@/components/PageLayout";
import ContactSection from "@/components/sections/ContactSection";
import { ThreeBackground } from "@/components/ui/three-background";


const ContactPage = () => (
  <PageLayout>
    <div className="pt-20" />
    <ThreeBackground />
    <ContactSection />
  </PageLayout>
);

export default ContactPage;
