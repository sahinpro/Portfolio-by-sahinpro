import type {
  PublicCaseStudy,
  PublicTestimonial,
} from "@/data/projectUiMapper";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export interface ProjectCardTeaserProps {
  title: string;
  categoryLine: string;
  description: string;
  roleLabel?: string | null;
  caseStudy?: PublicCaseStudy | null;
  testimonial?: PublicTestimonial | null;
  techPreview?: string;
  extraTechCount?: number;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function ProjectCardTeaser({
  title,
  categoryLine,
  description,
  roleLabel,
  caseStudy,
  testimonial,
  techPreview,
  extraTechCount = 0,
  className,
  titleClassName = "mt-1.5 text-xl font-bold leading-tight text-white sm:text-[1.35rem]",
  descriptionClassName = "mt-3 line-clamp-2 text-sm leading-relaxed text-white/55",
}: ProjectCardTeaserProps): JSX.Element {
  const outcome = caseStudy?.result?.trim() || description.trim();

  return (
    <div
      className={cn("flex h-full min-w-0 flex-col justify-center", className)}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00BB7D]">
        {categoryLine}
      </p>
      <h3 className={titleClassName}>{title}</h3>
      {roleLabel ? (
        <p className="mt-1.5 text-sm text-white/45">{roleLabel}</p>
      ) : null}
      {outcome ? (
        <p className={descriptionClassName}>
          {caseStudy?.result?.trim() ? (
            <>
              <span className="text-white/35">Result: </span>
              {caseStudy.result}
            </>
          ) : (
            outcome
          )}
        </p>
      ) : null}
      {testimonial?.quote ? (
        <p className="mt-2.5 line-clamp-2 text-[13px] italic leading-relaxed text-white/45">
          {testimonial.quote}
        </p>
      ) : null}
      {techPreview ? (
        <p className="mt-2.5 line-clamp-1 text-[11px] leading-snug text-white/35">
          {techPreview}
          {extraTechCount > 0 ? ` +${extraTechCount}` : ""}
        </p>
      ) : null}
      <span className="mt-4 inline-flex min-h-8 items-center gap-1 text-sm font-medium text-white/70 transition-colors group-hover:text-white border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5 max-w-40">
        View case study
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </span>
    </div>
  );
}
