import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";

const mainFeatures = [
  {
    width: "w-[715px]",
    title: "Frontend Development",
    description:
      "Expert in crafting beautiful, responsive user interfaces with modern technologies. Specialized in React, Next.js, Tailwind CSS, and creating amazing user experiences.",
    textureImage: "/texture---noise.png",
    mainImage: "/main-visual.png",
  },
  {
    width: "w-[505px]",
    title: "Full Stack Solutions",
    description:
      "End-to-end web application development from database design to frontend implementation. Building scalable solutions with Node.js, Express, MongoDB, and more.",
    textureImage: "/bg.png",
    mainImage: "/main-visual---mask.png",
  },
];

const secondaryFeatures = [
  {
    title: "WordPress & CMS Development",
    description:
      "Professional WordPress website development with custom themes, plugins, and optimization for performance and SEO.",
    textureImage: "/texture.png",
    mainImage: "/image-395.png",
  },
  {
    title: "E-Commerce Solutions",
    description:
      "Complete e-commerce implementation with WooCommerce, Shopify, and custom shopping experiences with payment integration.",
    textureImage: "/texture-1.png",
    mainImage: "/visual---main.png",
  },
  {
    title: "Performance & SEO",
    description:
      "Fast-loading, SEO-optimized websites that rank well in search engines and provide excellent user experience.",
    textureImage: "/texture-2.png",
    mainImage: "/visual.png",
  },
];

const bottomFeatures = [
  {
    icon: "/icon-4.svg",
    title: "Clean Code",
    description: "Well-structured, maintainable code following best practices.",
  },
  {
    icon: "/union.svg",
    title: "Responsive Design",
    description: "Mobile-first design that works perfectly on all devices.",
    isUnion: true,
  },
  {
    icon: "/icon.svg",
    title: "Performance Optimized",
    description: "Fast-loading websites with optimized assets and caching.",
  },
  {
    icon: "/ai-chip.svg",
    title: "SEO Friendly",
    description: "Built with SEO best practices for better rankings.",
  },
];

export const SkillsSection = (): JSX.Element => {
  return (
    <section id="services" className="flex flex-col w-full max-w-[1440px] mx-auto items-center gap-12 px-[100px] py-[100px] relative">
      <div className="flex flex-col w-full max-w-[1240px] items-center gap-5">
        <Badge
          variant="outline"
          className="inline-flex gap-2 px-3.5 py-2.5 rounded-[46px] overflow-hidden border-none backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] items-center relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[46px] before:[background:linear-gradient(241deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
        >
          <img className="relative w-4 h-4" alt="Share" src="/share-1.svg" />
          <span className="relative w-fit mt-[-1.00px] bg-[linear-gradient(179deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.6)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-transparent text-base text-center tracking-[0] leading-5 whitespace-nowrap">
            My Expertise
          </span>
          <img
            className="absolute top-0 left-[-25px] w-[183px] h-[88px]"
            alt="Rectangle"
            src="/rectangle-29-2.svg"
          />
        </Badge>

        <div className="flex flex-col items-center gap-4 px-[229px] py-0 w-full">
          <h2 className="flex items-center justify-center self-stretch mt-[-1.00px] section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-5xl text-center tracking-[-1.00px] leading-[56.0px]">
            Skills & Technologies
          </h2>
          <p className="flex items-center justify-center w-fit [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-xl text-center tracking-[-0.20px] leading-[32.0px] whitespace-nowrap">
            Expertise in modern web development technologies and best practices
            for building scalable solutions.
          </p>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-[1240px] items-start gap-5">
        <div className="flex items-center justify-between self-stretch w-full gap-5">
          {mainFeatures.map((feature, index) => (
            <Card
              key={index}
              className={`flex flex-col ${feature.width} h-[460px] items-start bg-[#0d0d0d] rounded-[10.87px] overflow-hidden border-none before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10.87px] before:[background:linear-gradient(173deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.12)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none`}
            >
              <CardContent className="p-0 relative w-full h-full">
                <img
                  className="absolute top-0 left-0 w-full h-full"
                  alt="Texture"
                  src={feature.textureImage}
                />
                <img
                  className="relative w-full h-full"
                  alt={feature.title}
                  src={feature.mainImage}
                />
                <div className="absolute left-0 bottom-0 w-full flex flex-col items-start gap-1 p-6">
                  <h3 className="flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[24.0px] whitespace-nowrap">
                    {feature.title}
                  </h3>
                  <p className="flex items-center justify-center [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#999999] text-sm tracking-[-0.14px] leading-5">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-5 self-stretch w-full">
          {secondaryFeatures.map((feature, index) => (
            <Card
              key={index}
              className="flex flex-col w-[400px] h-[460px] items-start bg-[#0d0d0d] rounded-[10.87px] overflow-hidden border-none before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10.87px] before:[background:linear-gradient(173deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.12)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
            >
              <CardContent className="p-0 relative w-full h-full">
                <div
                  className="absolute top-0 left-0 w-full h-full bg-[url({feature.textureImage})] bg-[100%_100%]"
                  style={{ backgroundImage: `url(${feature.textureImage})` }}
                />
                <img
                  className="relative w-full h-full object-cover"
                  alt={feature.title}
                  src={feature.mainImage}
                />
                <div className="absolute left-0 bottom-0 w-full flex flex-col items-start gap-2 p-6">
                  <h3 className="flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-6 whitespace-nowrap">
                    {feature.title}
                  </h3>
                  <p className="flex items-center justify-center [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#999999] text-sm tracking-[-0.14px] leading-5">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-start self-stretch w-full gap-0">
        {bottomFeatures.map((feature, index) => (
          <Card
            key={index}
            className="flex flex-col items-start justify-end gap-5 p-6 flex-1 rounded-[7px] overflow-hidden border-none bg-transparent"
          >
            <CardContent className="p-0 flex flex-col items-start gap-5 w-full">
              {feature.isUnion ? (
                <div className="relative w-8 h-8">
                  <img
                    className="absolute top-[3px] left-0.5 w-[29px] h-[26px]"
                    alt="Union"
                    src={feature.icon}
                  />
                </div>
              ) : (
                <img
                  className="relative w-8 h-8"
                  alt="Icon"
                  src={feature.icon}
                />
              )}
              <div className="flex flex-col items-start gap-3 w-full">
                <h3 className="flex justify-center w-fit mt-[-1.00px] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-lg tracking-[0] leading-[24.0px] whitespace-nowrap items-center">
                  {feature.title}
                </h3>
                <p className="flex justify-center [font-family:'Inter_Display-Medium',Helvetica] font-medium text-[#999999] text-sm tracking-[-0.14px] leading-5 items-center">
                  {feature.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <img
        className="absolute top-[-430px] left-0 w-full h-[1136px] pointer-events-none"
        alt="Rectangle"
        src="/rectangle-34629478-10.svg"
      />
    </section>
  );
};
