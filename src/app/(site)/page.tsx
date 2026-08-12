import { Hero } from "@/components/site/Hero";
import { FleetSection } from "@/components/site/FleetSection";
import { ServicesSection } from "@/components/site/ServicesSection";
import { AboutSection } from "@/components/site/AboutSection";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { FaqSection } from "@/components/site/FaqSection";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { getFeaturedReviews, getVehicles } from "@/lib/data";

export default async function HomePage() {
  const [vehicles, reviews] = await Promise.all([
    getVehicles(),
    getFeaturedReviews(),
  ]);

  return (
    <>
      <Hero />
      <FleetSection vehicles={vehicles} />
      <ServicesSection />
      <AboutSection />
      <WhyChooseUs />
      <ReviewsSection reviews={reviews} />
      <FaqSection />
      <EnquiryForm />
    </>
  );
}
