import type { BentoCardProps } from "@/components/MagicBento";
import MagicBento from "@/components/MagicBento";
import { Share2 } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

const skillsCards: BentoCardProps[] = [
  {
    color: '#0d0d0d',
    title: 'Frontend Development',
    description: 'Expert in crafting beautiful, responsive user interfaces with modern technologies. Specialized in React, Next.js, Tailwind CSS, and creating amazing user experiences.',
    label: 'Frontend',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=90&fm=png'
  },
  {
    color: '#0d0d0d',
    title: 'Full Stack Solutions',
    description: 'End-to-end web application development from database design to frontend implementation. Building scalable solutions with Node.js, Express, MongoDB, and more.',
    label: 'Full Stack',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=90&fm=png'
  },
  {
    color: '#0d0d0d',
    title: 'WordPress & CMS Development',
    description: 'Professional WordPress website development with custom themes, plugins, and optimization for performance and SEO.',
    label: 'CMS',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=90&fm=png'
  },
  {
    color: '#0d0d0d',
    title: 'E-Commerce Solutions',
    description: 'Complete e-commerce implementation with WooCommerce, Shopify, and custom shopping experiences with payment integration.',
    label: 'E-Commerce',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=90&fm=png'
  },
  {
    color: '#0d0d0d',
    title: 'Performance & SEO',
    description: 'Fast-loading, SEO-optimized websites that rank well in search engines and provide excellent user experience.',
    label: 'SEO',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=90&fm=png'
  },
  {
    color: '#0d0d0d',
    title: 'Clean Code',
    description: 'Well-structured, maintainable code following best practices.',
    label: 'Quality',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=90&fm=png'
  }
];

export const SkillsSection = (): JSX.Element => {
  return (
    <section id="services" className="flex flex-col w-full max-w-[1440px] mx-auto items-center gap-12 px-4 sm:px-8 md:px-12 lg:px-[100px] py-12 sm:py-16 md:py-20 lg:py-[100px] relative">
      <div className="flex flex-col w-full max-w-[1240px] items-center gap-5">
        <Badge
          variant="outline"
          className="inline-flex gap-2 px-3.5 py-2.5 rounded-[46px] overflow-hidden border-none backdrop-blur-[2px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2px)_brightness(100%)] items-center relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[46px] before:[background:linear-gradient(241deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none"
        >
          <Share2 className="relative w-4 h-4 text-white" />
          <span className="relative w-fit mt-[-1.00px] bg-[linear-gradient(179deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.6)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-transparent text-base text-center tracking-[0] leading-5 whitespace-nowrap">
            My Expertise
          </span>
          
        </Badge>

        <div className="flex flex-col items-center gap-4 px-4 sm:px-8 md:px-16 lg:px-[229px] py-0 w-full">
          <h2 className="flex items-center justify-center self-stretch mt-[-1.00px] section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.00px] leading-tight sm:leading-[40px] md:leading-[48px] lg:leading-[56.0px]">
            Skills & Technologies
          </h2>
          <p className="flex items-center justify-center w-full [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-base sm:text-lg md:text-xl text-center tracking-[-0.20px] leading-6 sm:leading-7 md:leading-[32.0px]">
            Expertise in modern web development technologies and best practices
            for building scalable solutions.
          </p>
        </div>
      </div>

      <div className="flex shadding-effect flex-col w-full items-center px-4 sm:px-6 md:px-8">
        <MagicBento 
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="132, 0, 255"
          disableAnimations={false}
          cards={skillsCards}
        />
      </div>
    </section>
  );
};
