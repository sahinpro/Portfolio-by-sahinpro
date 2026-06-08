import { CTAButton } from "@/components/CTAButton";
import { PublicImage } from "@/components/ui/PublicImage";
import { Card, CardContent } from "@/components/ui/card";
import { navItems } from "@/constants/navigation";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { PROFILE_DESK } from "@/lib/seoImages";
import { motion } from "framer-motion";

const contactHref =
  navItems.find((item) => item.name === "Contact")?.href ?? "/contact";

export const GetStartedSection = (): JSX.Element => {
  return (
    <section className="flex flex-col container items-center gap-20 px-4 py-10 lg:py-14 relative mx-auto">
      <motion.div
        className="relative z-10 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <Card className="relative w-full rounded-[20px] overflow-hidden border border-[#ffffff1a] glass-card">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <PublicImage
              src={PROFILE_DESK.path}
              alt={PROFILE_DESK.alt}
              fill
              sizes="100vw"
              className="object-cover object-center opacity-40"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/85 to-[#090909]/60"
              aria-hidden
            />
          </div>

          <CardContent className="flex flex-col items-center justify-center gap-8 px-8 md:px-20 py-[100px] relative">
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center gap-3 relative w-full"
            >
              <h2 className="section-heading [font-family:'Inter_Display-Medium',Helvetica] text-3xl md:text-5xl text-center tracking-[-1.00px] leading-tight md:leading-[56.0px] font-medium">
                Let's Work Together
              </h2>

              <p className="flex items-center justify-center max-w-[656px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-lg md:text-xl text-center tracking-[-0.20px] leading-[28px] md:leading-[32.0px]">
                Have an exciting project in mind? Let's discuss how I can help
                bring your vision to life. I'm ready to start your next project.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="inline-flex items-start gap-3 relative flex-wrap justify-center"
            >
              <CTAButton href="/projects" variant="primary">
                View My Work
              </CTAButton>

              <CTAButton
                href={contactHref}
                variant="secondary"
                showArrow={true}
              >
                Get In Touch
              </CTAButton>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      <div
        className="absolute bottom-0 left-0 w-full h-full pointer-events-none bg-radial-gradient(50% 50% at 50% 0%, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, rgba(9, 9, 9, 1) 0%, rgba(9, 9, 9, 1) 100%)"
        aria-hidden
      />
    </section>
  );
};
