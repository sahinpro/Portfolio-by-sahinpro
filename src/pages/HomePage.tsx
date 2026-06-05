import Header from "@/components/Header";
import { PublicSeo } from "@/components/public/PublicSeo";
import { CareerJourneySection } from "@/screens/sections/CareerJourneySection";
import { CustomerStoriesSection } from "@/screens/sections/CustomerStoriesSection";
import { DevelopmentProcessSection } from "@/screens/sections/DevelopmentProcessSection";
import { FAQSection } from "@/screens/sections/FAQSection";
import { FeaturedProjectsSection } from "@/screens/sections/FeaturedProjectsSection/FeaturedProjectsSection";
import { FooterSection } from "@/screens/sections/FooterSection";
import { GetStartedSection } from "@/screens/sections/GetStartedSection";
import { HeroSection } from "@/screens/sections/HeroSection";
import { SkillsSection } from "@/screens/sections/SkillsSection";
import { StatsSection } from "@/screens/sections/StatsSection";
import { WhyChooseUsSection } from "@/screens/sections/WhyChooseUsSection";

export const HomePage = (): JSX.Element => {
  return (
    <div className="flex flex-col items-start relative bg-[#050505] min-h-screen w-full overflow-x-hidden">
      <PublicSeo />
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturedProjectsSection />
      <SkillsSection />
      <CareerJourneySection />
      <DevelopmentProcessSection />
      <CustomerStoriesSection />
      <WhyChooseUsSection />
      <FAQSection />
      <GetStartedSection />
      <FooterSection />
    </div>
  );
};
