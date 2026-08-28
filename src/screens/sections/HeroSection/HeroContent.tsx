import { CTAButton } from "@/components/common/CTAButton";
import { SocialLinksRow } from "@/components/public/SocialLinksRow";
import {
  heroCopyColumn,
  heroCtaStagger,
  heroFadeStep,
  heroItem,
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
      variants={heroCopyColumn}
      className="flex flex-col items-center lg:items-start gap-7 w-full max-w-xl lg:max-w-2xl"
    >
      <motion.div variants={heroItem} className="w-full">
        <HeroTitle />
      </motion.div>

      <motion.div variants={heroItem} className="w-full">
        <HeroSubtitle />
      </motion.div>

      <motion.div variants={heroItem}>
        <HeroDescription />
      </motion.div>

      <motion.div variants={heroItem}>
        <motion.div
          variants={heroCtaStagger}
          className="inline-flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-nowrap justify-center lg:justify-start min-h-10"
        >
          <motion.div variants={heroFadeStep}>
            <CTAButton
              className="px-2.5 sm:px-3.5 text-sm lg:text-md font-medium"
              href="/projects"
              variant="primary"
            >
              View My Work
            </CTAButton>
          </motion.div>

          {showResumeCta ? (
            <motion.div variants={heroFadeStep}>
              <CTAButton
                className="px-2.5 sm:px-4 text-sm lg:text-md font-semibold gap-1.5 sm:gap-2 [&_svg]:size-3.5 sm:[&_svg]:size-4"
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

      <SocialLinksRow size="hero" variants={heroItem} />
    </motion.div>
  );
};
