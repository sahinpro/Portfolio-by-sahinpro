import { SectionHeader } from "@/components/sections";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { motion } from "framer-motion";

const faqItems = [
  {
    question: "What technologies do you specialize in?",
    answer:
      "JavaScript, React, Next.js, Node.js, WordPress, WooCommerce,  , and Figma-to-web builds. See the Skills section above or the services page for a full breakdown.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Timelines depend on scope. Landing pages often take 1–2 weeks, marketing sites 3–6 weeks, and larger apps several months. You'll get a clear timeline after we discuss your goals.",
  },
  {
    question: "Do you provide ongoing maintenance and support?",
    answer:
      "Yes    from security updates and content changes to performance tuning. We can agree on a support window or a monthly maintenance plan before launch.",
  },
  {
    question: "Can you work with existing websites or only build new ones?",
    answer:
      "Both. I can redesign, add features, fix bugs, or improve performance on an existing site    not just greenfield builds.",
  },
  {
    question: "What is your process for starting a new project?",
    answer:
      "Discovery → proposal and timeline → build in phases with check-ins → review → launch and handoff. You're kept in the loop at every stage.",
  },
];

const faqColumnSize = Math.ceil(faqItems.length / 2);
const faqColumns = [
  faqItems.slice(0, faqColumnSize),
  faqItems.slice(faqColumnSize),
] as const;

export const FAQSection = (): JSX.Element => {
  return (
    <section
      id="faq"
      className="relative flex flex-col container mx-auto items-center gap-12 px-4 py-10 sm:py-14"
    >
      <motion.div
        className="flex flex-col items-center gap-10 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <motion.div variants={fadeInUp} className="w-full">
          <SectionHeader
            title="Frequently asked questions"
            description="Don't see your answer? Get in touch    I'm happy to clarify anything before we start."
          />
        </motion.div>

        <motion.div variants={fadeInUp} className="w-full ">
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 md:items-start"
          >
            {faqColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-3">
                {column.map((item, itemIndex) => {
                  const index = columnIndex * faqColumnSize + itemIndex;

                  return (
                    <AccordionItem
                      key={item.question}
                      value={`item-${index}`}
                      className="rounded-xl border border-white/10 bg-[#0d0d0d]/90 px-1 overflow-hidden"
                    >
                      <AccordionTrigger className="px-5 py-4 text-left hover:no-underline [&[data-state=open]>svg]:rotate-180">
                        <span className="[font-family:'Inter_Display-Medium',Helvetica] font-medium text-white/90 text-base sm:text-lg pr-4">
                          {item.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-4">
                        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                          {item.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </div>
            ))}
          </Accordion>
        </motion.div>
      </motion.div>
    </section>
  );
};
