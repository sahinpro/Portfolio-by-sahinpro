import { CheckIcon } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

const pricingPlans = [
  {
    name: "Starter Plan",
    description:
      "Perfect for new traders who want reliable tools to track the market.",
    price: "$10",
    buttonText: "Start with Starter",
    features: [
      "Real-time charts & price tracking",
      "Basic portfolio dashboard",
      "Wallet connection",
      "Price alerts",
      "Standard analytics",
      "Email support",
    ],
    isRecommended: false,
    gradientClass:
      "before:[background:linear-gradient(25deg,rgba(255,255,255,0)_34%,rgba(255,255,255,0.4)_100%)]",
    bgClass: "bg-[#0f0f0f]",
    textureClass: "texture-6",
  },
  {
    name: "Pro Plan",
    description:
      "For active traders who want deeper insights, faster data, and smarter trading tools.",
    price: "$20",
    buttonText: "Start with Pro",
    features: [
      "Advanced market analytics",
      "Smart AI alerts & signals",
      "Multiple wallet support",
      "Trade execution insights",
      "Unlimited watchlists",
      "Priority support",
    ],
    isRecommended: true,
    gradientClass:
      "before:[background:linear-gradient(351deg,rgba(255,255,255,0)_34%,rgba(255,255,255,0.4)_100%)]",
    bgClass: "bg-[#0d0d0d]",
    textureClass: "texture-mask-3",
  },
  {
    name: "Elite Plan",
    description:
      "For serious traders who want the full Cryptofi experience and pro-level analysis.",
    price: "$49",
    buttonText: "Start with Elite",
    features: [
      "AI-powered trading insights",
      "On-chain analytics & whale tracking",
      "Multi-exchange dashboard",
      "Advanced risk analysis",
      "Early access to new features",
      "Direct support line",
    ],
    isRecommended: false,
    gradientClass:
      "before:[background:linear-gradient(334deg,rgba(255,255,255,0)_34%,rgba(255,255,255,0.4)_100%)]",
    bgClass: "bg-[#0d0d0d]",
    textureClass: "texture-7",
  },
];

