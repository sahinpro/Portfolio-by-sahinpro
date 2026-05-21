import { Card, CardContent } from "@/components/ui/card";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { motion } from "framer-motion";

const stepsData = [
  {
    number: "01",
    title: "Discovery & Planning",
    description:
      "We discuss your requirements, goals, and vision. I create wireframes and plan the technical approach.",
    textureUrl: "/texture-3.png",
    maskUrl:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&q=80",
  },
  {
    number: "02",
    title: "Design & Development",
    description:
      "I design mockups and develop your website using latest technologies, ensuring best practices and performance.",
    textureUrl: "/texture-4.png",
    maskUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&q=80",
  },
  {
    number: "03",
    title: "Testing & Delivery",
    description:
      "Thorough testing, optimization, and deployment. Ongoing support and maintenance for your peace of mind.",
    textureUrl: "/texture-5.png",
    maskUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80",
  },
];

export const DevelopmentProcessSection = (): JSX.Element => {
  return (
    <section
      id="process"
      className="container mx-auto flex w-full max-w-full flex-col items-center gap-12 px-4  py-10 relative"
    >
      <motion.div
        className="flex flex-col container mx-auto w-full px-0 lg:px-4 items-center gap-12 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <motion.div
          variants={fadeInUp}
          className="flex flex-col mx-auto items-center gap-5"
        >
          <div className="flex flex-col items-center gap-4 py-0 w-full">
            <h2 className="flex items-center justify-center self-stretch section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.00px] leading-tight sm:leading-[40px] md:leading-[48px] lg:leading-[56.0px]">
              My Development Process
            </h2>

            <p className="flex items-center justify-center w-full [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-base sm:text-lg md:text-xl text-center tracking-[-0.20px] leading-6 sm:leading-7 md:leading-[32.0px]">
              A streamlined approach to deliver quality projects on time.
            </p>
          </div>
        </motion.div>

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stepsData.map((step, index) => (
            <motion.div
              key={`step-${index}`}
              variants={fadeInUp}
              className="min-w-0 w-full"
            >
              <Card className="flex flex-col w-full min-w-0 h-[300px] sm:h-[400px] md:h-[460px] max-w-[400px] mx-auto md:max-w-none items-start relative bg-[#0d0d0d] rounded-[10.87px] overflow-hidden border-[none] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[10.87px] before:[background:linear-gradient(173deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.12)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
                <div
                  className="absolute top-0 left-0 w-full h-full bg-[100%_100%]"
                  style={{ backgroundImage: `url(${step.textureUrl})` }}
                />

                <img
                  className="relative w-full h-full min-w-0 object-cover"
                  alt={`${step.title} visual`}
                  src={step.maskUrl}
                />

                {/* Dark overlay gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-[2]" />

                <CardContent className="absolute left-0 bottom-0 w-full max-w-full flex flex-col items-start gap-2 p-4 sm:p-6 z-[3] min-w-0">
                  <h3 className="w-full max-w-full [font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-xl sm:text-2xl tracking-[0] leading-tight sm:leading-[32px] break-words">
                    {step.number}. {step.title}
                  </h3>

                  <p className="flex items-center justify-center w-full max-w-[352px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#999999] text-sm tracking-[-0.14px] leading-5">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
