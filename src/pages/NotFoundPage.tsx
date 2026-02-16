import { CTAButton } from "@/components/CTAButton";
import Header from "@/components/Header";
import FuzzyText from "@/components/ui/FuzzyText";
import { FooterSection } from "@/screens/sections/FooterSection";
import { gsap } from "gsap";
import { ArrowLeft, Home } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 404 Not Found page component - Professional error page with FuzzyText animation
 */
export const NotFoundPage = (): JSX.Element => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Container animation with scroll trigger
    if (containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Title animation with scroll trigger
    if (titleRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                titleRef.current,
                { opacity: 0, scale: 0.9, y: 20 },
                {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  duration: 0.8,
                  delay: 0.1,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(titleRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Message animation with scroll trigger
    if (messageRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                messageRef.current,
                { opacity: 0, y: 20 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.7,
                  delay: 0.3,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(messageRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Buttons animation with scroll trigger
    if (buttonsRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                buttonsRef.current,
                { opacity: 0, y: 20 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.7,
                  delay: 0.5,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(buttonsRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen">
      <Header />
      <div className="flex items-center justify-center w-full min-h-screen px-4 sm:px-6 lg:px-8 py-32">
        <div
          ref={containerRef}
          className="text-center space-y-8 max-w-2xl w-full opacity-0"
        >
          {/* Fuzzy 404 Text */}
          <div ref={titleRef} className="mb-8 opacity-0">
            <FuzzyText
              baseIntensity={0.2}
              hoverIntensity={0.5}
              enableHover
              className="text-8xl sm:text-9xl md:text-[12rem] font-bold text-white leading-none"
            >
              404
            </FuzzyText>
          </div>

          {/* Error Message */}
          <div ref={messageRef} className="space-y-4 opacity-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Page Not Found
            </h1>
            <p className="text-lg sm:text-xl text-text-normal leading-relaxed max-w-xl mx-auto">
              The page you're looking for doesn't exist or has been moved to a
              different location.
            </p>
          </div>

          {/* Action Buttons */}
          <div
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 opacity-0"
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
              onClick={handleGoBack}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </CTAButton>
          </div>
        </div>
      </div>
      <FooterSection />
    </div>
  );
};
