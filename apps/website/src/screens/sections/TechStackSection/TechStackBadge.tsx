import type { TechStackItem } from "@/constants/techStack";
import type { IconType } from "react-icons";
import {
  SiCss3,
  SiExpress,
  SiFigma,
  SiGit,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPhp,
  SiReact,
  SiShadcnui,
  SiSupabase,
  SiTailwindcss,
  SiVite,
  SiWoo,
  SiWordpress,
} from "react-icons/si";

type StackGlyph = (props: {
  className?: string;
  style?: React.CSSProperties;
}) => JSX.Element;

const asGlyph = (Icon: IconType): StackGlyph =>
  function StackGlyphIcon({ className, style }) {
    const Glyph = Icon as React.FC<{
      className?: string;
      style?: React.CSSProperties;
    }>;
    return <Glyph className={className} style={style} />;
  };

const ICON_MAP: Record<string, StackGlyph> = {
  SiHtml5: asGlyph(SiHtml5),
  SiCss3: asGlyph(SiCss3),
  SiJavascript: asGlyph(SiJavascript),
  SiReact: asGlyph(SiReact),
  SiNextdotjs: asGlyph(SiNextdotjs),
  SiVite: asGlyph(SiVite),
  SiTailwindcss: asGlyph(SiTailwindcss),
  SiShadcnui: asGlyph(SiShadcnui),
  SiNodedotjs: asGlyph(SiNodedotjs),
  SiExpress: asGlyph(SiExpress),
  SiWordpress: asGlyph(SiWordpress),
  SiWoo: asGlyph(SiWoo),
  SiPhp: asGlyph(SiPhp),
  SiMongodb: asGlyph(SiMongodb),
  SiGit: asGlyph(SiGit),
  SiFigma: asGlyph(SiFigma),
  SiSupabase: asGlyph(SiSupabase),
};

type TechStackBadgeProps = {
  item: TechStackItem;
};

export function TechStackBadge({ item }: TechStackBadgeProps): JSX.Element {
  const Icon = ICON_MAP[item.icon];

  return (
    <span className="inline-flex items-center gap-1.5 text-base text-white/70 transition-colors duration-200 hover:text-white/90">
      {Icon ? (
        <Icon
          className="size-4.5 shrink-0"
          style={{ color: item.color }}
          aria-hidden
        />
      ) : null}
      {item.name}
    </span>
  );
}
