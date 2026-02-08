import { ShareIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const faqItems = [
  {
    question: "What technologies do you specialize in?",
    answer:
      "I specialize in modern web technologies including React, Next.js, Node.js, WordPress, Tailwind CSS, MongoDB, and more. I stay updated with the latest trends and best practices in web development.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Project timelines vary based on scope and complexity. A simple website typically takes 2-4 weeks, while a full-stack application can take 6-12 weeks. I'll provide a detailed timeline during our initial consultation.",
  },
  {
    question: "Do you provide ongoing maintenance and support?",
    answer:
      "Yes, I offer maintenance packages to keep your website updated, secure, and performing optimally. Support options range from basic updates to comprehensive maintenance plans.",
  },
  {
    question: "Can you work with existing websites or only build new ones?",
    answer:
      "I can work with both! Whether you need a complete redesign, feature additions, performance optimization, or bug fixes on an existing site, I'm happy to help improve your current website.",
  },
  {
    question: "What is your process for starting a new project?",
    answer:
      "My process starts with understanding your goals and requirements, followed by planning and wireframing, design mockups, development, testing, and finally deployment. I keep you informed at every step and welcome your feedback throughout the process.",
  },
];

export const FAQSection = (): JSX.Element => {
  return (
    <section className="flex flex-col w-full items-center gap-12 px-[100px] py-[100px] relative">
      <img
        className="absolute top-[-389px] left-0 w-full h-[1136px] pointer-events-none"
        alt="Rectangle"
        src="/rectangle-34629478-7.svg"
      />

      <div className="flex flex-col gap-5 w-full items-center relative z-10">
        <Badge className="inline-flex h-8 gap-2 px-3.5 py-0 rounded-[46px] overflow-hidden border-none backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] bg-[linear-gradient(148deg,rgba(0,0,0,0.05)_0%,rgba(255,255,255,0.1)_100%)] items-center relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[46px] before:[background:linear-gradient(241deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
          <img
            className="absolute -top-9 left-[11px] w-[150px] h-[150px]"
            alt="Rectangle"
            src="/rectangle-29-1.svg"
          />
          <ShareIcon className="relative w-4 h-4 z-10" />
          <span className="relative z-10 bg-[linear-gradient(179deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.6)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-transparent text-base text-center tracking-[0] leading-5 whitespace-nowrap">
            FAQs
          </span>
        </Badge>

        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[732px]">
          <h2 className="section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-5xl text-center tracking-[-1.00px] leading-[56.0px]">
            Frequently Asked Questions
          </h2>

          <div className="inline-flex items-center justify-center gap-[5px]">
            <p className="[font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-xl text-center tracking-[-0.20px] leading-[32.0px] whitespace-nowrap">
              Don&apos;t see the answer you&apos;re looking for?
            </p>
            <span className="[font-family:'Inter_Display-Medium',Helvetica] font-medium text-white text-xl text-center tracking-[0] leading-[32.0px] whitespace-nowrap">
              Get in touch.
            </span>
          </div>
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="item-0"
        className="flex flex-col w-full max-w-[1016px] items-start gap-5 relative z-10"
      >
        {faqItems.map((item, index) => (
          <AccordionItem
            key={`item-${index}`}
            value={`item-${index}`}
            className="w-full rounded-xl overflow-hidden border border-solid border-[#ffffff14] shadow-[8.37px_2.21px_38.16px_#00000066] [background:radial-gradient(50%_50%_at_36%_0%,rgba(202,202,202,0.08)_0%,rgba(202,202,202,0)_100%),linear-gradient(0deg,rgba(13,13,13,1)_0%,rgba(13,13,13,1)_100%)] data-[state=open]:overflow-visible"
          >
            {index === 0 && (
              <div className="absolute top-0 left-0 w-full h-[187px] pointer-events-none">
                <div className="absolute top-[49px] left-0 w-full h-[138px] bg-[linear-gradient(180deg,rgba(227,227,227,0.05)_0%,rgba(239,239,239,0.03)_30%,rgba(247,247,247,0.02)_56%,rgba(250,250,250,0.01)_75%,rgba(255,255,255,0)_100%)]" />
                <img
                  className="absolute left-0 bottom-px w-full h-[98px]"
                  alt="Texture"
                  src="/texture-8.png"
                />
              </div>
            )}
            <AccordionTrigger className="flex items-center justify-between px-6 py-5 w-full hover:no-underline [&[data-state=open]>div]:items-start relative z-10">
              <span className="[font-family:'Inter_Display-Medium',Helvetica] font-medium text-[#eeeeee] text-lg text-left tracking-[0] leading-[24.0px]">
                {item.question}
              </span>
            </AccordionTrigger>
            {item.answer && (
              <AccordionContent className="px-6 pb-5 pt-0">
                <p className="[font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#999999] text-sm tracking-[-0.14px] leading-5">
                  {item.answer}
                </p>
              </AccordionContent>
            )}
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
