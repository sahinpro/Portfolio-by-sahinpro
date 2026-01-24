import Header from "@/components/Header";
import { CustomerStoriesSection } from "@/screens/sections/CustomerStoriesSection/CustomerStoriesSection";
import { FeaturesOverviewSection } from "@/screens/sections/FeaturesOverviewSection/FeaturesOverviewSection";
import { FooterSection } from "@/screens/sections/FooterSection/FooterSection";
import { GetStartedSection } from "@/screens/sections/GetStartedSection";
import { HeroSection } from "@/screens/sections/HeroSection/HeroSection";
import { PricingSection } from "@/screens/sections/PricingSection/PricingSection";
import { SkillsSection } from "@/screens/sections/SkillsSection";
import { WhyChooseUsSection } from "@/screens/sections/WhyChooseUsSection";

/**
 * Home page component - Main landing page
 */
export const HomePage = (): JSX.Element => {
  return (
    <div className="flex overflow-hidden flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />
      <div className="pt-4 w-full shading-effect-light">
        <HeroSection />
      </div>
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
