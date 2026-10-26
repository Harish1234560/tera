import PageLayout from "@/components/PageLayout";
import GallerySection from "@/components/sections/GallerySection";
import { ThreeBackground } from "@/components/ui/three-background";
const GalleryPage = () => (
  <PageLayout>
    <ThreeBackground />
    <div className="pt-20" />
    <GallerySection />
  </PageLayout>
);

export default GalleryPage;
