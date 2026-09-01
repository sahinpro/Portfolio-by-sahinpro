"use client";

import Header from "@/components/Header";
import { FeaturedProjectsSectionSkeleton } from "@/screens/sections/FeaturedProjectsSection/FeaturedProjectsSectionSkeleton";
import { HeroSection } from "@/screens/sections/HeroSection";
import { StatsSection } from "@/screens/sections/StatsSection";
import { deferAfterPaint } from "@/lib/deferUntilIdle";
import { Suspense, lazy, useEffect, useState } from "react";

const FeaturedProjectsSection = lazy(() =>
  import("@/screens/sections/FeaturedProjectsSection/FeaturedProjectsSection").then(
    (m) => ({ default: m.FeaturedProjectsSection }),
  ),
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
  import(
    /* webpackPrefetch: true */
    "@/screens/sections/CareerJourneySection"
  ).then((m) => ({
    default: m.CareerJourneySection,
  })),
);
const DevelopmentProcessSection = lazy(() =>
  import(
    /* webpackPrefetch: true */
    "@/screens/sections/DevelopmentProcessSection"
  ).then((m) => ({
    default: m.DevelopmentProcessSection,
  })),
);
const WhyChooseUsSection = lazy(() =>
  import(
    /* webpackPrefetch: true */
    "@/screens/sections/WhyChooseUsSection"
  ).then((m) => ({
    default: m.WhyChooseUsSection,
  })),
);
const FAQSection = lazy(() =>
  import(
    /* webpackPrefetch: true */
    "@/screens/sections/FAQSection"
  ).then((m) => ({
    default: m.FAQSection,
  })),
);
const GetStartedSection = lazy(() =>
  import(
    /* webpackPrefetch: true */
    "@/screens/sections/GetStartedSection"
  ).then((m) => ({
    default: m.GetStartedSection,
  })),
);
const FooterSection = lazy(() =>
  import(
    /* webpackPrefetch: true */
    "@/screens/sections/FooterSection"
  ).then((m) => ({
    default: m.FooterSection,
  })),
);

function useAfterPaint(timeoutMs = 400): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => deferAfterPaint(() => setReady(true), timeoutMs), [timeoutMs]);

  return ready;
}

export const HomePage = (): JSX.Element => {
  const belowFoldReady = useAfterPaint();

  return (
    <main
      id="main-content"
      className="flex flex-col items-start relative bg-[#050505] min-h-screen w-full overflow-x-hidden"
    >
      <Header />
      <div className="flex min-h-dvh w-full flex-col">
        <HeroSection />
      </div>
      <StatsSection />
      <Suspense fallback={<FeaturedProjectsSectionSkeleton />}>
        <FeaturedProjectsSection />
      </Suspense>
      {belowFoldReady ? (
        <>
          <Suspense fallback={<div className="w-full min-h-[600px]" aria-hidden />}>
            <SkillsSection />
          </Suspense>
          <Suspense fallback={<div className="w-full min-h-[420px]" aria-hidden />}>
            <TechStackSection />
          </Suspense>
          <Suspense fallback={<div className="w-full min-h-[500px]" aria-hidden />}>
            <CareerJourneySection />
          </Suspense>
          <Suspense fallback={<div className="w-full min-h-[400px]" aria-hidden />}>
            <DevelopmentProcessSection />
          </Suspense>
          <Suspense fallback={<div className="w-full min-h-[480px]" aria-hidden />}>
            <WhyChooseUsSection />
          </Suspense>
          <Suspense fallback={<div className="w-full min-h-[400px]" aria-hidden />}>
            <FAQSection />
          </Suspense>
          <Suspense fallback={<div className="w-full min-h-[320px]" aria-hidden />}>
            <GetStartedSection />
          </Suspense>
          <Suspense fallback={<div className="w-full min-h-[280px]" aria-hidden />}>
            <FooterSection />
          </Suspense>
        </>
      ) : null}
    </main>
  );
};
