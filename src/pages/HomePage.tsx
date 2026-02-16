import Header from "@/components/Header";
import { CustomerStoriesSection } from "@/screens/sections/CustomerStoriesSection";
import { DevelopmentProcessSection } from "@/screens/sections/DevelopmentProcessSection";
import { FooterSection } from "@/screens/sections/FooterSection";
import { GetStartedSection } from "@/screens/sections/GetStartedSection";
import { HeroSection } from "@/screens/sections/HeroSection";
import { SkillsSection } from "@/screens/sections/SkillsSection";
import { VideoSection } from "@/screens/sections/VideoSection";
import { WhyChooseUsSection } from "@/screens/sections/WhyChooseUsSection";

/**
 * Home page component - Main landing page
 */
export const HomePage = (): JSX.Element => {
  return (
    <div className="flex overflow-hidden flex-col items-start relative bg-[#050505]  min-h-screen">
      <Header /> 
      <HeroSection />
      <VideoSection />
      <SkillsSection />
      <DevelopmentProcessSection />
      <CustomerStoriesSection />
      <WhyChooseUsSection />
      <GetStartedSection />
      <FooterSection />
    </div>
  );
};
