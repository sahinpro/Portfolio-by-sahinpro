import Header from "@/components/Header";
import { CustomerStoriesSection } from "@/screens/sections/CustomerStoriesSection/CustomerStoriesSection";
import { FeaturesOverviewSection } from "@/screens/sections/FeaturesOverviewSection/FeaturesOverviewSection";
import { FooterSection } from "@/screens/sections/FooterSection/FooterSection";
import { GetStartedSection } from "@/screens/sections/GetStartedSection";
import { HeroSection } from "@/screens/sections/HeroSection";
import { PricingSection } from "@/screens/sections/PricingSection/PricingSection";
import { SkillsSection } from "@/screens/sections/SkillsSection";
import { VideoSection } from "@/screens/sections/VideoSection";
import { WhyChooseUsSection } from "@/screens/sections/WhyChooseUsSection";

/**
 * Home page component - Main landing page
 */
export const HomePage = (): JSX.Element => {
  return (
    <div className="flex overflow-hidden flex-col items-start relative bg-[#050505] container mx-auto min-h-screen shading-effect">
      <Header />
      <div className=" w-full shading-effect-light">
        <HeroSection />
      </div>
      <VideoSection />
      <SkillsSection />
      <PricingSection />
      <CustomerStoriesSection />
      <WhyChooseUsSection />
      <FeaturesOverviewSection />
      <GetStartedSection />
      <FooterSection />
    </div>
  );
};
