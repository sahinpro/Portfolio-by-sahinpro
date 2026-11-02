"use client";

import { CTAButton } from "@/components/common/CTAButton";
import Header from "@/components/Header";
import FuzzyText from "@/components/ui/FuzzyText";
import {
  fadeInUp,
  pageHeroItem,
  pageHeroReveal,
} from "@/constants/scrollMotion";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";

export const NotFoundPage = (): JSX.Element => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen">
      <Header />
      <div className="flex items-center justify-center w-full min-h-screen px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={pageHeroReveal}
          className="text-center space-y-8 max-w-2xl w-full"
        >
          <motion.div variants={pageHeroItem} className="mb-8">
            <FuzzyText
              baseIntensity={0.2}
              hoverIntensity={0.5}
              enableHover
              className="text-8xl sm:text-9xl md:text-[12rem] font-bold text-white leading-none"
            >
              404
            </FuzzyText>
          </motion.div>

          <motion.div variants={pageHeroItem} className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Page Not Found
            </h1>
            <p className="text-lg sm:text-xl text-text-normal leading-relaxed max-w-xl mx-auto">
              The page you're looking for doesn't exist or has been moved to a
              different location.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <CTAButton
              onClick={handleGoHome}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return Home
            </CTAButton>
            <CTAButton
              className="text-md font-medium"
              onClick={handleGoBack}
              variant="secondary"
              showArrow={true}
            >
              Go Back
            </CTAButton>
          </motion.div>
        </motion.div>
      </div>
      <FooterSection />
    </div>
  );
};
