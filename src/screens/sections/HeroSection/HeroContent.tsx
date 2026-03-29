import { CTAButton } from "@/components/CTAButton";
import { useActiveResume } from "@/hooks/useActiveResume";
import { triggerResumeDownload } from "@/lib/resumeDownload";
import { HeroDescription } from "./HeroDescription";
import { HeroSubtitle } from "./HeroSubtitle";
import { HeroTitle } from "./HeroTitle";
import { ProfileImage } from "./ProfileImage";

export const HeroContent = (): JSX.Element => {
  const { data: resume, loading } = useActiveResume();

  return (
    <div className="flex flex-col pt-10 items-center gap-4 max-w-3.5xl w-full px-4">
      <ProfileImage />

      <div className="flex flex-col items-center gap-2 w-full">
        <HeroTitle />
        <HeroSubtitle />
      </div>
      <HeroDescription />

      <div className="inline-flex items-start gap-3 relative flex-wrap justify-center">
        <CTAButton
          className="text-md font-medium "
          href="/projects"
          variant="primary"
        >
          View My Work
        </CTAButton>

        {!loading && resume ? (
          <CTAButton
            className="text-md font-semibold "
            variant="secondary"
            showArrow={false}
            onClick={() => void triggerResumeDownload(resume)}
          >
            Download resume
          </CTAButton>
        ) : null}
      </div>
    </div>
  );
};
