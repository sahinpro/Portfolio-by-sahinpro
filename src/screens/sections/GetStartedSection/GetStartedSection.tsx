import { ArrowUpRightIcon } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { CTAButton } from "../../../components/CTAButton";

export const GetStartedSection = (): JSX.Element => {
  return (
    <section id="contact" className="flex flex-col w-full items-center gap-20 px-4 md:px-[100px] py-[100px] relative shading-effect-light">
      <img
        className="absolute top-[-984px] left-0 w-full h-[1585px] pointer-events-none"
        alt="Frame"
        src="/frame-2147228384.svg"
      />

      <img
        className="top-[-389px] w-full absolute left-0 h-[1136px] pointer-events-none"
        alt="Rectangle"
        src="/rectangle-34629478-8.svg"
      />

      <Card className="relative w-full max-w-[1240px] rounded-[20px] overflow-hidden border border-[#ffffff1a] [background:radial-gradient(50%_50%_at_59%_153%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%),linear-gradient(0deg,rgba(9,9,9,1)_0%,rgba(9,9,9,1)_100%)] glass-card">
        <img
          className="absolute top-0 left-[77px] w-[1158px] h-[404px] pointer-events-none"
          alt="Group"
          src="/group-24.png"
        />

        <CardContent className="flex flex-col items-center justify-center gap-8 px-8 md:px-20 py-[100px] relative">
          <div className="flex flex-col items-center gap-3 relative w-full">
            <h2 className="section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] text-3xl md:text-5xl text-center tracking-[-1.00px] leading-tight md:leading-[56.0px] font-medium">
              Let's Work Together
            </h2>

            <p className="flex items-center justify-center max-w-[656px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-lg md:text-xl text-center tracking-[-0.20px] leading-[28px] md:leading-[32.0px]">
              Have an exciting project in mind? Let's discuss how I can help bring your vision to life. I'm ready to start your next project.
            </p>
          </div>

          <div className="inline-flex items-start gap-3 relative flex-wrap justify-center">
            <CTAButton href="/contact" variant="primary">
              Get In Touch
            </CTAButton>

            <CTAButton href="/contact" variant="secondary" showArrow={true}>
              Schedule Call
            </CTAButton>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
