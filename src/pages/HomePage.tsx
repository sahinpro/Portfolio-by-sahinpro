import Header from "@/components/Header";
import { PublicSeo } from "@/components/public/PublicSeo";
import { LazySection } from "@/components/section/LazySection";
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
    <main id="main-content" className="flex flex-col items-start relative bg-[#050505] min-h-screen w-full overflow-x-hidden">
      <PublicSeo />
      <Header />
      <HeroSection />
      <StatsSection />
      <LazySection minHeight={480}>
        <FeaturedProjectsSection />
      </LazySection>
      <LazySection minHeight={600}>
        <SkillsSection />
      </LazySection>
      <LazySection minHeight={500}>
        <CareerJourneySection />
      </LazySection>
      <LazySection minHeight={400}>
        <DevelopmentProcessSection />
      </LazySection>
      <LazySection minHeight={520}>
        <CustomerStoriesSection />
      </LazySection>
      <LazySection minHeight={480}>
        <WhyChooseUsSection />
      </LazySection>
      <LazySection minHeight={400}>
        <FAQSection />
      </LazySection>
      <LazySection minHeight={320}>
        <GetStartedSection />
      </LazySection>
      <LazySection minHeight={280}>
        <FooterSection />
      </LazySection>
    </main>
  );
};
