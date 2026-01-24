import { ChevronLeftIcon, ChevronRightIcon, ShareIcon } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

const testimonials = [
  {
    id: 1,
    company: "Cloudway",
    logo: "/icon-1.svg",
    quote:
      "Working with Sahin transformed our online presence. The website he built increased our conversion rate by 40% and the clean, modern design perfectly represents our brand. Highly professional and responsive throughout the project.",
    author: {
      name: "Sara Kim",
      role: "Product Manager at Digital Assets Corp",
      avatar: "/rectangle-34629545.png",
    },
    videoIcon: "/social--video.svg",
    backgroundImages: {
      glow: "/texture---glow-2.svg",
      rect1: "/rectangle-34629477-1.svg",
      rect2: "/rectangle-34629478.svg",
      rect3: "/rectangle-34629479-2.svg",
      mask: "/texture---mask.png",
    },
    isBlurred: true,
  },
  {
    id: 2,
    company: "Cloudway",
    logo: "/icon-1.svg",
    quote:
      "Sahin delivered an exceptional e-commerce solution that exceeded our expectations. The site loads incredibly fast, ranks well on Google, and our sales have increased significantly since launch. Best investment we made this year.",
    author: {
      name: "Sara Kim",
      role: "Product Manager at Digital Assets Corp",
      avatar: "/rectangle-34629545-1.png",
    },
    videoIcon: "/social--video-2.svg",
    backgroundImages: {
      glow: "/texture---glow.svg",
      rect1: "/rectangle-34629477.svg",
      rect2: "/rectangle-34629478-4.svg",
      rect3: "/rectangle-34629479-1.svg",
      mask: "/texture---mask-1.png",
    },
    isBlurred: false,
  },
  {
    id: 3,
    company: "Cloudway",
    logo: "/icon-1.svg",
    quote:
      "The custom WordPress theme Sahin created for us is exactly what we needed. It's fast, SEO-optimized, and easy to manage. His attention to detail and technical expertise made the entire process smooth and stress-free.",
    author: {
      name: "Sara Kim",
      role: "Product Manager at Digital Assets Corp",
      avatar: "/rectangle-34629545-2.png",
    },
    videoIcon: "/social--video-1.svg",
    backgroundImages: {
      glow: "/texture---glow-1.svg",
      rect1: "/rectangle-34629477-3.svg",
      rect2: "/rectangle-34629478-5.svg",
      rect3: "/rectangle-34629479.svg",
      mask: "/texture---mask-2.png",
    },
    isBlurred: true,
  },
];

