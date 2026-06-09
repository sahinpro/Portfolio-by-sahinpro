"use client";

import { CTAButton } from "@/components/common/CTAButton";
import Header from "@/components/Header";
import FuzzyText from "@/components/ui/FuzzyText";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion, useInView } from "framer-motion";
import { Home } from "lucide-react";
import { useRef } from "react";
import { useRouter } from "next/navigation";

export const NotFoundPage = (): JSX.Element => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const containerInView = useInView(containerRef, {
    once: true,
    margin: "-10%",
  });
  const titleInView = useInView(titleRef, { once: true, margin: "-10%" });
  const messageInView = useInView(messageRef, { once: true, margin: "-10%" });
  const buttonsInView = useInView(buttonsRef, { once: true, margin: "-10%" });

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.37, 0.04, 0.29, 1.01] },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.1, ease: [0.37, 0.04, 0.29, 1.01] },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: 0.3, ease: [0.37, 0.04, 0.29, 1.01] },
    },
  };

  const buttonsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: 0.5, ease: [0.37, 0.04, 0.29, 1.01] },
    },
  };

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
          ref={containerRef}
          initial="hidden"
          animate={containerInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center space-y-8 max-w-2xl w-full"
        >
          {/* Fuzzy 404 Text */}
          <motion.div
            ref={titleRef}
            initial="hidden"
            animate={titleInView ? "visible" : "hidden"}
            variants={titleVariants}
            className="mb-8"
          >
            <FuzzyText
              baseIntensity={0.2}
              hoverIntensity={0.5}
              enableHover
              className="text-8xl sm:text-9xl md:text-[12rem] font-bold text-white leading-none"
            >
              404
            </FuzzyText>
          </motion.div>

          {/* Error Message */}
          <motion.div
            ref={messageRef}
            initial="hidden"
            animate={messageInView ? "visible" : "hidden"}
            variants={messageVariants}
            className="space-y-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Page Not Found
            </h1>
            <p className="text-lg sm:text-xl text-text-normal leading-relaxed max-w-xl mx-auto">
              The page you're looking for doesn't exist or has been moved to a
              different location.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            ref={buttonsRef}
            initial="hidden"
            animate={buttonsInView ? "visible" : "hidden"}
            variants={buttonsVariants}
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
