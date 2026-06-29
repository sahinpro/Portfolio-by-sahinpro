import { CTAButton } from "@/components/common/CTAButton";
import { SocialLinksRow } from "@/components/public/SocialLinksRow";
import {
  heroCtaStagger,
  heroFadeStep,
  heroIntroStagger,
  heroSocialLinksGate,
  socialLinkFade,
} from "@/constants/scrollMotion";
import { useActiveResume } from "@/hooks/useActiveResume";
import { triggerResumeDownload } from "@/lib/resumeDownload";
import { motion } from "framer-motion";
import { DownloadIcon } from "lucide-react";
import { HeroDescription } from "./HeroDescription";
import { HeroSubtitle } from "./HeroSubtitle";
import { HeroTitle } from "./HeroTitle";

export const HeroContent = (): JSX.Element => {
  const { data: resume, loading: resumeLoading } = useActiveResume();
  const showResumeCta = resumeLoading || resume != null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={heroIntroStagger}
      className="flex flex-col items-center lg:items-start gap-7 w-full max-w-xl lg:max-w-2xl"
    >
      <motion.div
        variants={heroFadeStep}
        className="flex flex-col items-center lg:items-start gap-5 w-full"
      >
        <HeroTitle />
        <HeroSubtitle />
      </motion.div>

      <motion.div variants={heroFadeStep}>
        <HeroDescription />
      </motion.div>

      <motion.div variants={heroFadeStep}>
        <motion.div
          variants={heroCtaStagger}
          className="inline-flex items-center gap-3 flex-wrap justify-center lg:justify-start min-h-10"
        >
          <motion.div variants={heroFadeStep}>
            <CTAButton
              className="text-md font-medium"
              href="/projects"
              variant="primary"
            >
              View My Work
            </CTAButton>
          </motion.div>

          {showResumeCta ? (
            <motion.div variants={heroFadeStep}>
              <CTAButton
                className="text-md font-semibold gap-2"
                variant="secondary"
                showArrow={false}
                rightIcon={<DownloadIcon className="w-4 h-4" />}
                disabled={resumeLoading || !resume}
                onClick={() => {
                  if (resume) void triggerResumeDownload(resume);
                }}
              >
                Download resume
              </CTAButton>
            </motion.div>
          ) : null}
        </motion.div>
      </motion.div>

      <SocialLinksRow
        size="hero"
        variants={heroSocialLinksGate}
        itemVariants={socialLinkFade}
      />
    </motion.div>
  );
};
