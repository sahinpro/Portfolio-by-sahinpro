import type { TechStackItem } from "@/constants/techStack";
import type { IconType } from "react-icons";
import {
  SiExpress,
  SiFigma,
  SiGit,
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
    const Glyph = Icon as React.FC<{ className?: string; style?: React.CSSProperties }>;
    return <Glyph className={className} style={style} />;
  };

const ICON_MAP: Record<string, StackGlyph> = {
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
    <span
      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/85 transition-colors duration-200 hover:border-white/[0.14] hover:bg-white/[0.07]"
    >
      {Icon ? (
        <Icon
          className="size-4 shrink-0"
          style={{ color: item.color }}
          aria-hidden
        />
      ) : null}
      {item.name}
    </span>
  );
}
