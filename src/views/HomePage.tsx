"use client";

import Header from "@/components/Header";
import { LazySection } from "@/components/sections/LazySection";
import { HeroSection } from "@/screens/sections/HeroSection";
import { StatsSection } from "@/screens/sections/StatsSection";
import { Suspense, lazy } from "react";

const FeaturedProjectsSection = lazy(() =>
  import("@/screens/sections/FeaturedProjectsSection/FeaturedProjectsSection").then(
    (m) => ({ default: m.FeaturedProjectsSection }),
  ),
);
const SkillsSection = lazy(() =>
  import("@/screens/sections/SkillsSection").then((m) => ({
    default: m.SkillsSection,
  })),
);
const TechStackSection = lazy(() =>
  import("@/screens/sections/TechStackSection").then((m) => ({
    default: m.TechStackSection,
  })),
);
const CareerJourneySection = lazy(() =>
  import("@/screens/sections/CareerJourneySection").then((m) => ({
    default: m.CareerJourneySection,
  })),
);
const DevelopmentProcessSection = lazy(() =>
  import("@/screens/sections/DevelopmentProcessSection").then((m) => ({
    default: m.DevelopmentProcessSection,
  })),
);
const WhyChooseUsSection = lazy(() =>
  import("@/screens/sections/WhyChooseUsSection").then((m) => ({
    default: m.WhyChooseUsSection,
  })),
);
const FAQSection = lazy(() =>
  import("@/screens/sections/FAQSection").then((m) => ({
    default: m.FAQSection,
  })),
);
const GetStartedSection = lazy(() =>
  import("@/screens/sections/GetStartedSection").then((m) => ({
    default: m.GetStartedSection,
  })),
);
const FooterSection = lazy(() =>
  import("@/screens/sections/FooterSection").then((m) => ({
    default: m.FooterSection,
  })),
);

export const HomePage = (): JSX.Element => {
  return (
    <main id="main-content" className="flex flex-col items-start relative bg-[#050505] min-h-screen w-full overflow-x-hidden">
      <Header />
      <HeroSection />
      <StatsSection />
      <LazySection minHeight={480}>
        <Suspense fallback={null}>
          <FeaturedProjectsSection />
        </Suspense>
      </LazySection>
      <LazySection minHeight={600}>
        <Suspense fallback={null}>
          <SkillsSection />
        </Suspense>
      </LazySection>
      <LazySection minHeight={420}>
        <Suspense fallback={null}>
          <TechStackSection />
        </Suspense>
      </LazySection>
      <LazySection minHeight={500}>
        <Suspense fallback={null}>
          <CareerJourneySection />
        </Suspense>
      </LazySection>
      <LazySection minHeight={400}>
        <Suspense fallback={null}>
          <DevelopmentProcessSection />
        </Suspense>
      </LazySection>
      <LazySection minHeight={480}>
        <Suspense fallback={null}>
          <WhyChooseUsSection />
        </Suspense>
      </LazySection>
      <LazySection minHeight={400}>
        <Suspense fallback={null}>
          <FAQSection />
        </Suspense>
      </LazySection>
      <LazySection minHeight={320}>
        <Suspense fallback={null}>
          <GetStartedSection />
        </Suspense>
      </LazySection>
      <LazySection minHeight={280}>
        <Suspense fallback={null}>
          <FooterSection />
        </Suspense>
      </LazySection>
    </main>
  );
};
