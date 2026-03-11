import { HeaderLogo } from "@/components/Header";
import { TextEffect } from "@/components/MotionPrimitives/TextEffect";
import { Github, Linkedin } from "lucide-react";
import type { ComponentType } from "react";
import { BsBehance, BsDribbble } from "react-icons/bs";

const socialLinks = [
  { name: "GitHub", href: "https://github.com/sahinhub", icon: Github, brandColor: "#f0f6fc", bg: "hover:bg-white/10" },
  { name: "LinkedIn", href: "https://linkedin.com/in/sahinhub", icon: Linkedin, brandColor: "#0A66C2", bg: "hover:bg-[#0A66C2]/20" },
  { name: "Behance", href: "https://behance.net/sahinhub", icon: BsBehance, brandColor: "#1769FF", bg: "hover:bg-[#1769FF]/20" },
  { name: "Dribbble", href: "https://dribbble.com/sahinhub", icon: BsDribbble, brandColor: "#EA4C89", bg: "hover:bg-[#EA4C89]/20" },
];

export const FooterSection = (): JSX.Element => {
  return (
    <footer className="flex flex-col container mx-auto items-center justify-center gap-[62px] pt-14 pb-12 px-4 md:px-[154px] relative  ">
        <div className="flex flex-col container mx-auto  items-center justify-center gap-2">
          <HeaderLogo/>
            <TextEffect 
              per="char" 
              preset="fade"
              className="font-monte-carlo text-4xl text-center leading-[70px]"
              style={{
                backgroundImage: 'linear-gradient(45deg, #ee2a7b, #6228d7, #2b8ace)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Sahin Alam
            </TextEffect>
          <div className="flex items-center gap-2 mt-2">
            {socialLinks.map((link) => {
              const Icon = link.icon as ComponentType<{ className?: string }>;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.name}
                  aria-label={link.name}
                  className={`group w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${link.bg} transition-all duration-200`}
                  style={{ ["--brand-color" as string]: link.brandColor }}
                >
                  <span className="text-white/40 transition-colors duration-200 group-hover:[color:var(--brand-color)]">
                    <Icon className="w-4 h-4" />
                  </span>
                </a>
              );
            })}
          </div>
        <p className="flex items-center justify-center mt-[-1.00px] [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#ebebeb99] text-sm tracking-[0] leading-5 whitespace-nowrap">
          © 2026 Sahin Alam. All rights reserved.
        </p>
        </div>
     
    </footer>
  );
};
