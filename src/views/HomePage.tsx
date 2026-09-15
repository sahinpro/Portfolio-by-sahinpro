"use client";

import type { ProjectRow, TestimonialRow } from "@/admin/types/database";
import Header from "@/components/Header";
import { DeferredSection } from "@/components/layout/DeferredSection";
import { FeaturedProjectsSectionSkeleton } from "@/screens/sections/FeaturedProjectsSection/FeaturedProjectsSectionSkeleton";
import { HeroSection } from "@/screens/sections/HeroSection";
import { StatsSection } from "@/screens/sections/StatsSection";
import { Suspense, lazy } from "react";

const FeaturedProjectsSection = lazy(() =>
  import("@/screens/sections/FeaturedProjectsSection/FeaturedProjectsSection").then(
    (m) => ({ default: m.FeaturedProjectsSection }),
  ),
);
const TestimonialsSection = lazy(() =>
  import("@/screens/sections/TestimonialsSection").then((m) => ({
    default: m.TestimonialsSection,
  })),
);
const SkillsSection = lazy(() =>
  import(
    /* webpackPrefetch: true */
    "@/screens/sections/SkillsSection"
  ).then((m) => ({
    default: m.SkillsSection,
  })),
);
const TechStackSection = lazy(() =>
  import(
    /* webpackPrefetch: true */
    "@/screens/sections/TechStackSection"
  ).then((m) => ({
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

export const HomePage = ({
  initialProjects = [],
  initialTestimonials = [],
}: {
  initialProjects?: ProjectRow[];
  initialTestimonials?: TestimonialRow[];
}): JSX.Element => {
  return (
    <main
      id="main-content"
      className="flex flex-col items-start relative bg-[#050505] min-h-screen w-full overflow-x-clip"
    >
      <Header />
      <div className="flex min-h-dvh w-full flex-col">
        <HeroSection />
      </div>
      <StatsSection />
      <Suspense fallback={<FeaturedProjectsSectionSkeleton />}>
        <FeaturedProjectsSection initialProjects={initialProjects} />
      </Suspense>
      <Suspense fallback={<div className="w-full min-h-[420px]" aria-hidden />}>
        <TestimonialsSection initialTestimonials={initialTestimonials} />
      </Suspense>
      <Suspense fallback={<div className="w-full min-h-[600px]" aria-hidden />}>
        <SkillsSection />
      </Suspense>
      <Suspense fallback={<div className="w-full min-h-[420px]" aria-hidden />}>
        <TechStackSection />
      </Suspense>
      <DeferredSection fallback={<div className="w-full min-h-[500px]" aria-hidden />}>
        <Suspense fallback={<div className="w-full min-h-[500px]" aria-hidden />}>
          <CareerJourneySection />
        </Suspense>
      </DeferredSection>
      <DeferredSection fallback={<div className="w-full min-h-[400px]" aria-hidden />}>
        <Suspense fallback={<div className="w-full min-h-[400px]" aria-hidden />}>
          <DevelopmentProcessSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection fallback={<div className="w-full min-h-[480px]" aria-hidden />}>
        <Suspense fallback={<div className="w-full min-h-[480px]" aria-hidden />}>
          <WhyChooseUsSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection fallback={<div className="w-full min-h-[400px]" aria-hidden />}>
        <Suspense fallback={<div className="w-full min-h-[400px]" aria-hidden />}>
          <FAQSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection fallback={<div className="w-full min-h-[320px]" aria-hidden />}>
        <Suspense fallback={<div className="w-full min-h-[320px]" aria-hidden />}>
          <GetStartedSection />
        </Suspense>
      </DeferredSection>
      <DeferredSection fallback={<div className="w-full min-h-[280px]" aria-hidden />}>
        <Suspense fallback={<div className="w-full min-h-[280px]" aria-hidden />}>
          <FooterSection />
        </Suspense>
      </DeferredSection>
    </main>
  );
};
