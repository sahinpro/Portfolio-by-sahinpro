import { ArrowUpRightIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

export const GetStartedSection = (): JSX.Element => {
  return (
    <section className="flex flex-col w-full items-center gap-20 px-4 md:px-[100px] py-[100px] relative">
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

      <Card className="relative w-full max-w-[1240px] rounded-[20px] overflow-hidden border border-[#ffffff1a] [background:radial-gradient(50%_50%_at_59%_153%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%),linear-gradient(0deg,rgba(9,9,9,1)_0%,rgba(9,9,9,1)_100%)]">
        <img
          className="absolute top-0 left-[77px] w-[1158px] h-[404px] pointer-events-none"
          alt="Group"
          src="/group-24.png"
        />

        <CardContent className="flex flex-col items-center justify-center gap-8 px-8 md:px-20 py-[100px] relative">
          <div className="flex flex-col items-center gap-3 relative w-full">
            <h2 className="bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.9)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] text-transparent text-3xl md:text-5xl text-center tracking-[-1.00px] leading-tight md:leading-[56.0px] font-medium">
              Let's Work Together
            </h2>

            <p className="flex items-center justify-center max-w-[656px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-lg md:text-xl text-center tracking-[-0.20px] leading-[28px] md:leading-[32.0px]">
              Have an exciting project in mind? Let's discuss how I can help bring your vision to life. I'm ready to start your next project.
            </p>
          </div>

          <div className="inline-flex items-start gap-3 relative flex-wrap justify-center">
            <Button className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg overflow-hidden border border-[#ffffff1a] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] hover:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.3)_100%),linear-gradient(0deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.95)_100%)] text-[#161616] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-sm tracking-[0] leading-5">
              Get In Touch
            </Button>

            <Button
              variant="outline"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 relative rounded-lg border border-[#ffffff1a] shadow-[0px_1px_2px_#2525250d,inset_0px_-4px_14px_#00000040] [background:radial-gradient(50%_50%_at_50%_0%,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_100%),linear-gradient(0deg,rgba(31,31,31,1)_0%,rgba(31,31,31,1)_100%)] hover:[background:radial-gradient(50%_50%_at_50%_0%,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_100%),linear-gradient(0deg,rgba(41,41,41,1)_0%,rgba(41,41,41,1)_100%)]"
            >
              <span className="bg-[linear-gradient(58deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,1)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-transparent text-sm text-center tracking-[0] leading-5 whitespace-nowrap">
                Schedule Call
              </span>

              <ArrowUpRightIcon className="w-[18px] h-[18px] text-white" />

              <div className="absolute top-0 left-[calc(50.00%_-_48px)] w-[97px] h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_42%,rgba(255,255,255,0)_100%)]" />

              <div className="absolute top-0 left-[calc(50.00%_-_48px)] w-[97px] h-px blur-[2px] bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_42%,rgba(255,255,255,0)_100%)]" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
