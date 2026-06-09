import { CTAButton } from "@/components/common/CTAButton";
import { useActiveResume } from "@/hooks/useActiveResume";
import { triggerResumeDownload } from "@/lib/resumeDownload";
import { DownloadIcon } from "lucide-react";
import { HeroDescription } from "./HeroDescription";
import { HeroSubtitle } from "./HeroSubtitle";
import { HeroTitle } from "./HeroTitle";

export const HeroContent = (): JSX.Element => {
  const { data: resume } = useActiveResume({ deferMs: 4500 });

  return (
    <div className="flex flex-col items-center lg:items-start gap-7 w-full max-w-xl lg:max-w-2xl">
      <div className="flex flex-col items-center lg:items-start gap-5 w-full">
        <HeroTitle />
        <HeroSubtitle />
      </div>
      <HeroDescription />

      <div className="inline-flex items-center gap-3 flex-wrap justify-center lg:justify-start">
        <CTAButton
          className="text-md font-medium"
          href="/projects"
          variant="primary"
        >
          View My Work
        </CTAButton>

        {resume ? (
          <CTAButton
            className="text-md font-semibold gap-2"
            variant="secondary"
            showArrow={false}
            rightIcon={<DownloadIcon className="w-4 h-4" />}
            onClick={() => void triggerResumeDownload(resume)}
          >
            Download resume
          </CTAButton>
        ) : null}
      </div>
    </div>
  );
};