export const FeaturesOverviewSection = (): JSX.Element => {
  return (
    <section className="flex flex-col w-full max-w-[1440px] items-center gap-12 p-[100px] relative">
      <img
        className="top-[-130px] w-full max-w-[1440px] absolute left-0 h-[1136px]"
        alt="Rectangle"
        src="/rectangle-34629478-3.svg"
      />

      <div className="flex-col w-full max-w-[1240px] gap-5 flex items-center relative z-10">
        <Badge
          variant="outline"
          className="inline-flex h-[39px] items-center gap-2 px-3.5 py-0 relative rounded-[46px] overflow-hidden border-[none] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] bg-[linear-gradient(182deg,rgba(0,0,0,0.05)_0%,rgba(255,255,255,0.1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[46px] before:[background:linear-gradient(241deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
        >
          <img
            className="absolute top-[-15px] left-[calc(50.00%_-_104px)] w-[209px] h-[108px]"
            alt="Rectangle"
            src="/rectangle-30-1.svg"
          />
          <img
            className="absolute top-[-31px] -left-0.5 w-[122px] h-[119px]"
            alt="Rectangle"
            src="/rectangle-29.svg"
          />
          <img className="relative w-4 h-4" alt="Share" src="/share.svg" />
          <span className="relative w-fit bg-[linear-gradient(179deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.6)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-transparent text-base text-center tracking-[0] leading-5 whitespace-nowrap">
            Services
          </span>
        </Badge>

        <div className="flex-col gap-4 self-stretch w-full flex items-center relative">
          <h2 className="relative flex items-center justify-center self-stretch mt-[-1.00px] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.9)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-transparent text-5xl text-center tracking-[-1.00px] leading-[56.0px]">
            Service Plans
          </h2>
          <p className="relative flex items-center justify-center w-fit [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-xl text-center tracking-[-0.20px] leading-[32.0px] whitespace-nowrap">
            Different service packages to fit your project needs and budget.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-12 relative self-stretch w-full z-10">
        <div className="inline-flex items-center justify-center p-1.5 relative rounded-[100px] border border-solid border-[#ffffff1a] bg-[linear-gradient(0deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]">
          <Button
            variant="ghost"
            className="inline-flex items-center justify-center gap-3 px-5 py-[9px] relative self-stretch rounded-[100px] overflow-hidden backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] hover:bg-transparent"
          >
            <span className="flex justify-center w-fit [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-base tracking-[0] leading-5 whitespace-nowrap items-center relative">
              Monthly
            </span>
          </Button>

          <Button
            variant="ghost"
            className="inline-flex items-center justify-center gap-2.5 pl-5 pr-2 py-2 relative self-stretch rounded-[100px] overflow-hidden border-[none] shadow-[inset_0px_0px_25px_1px_#ffffff1a] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_100%),linear-gradient(90deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[100px] before:[background:linear-gradient(174deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none hover:bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_100%),linear-gradient(90deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)]"
          >
            <span className="flex justify-center w-fit [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-base tracking-[0] leading-5 whitespace-nowrap items-center relative">
              Billed yearly
            </span>
            <Badge
              variant="secondary"
              className="inline-flex items-center justify-center gap-2.5 px-2.5 py-[5px] relative rounded-[100px] overflow-hidden border-[none] shadow-[inset_0px_0px_25px_1px_#ffffff1a] backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_100%),linear-gradient(90deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[100px] before:[background:linear-gradient(174deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
            >
              <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-white text-xs tracking-[0] leading-[16.0px] whitespace-nowrap">
                Save 25%
              </span>
            </Badge>
          </Button>
        </div>

        <div className="flex items-start justify-center gap-5 relative self-stretch w-full">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`flex flex-col h-[574px] items-center justify-center gap-6 p-8 relative flex-1 ${plan.bgClass} rounded-[10.87px] overflow-hidden border-[none] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10.87px] ${plan.gradientClass} before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none ${index === 0 ? "w-[400px]" : ""}`}
            >
              <div className="top-0 w-[400px] h-[574px] overflow-hidden absolute left-0">
                {index === 0 && (
                  <>
                    <div className="absolute top-[-21px] left-[268px] w-[255px] h-[63px] blur-[100px] opacity-[0.67]">
                      <div className="absolute top-1 left-px w-[231px] h-[54px] bg-white rounded-[115.47px/27.08px] rotate-[177.86deg] opacity-20" />
                      <div className="absolute top-[5px] left-10 w-[215px] h-[46px] bg-white rounded-[107.58px/23.15px] rotate-[177.86deg] opacity-20" />
                    </div>
                    <img
                      className="absolute top-0 left-1 w-[396px] h-[557px]"
                      alt="Texture"
                      src="/texture-6.png"
                    />
                  </>
                )}
                {index === 1 && (
                  <>
                    <img
                      className="absolute top-[-723px] left-[-338px] w-[991px] h-[1080px]"
                      alt="Rectangle"
                      src="/rectangle-34629477-2.svg"
                    />
                    <img
                      className="absolute top-[-726px] left-[-255px] w-[829px] h-[1027px]"
                      alt="Rectangle"
                      src="/rectangle-34629478-6.svg"
                    />
                    <img
                      className="absolute top-[-709px] left-[-151px] w-[684px] h-[929px]"
                      alt="Rectangle"
                      src="/rectangle-34629479-3.svg"
                    />
                    <div className="absolute top-px left-[9px] w-[353px] h-[33px] bg-white blur-[150px]" />
                    <img
                      className="left-px w-[400px] h-[557px] absolute top-0"
                      alt="Texture mask"
                      src="/texture---mask-3.png"
                    />
                  </>
                )}
                {index === 2 && (
                  <>
                    <div className="absolute top-[-33px] left-[-39px] w-[436px] h-[141px] blur-[300px]">
                      <div className="absolute top-[18px] left-[77px] w-[357px] h-[118px] bg-white rounded-[178.69px/59.21px] rotate-[178.62deg] blur-[200px] opacity-20" />
                      <div className="absolute top-[5px] left-px w-[395px] h-[99px] bg-white rounded-[197.52px/49.27px] rotate-[178.62deg] blur-[200px] opacity-20" />
                    </div>
                    <img
                      className="absolute top-0 left-1 w-[396px] h-[557px]"
                      alt="Texture"
                      src="/texture-7.png"
                    />
                  </>
                )}
              </div>

              <CardContent className="flex flex-col items-start justify-center gap-[25px] relative self-stretch w-full p-0 z-10">
                <div className="flex flex-col items-start gap-6 relative self-stretch w-full">
                  <div className="flex items-center justify-between relative self-stretch w-full">
                    <h3 className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-2xl text-center tracking-[0] leading-[28.0px] whitespace-nowrap">
                      {plan.name}
                    </h3>
                    {plan.isRecommended && (
                      <Badge
                        variant="secondary"
                        className="inline-flex h-7 items-center justify-center gap-2.5 px-3 py-[9px] relative rounded-[15px] border border-solid border-[#ffffff1f] shadow-[0px_4px_18px_#ffffff26,inset_0px_-2.5px_20.5px_#d8dbfe1a] backdrop-blur-[3px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(3px)_brightness(100%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_100%),linear-gradient(0deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.12)_100%)]"
                      >
                        <span className="relative w-fit mt-[-6.00px] mb-[-4.00px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#ebebeb] text-sm tracking-[0] leading-5 whitespace-nowrap">
                          Recommended
                        </span>
                      </Badge>
                    )}
                  </div>
                  <p className="relative flex items-center justify-center w-[333.33px] opacity-40 [font-family:'Inter_Display-Regular',Helvetica] font-normal text-white text-lg tracking-[-1.00px] leading-[24.0px]">
                    {plan.description}
                  </p>
                </div>
              </CardContent>

              <div className="flex flex-col items-start gap-6 relative self-stretch w-full z-10">
                <div className="inline-flex items-center gap-1 relative">
                  <span className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-[44px] tracking-[-1.00px] leading-[48.0px] whitespace-nowrap">
                    {plan.price}
                  </span>
                  <span className="absolute top-[19px] left-[78px] h-6 flex items-end justify-center opacity-60 [font-family:'Inter_Display-Regular',Helvetica] font-normal text-white text-lg tracking-[-1.00px] leading-[24.0px] whitespace-nowrap">
                    per month
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className={`flex h-11 items-center justify-center gap-2.5 px-3.5 py-0 relative self-stretch w-full rounded-lg overflow-hidden border border-solid border-[#ffffff1a] backdrop-blur-[4.5px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(4.5px)_brightness(100%)] z-10 ${
                  plan.isRecommended
                    ? "h-12 gap-2.5 px-5 py-[15px] bg-[#ffffff08] shadow-[0px_4px_105px_#00000040] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-lg before:[background:linear-gradient(180deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
                    : "bg-[linear-gradient(0deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]"
                }`}
              >
                <span className="relative flex items-center justify-center w-fit [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-base text-center tracking-[0] leading-5 whitespace-nowrap">
                  {plan.buttonText}
                </span>
                {plan.isRecommended && (
                  <>
                    <div className="absolute top-[39px] left-px w-[335px] h-[9px] bg-[#ababab] rounded-[167.5px/4.5px] blur-[25px] opacity-80" />
                    <div className="absolute top-[45px] left-[27px] w-[283px] h-[3px] bg-[#fcf6eb] rounded-[141.5px/1.5px] blur-[22px]" />
                  </>
                )}
              </Button>

              <div className="flex flex-col items-start gap-6 relative self-stretch w-full z-10">
                <div className="gap-3 px-0.5 py-0 flex items-center relative self-stretch w-full">
                  <span className="relative w-fit mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-[#ebebeb] text-base tracking-[0] leading-5 whitespace-nowrap">
                    Features
                  </span>
                </div>

                <div className="flex-col items-start gap-[14.99px] w-full rounded-[9.37px] overflow-hidden opacity-80 flex relative self-stretch">
                  {plan.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center gap-[14.99px] relative self-stretch w-full"
                    >
                      <CheckIcon className="relative w-5 h-5 text-white" />
                      <span className="relative flex items-center justify-center flex-1 mt-[-0.94px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-[#b1b1b1] text-sm tracking-[-0.14px] leading-5">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
