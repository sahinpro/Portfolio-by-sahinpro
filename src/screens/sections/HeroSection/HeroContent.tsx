import { CTAButton } from "@/components/CTAButton";
import { HeroDescription } from "./HeroDescription";
import { HeroSubtitle } from "./HeroSubtitle";
import { HeroTitle } from "./HeroTitle";
import { ProfileImage } from "./ProfileImage";

export const HeroContent = () => (
  <div className="flex flex-col pt-10 items-center gap-4 max-w-3.5xl w-full px-4">
    <ProfileImage />
    
    <div className="flex flex-col items-center gap-2 w-full">
      <HeroTitle />
      <HeroSubtitle />
    </div>
    <HeroDescription />

     <div className="inline-flex items-start gap-3 relative flex-wrap justify-center">
            <CTAButton className="text-md font-medium" href="/contact" variant="primary">
              View My Work
            </CTAButton>

            <CTAButton className="text-md font-medium" href="/contact" variant="secondary" showArrow={true}>
              Schedule Call
            </CTAButton>
          </div>
  </div>
);