export const WhyChooseUsSection = (): JSX.Element => {
  return (
    <section id="about" className="relative flex flex-col items-center gap-[66px] p-[100px] w-full max-w-[1440px] mx-auto">
      <img
        className="absolute top-[-264px] left-0 w-full h-[1136px] pointer-events-none"
        alt="Background decoration"
        src="/rectangle-34629478-9.svg"
      />

      <header className="flex flex-col items-center gap-5 w-full max-w-[1240px] relative z-10">
        <Badge
          variant="outline"
          className="inline-flex h-[39px] items-center gap-2 px-3.5 py-0 rounded-[46px] overflow-hidden border-none backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] bg-[linear-gradient(182deg,rgba(0,0,0,0.05)_0%,rgba(255,255,255,0.1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[46px] before:[background:linear-gradient(241deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
        >
          <img
            className="absolute top-[-15px] left-[calc(50%_-_103px)] w-[209px] h-[108px]"
            alt="Badge decoration"
            src="/rectangle-30.svg"
          />
          <ShareIcon className="w-4 h-4 relative z-10" />
          <span className="relative z-10 bg-[linear-gradient(179deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.6)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-base text-center tracking-[0] leading-5 whitespace-nowrap">
            Testimonial
          </span>
        </Badge>

        <div className="flex flex-col gap-4 items-center w-full">
          <h2 className="section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-5xl text-center tracking-[-1.00px] leading-[56.0px]">
            See Customer Stories
          </h2>
          <p className="w-full max-w-[656px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-xl text-center tracking-[-0.20px] leading-[32.0px]">
            Hear from clients and teams who've transformed their online presence
            and accelerated their business growth with my web solutions.
          </p>
        </div>
      </header>

      <div className="relative flex items-center justify-center gap-[105px] w-full">
        {testimonials.map((testimonial, index) => (
          <Card
            key={testimonial.id}
            className={`flex flex-col w-[820px] h-[410px] items-start justify-between p-8 rounded-2xl overflow-hidden border-none [background:radial-gradient(50%_50%_at_26%_-24%,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_100%),linear-gradient(0deg,rgba(14,14,14,1)_0%,rgba(14,14,14,1)_100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-2xl before:[background:linear-gradient(180deg,rgba(238,238,238,0.2)_0%,rgba(238,238,238,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none ${
              testimonial.isBlurred ? "blur-[5.5px] opacity-50" : ""
            } ${index === 0 ? "ml-[-715px]" : ""} ${
              index === 2 ? "mr-[-715px]" : ""
            }`}
          >
            <div className="absolute top-px left-px w-[820px] h-[423px] pointer-events-none">
              <img
                className={`absolute w-full h-full top-px ${
                  index === 0 ? "left-[615px]" : "left-0"
                }`}
                alt="Texture glow"
                src={testimonial.backgroundImages.glow}
              />
              <div className="w-full h-full top-0 overflow-hidden absolute left-0">
                <img
                  className="absolute top-[-723px] left-[-338px] w-[991px] h-[1080px]"
                  alt="Background decoration"
                  src={testimonial.backgroundImages.rect1}
                />
                <img
                  className="absolute top-[-726px] left-[-255px] w-[829px] h-[1027px]"
                  alt="Background decoration"
                  src={testimonial.backgroundImages.rect2}
                />
                <img
                  className={`absolute ${
                    index === 0
                      ? "top-[-11040px] left-[-23040px] w-[403px] h-[840px]"
                      : "top-[-709px] left-[-151px] w-[684px] h-[929px]"
                  }`}
                  alt="Background decoration"
                  src={testimonial.backgroundImages.rect3}
                />
                <div className="absolute top-px left-[9px] w-[353px] h-[33px] bg-white blur-[150px]" />
                <img
                  className={`absolute top-0 ${
                    index === 0 ? "left-[615px] w-[205px]" : "left-0 w-[820px]"
                  } h-[402px]`}
                  alt="Texture mask"
                  src={testimonial.backgroundImages.mask}
                />
              </div>
            </div>

            <CardContent className="flex flex-col gap-10 p-0 w-full relative z-10">
              <div className="inline-flex items-start gap-2.5">
                <img
                  className="w-[25.2px] h-7"
                  alt="Company logo"
                  src={testimonial.logo}
                />
                <span className="[font-family:'Geist',Helvetica] font-medium text-white text-2xl tracking-[0] leading-[normal]">
                  {testimonial.company}
                </span>
              </div>

              <blockquote className="[font-family:'Geist',Helvetica] font-medium text-white text-[32px] tracking-[-0.32px] leading-[48.0px]">
                {testimonial.quote}
              </blockquote>
            </CardContent>

            <footer className="flex items-center justify-between w-full relative z-10">
              <div className="flex items-center gap-4">
                <img
                  className="w-11 h-11 rounded-full object-cover"
                  alt={testimonial.author.name}
                  src={testimonial.author.avatar}
                />
                <div className="[font-family:'Geist',Helvetica] font-normal text-lg">
                  <span className="text-white">
                    {testimonial.author.name},{" "}
                  </span>
                  <span className="text-[#ffffff99]">
                    {testimonial.author.role}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 hover:bg-white/10"
              >
                <img
                  className="w-6 h-6"
                  alt="PlayIcon video"
                  src={testimonial.videoIcon}
                />
              </Button>
            </footer>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-white/10"
          aria-label="Previous testimonial"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-white/10"
          aria-label="Next testimonial"
        >
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </Button>
      </div>
    </section>
  );
};
