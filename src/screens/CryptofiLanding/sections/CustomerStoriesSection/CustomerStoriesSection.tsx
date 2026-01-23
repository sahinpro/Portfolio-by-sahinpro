import { Share2Icon } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";

const stepsData = [
  {
    number: "01",
    title: "Discovery & Planning",
    description:
      "We discuss your requirements, goals, and vision. I create wireframes and plan the technical approach.",
    textureUrl: "/texture-3.png",
    maskUrl: "/main-visual---mask-1.png",
  },
  {
    number: "02",
    title: "Design & Development",
    description:
      "I design mockups and develop your website using latest technologies, ensuring best practices and performance.",
    textureUrl: "/texture-4.png",
    maskUrl: "/main-visual---mask-2.png",
  },
  {
    number: "03",
    title: "Testing & Delivery",
    description:
      "Thorough testing, optimization, and deployment. Ongoing support and maintenance for your peace of mind.",
    textureUrl: "/texture-5.png",
    maskUrl: "/main-visual---mask-3.png",
  },
];

export const CustomerStoriesSection = (): JSX.Element => {
  return (
    <section className="flex flex-col w-full items-center gap-12 px-[100px] py-[100px] relative">
      <img
        className="absolute top-[-310px] left-0 w-full max-w-[1372px] h-[1136px] pointer-events-none"
        alt="Background decoration"
        src="/rectangle-34629478-2.svg"
      />

      <div className="flex flex-col w-full max-w-[1240px] items-center gap-5 relative z-10">
        <div className="inline-flex gap-2 px-3.5 py-2.5 rounded-[46px] overflow-hidden backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] items-center relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[46px] before:[background:linear-gradient(241deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          <img
            className="absolute top-0 left-[-25px] w-[183px] h-[88px]"
            alt="Badge decoration"
            src="/rectangle-29-3.svg"
          />

          <Share2Icon className="relative w-4 h-4 text-white" />

          <span className="relative w-fit bg-[linear-gradient(179deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.6)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-base text-center tracking-[0] leading-5 whitespace-nowrap">
            My Process
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 px-[229px] py-0 w-full">
          <h2 className="flex items-center justify-center self-stretch bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.9)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-5xl text-center tracking-[-1.00px] leading-[56.0px]">
            My Development Process
          </h2>

          <p className="flex items-center justify-center w-fit [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-xl text-center tracking-[-0.20px] leading-[32.0px] whitespace-nowrap">
            A streamlined approach to deliver quality projects on time.
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-[1240px] items-start gap-5 relative z-10">
        <div className="flex items-center gap-5 w-full">
          {stepsData.map((step, index) => (
            <Card
              key={`step-${index}`}
              className="flex flex-col w-[400px] h-[460px] items-start relative bg-[#0d0d0d] rounded-[10.87px] overflow-hidden border-[none] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10.87px] before:[background:linear-gradient(173deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.12)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
            >
              <div
                className="absolute top-0 left-0 w-[400px] h-[460px] bg-[100%_100%]"
                style={{ backgroundImage: `url(${step.textureUrl})` }}
              />

              <img
                className="relative w-[400px] h-[460px]"
                alt={`${step.title} visual`}
                src={step.maskUrl}
              />

              <CardContent className="absolute left-0 bottom-0 w-[400px] flex flex-col items-start gap-2 p-6">
                <h3 className="flex items-center justify-center w-fit [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[24.0px] whitespace-nowrap">
                  {step.number}. {step.title}
                </h3>

                <p className="flex items-center justify-center w-full max-w-[352px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#999999] text-sm tracking-[-0.14px] leading-5">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
