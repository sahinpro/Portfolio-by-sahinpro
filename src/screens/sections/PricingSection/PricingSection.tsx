import { Share2Icon } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";

const featureCards = [
  {
    bgImage: "/bg-1.png",
    mainVisual: "/main-visual-1.png",
    title: "Quality Focused",
    description:
      "I deliver clean, well-tested code that follows best practices and industry standards for long-term maintainability.",
  },
  {
    bgImage: "/bg-2.png",
    mainVisual: "/main-visual-2.png",
    title: "Fast & Reliable",
    description:
      "Quick turnaround times without compromising quality. Responsive and communicative throughout the project.",
  },
  {
    bgImage: "/bg-3.png",
    mainVisual: "/main-visual-3.png",
    title: "Growth Oriented",
    description:
      "I don't just build websites—I create solutions that help your business grow and succeed online.",
  },
];

export const PricingSection = (): JSX.Element => {
  return (
    <section className="flex flex-col w-full items-center gap-12 px-[100px] py-[100px] relative">
      <img
        className="absolute top-[-376px] left-0 w-full h-[1136px] pointer-events-none"
        alt="Background decoration"
        src="/rectangle-34629478-1.svg"
      />

      <div className="flex flex-col w-full max-w-[1240px] items-center gap-5 relative z-10">
        <div className="inline-flex gap-2 px-3.5 py-2.5 rounded-[46px] overflow-hidden backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] items-center relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[46px] before:[background:linear-gradient(241deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          <Share2Icon className="w-4 h-4 text-white" />

          <span className="relative w-fit bg-[linear-gradient(179deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.6)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-transparent text-base text-center tracking-[0] leading-5 whitespace-nowrap">
            My Strengths
          </span>

          <img
            className="absolute top-0 left-[-25px] w-[183px] h-[88px] pointer-events-none"
            alt="Decorative element"
            src="/rectangle-29-4.svg"
          />
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <h2 className="w-full section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-5xl text-center tracking-[-1.00px] leading-[56.0px]">
            Why Choose Me
          </h2>

          <p className="w-full [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-xl text-center tracking-[-0.20px] leading-[32.0px]">
            Trusted by 100+ clients for delivering quality solutions, on-time delivery, and excellent support.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 w-full max-w-[1240px] relative z-10">
        {featureCards.map((card, index) => (
          <Card
            key={index}
            className="flex-1 h-[460px] bg-[#0d0d0d] rounded-[10.87px] overflow-hidden border-none relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10.87px] before:[background:linear-gradient(173deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.12)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
          >
            <CardContent className="p-0 relative h-full">
              <img
                className="absolute top-0 left-0 w-full h-full object-cover"
                alt="Background"
                src={card.bgImage}
              />

              <img
                className="relative w-full h-full object-cover"
                alt="Main visual"
                src={card.mainVisual}
              />

              <div className="absolute left-0 bottom-0 w-full h-[130px] px-6 py-[26px] flex flex-col gap-[11px]">
                <h3 className="[font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[24.0px]">
                  {card.title}
                </h3>

                <p className="[font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#999999] text-sm tracking-[-0.14px] leading-5">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
