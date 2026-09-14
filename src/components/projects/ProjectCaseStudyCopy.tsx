import type { PublicCaseStudy } from "@/data/projectUiMapper";
import { bodyParagraphs } from "@/lib/projectMeta";
import { cn } from "@/lib/utils";

const CASE_STUDY_LINES: { key: keyof PublicCaseStudy; label: string }[] = [
  { key: "problem", label: "Problem" },
  { key: "solution", label: "Solution" },
  { key: "result", label: "Result" },
];

export function ProjectCaseStudyCopy({
  caseStudy,
  description,
  compact = false,
  className,
  lineClassName,
  labelClassName,
}: {
  caseStudy?: PublicCaseStudy | null;
  description: string;
  compact?: boolean;
  className?: string;
  lineClassName?: string;
  labelClassName?: string;
}): JSX.Element {
  if (caseStudy) {
    return (
      <div
        className={cn(compact ? "mt-2.5 space-y-1" : "space-y-3", className)}
      >
        {CASE_STUDY_LINES.map(({ key, label }) => {
          const text = caseStudy[key];
          if (!text) return null;
          return (
            <p key={key} className={lineClassName}>
              <span className={labelClassName}>{label}: </span>
              {text}
            </p>
          );
        })}
      </div>
    );
  }

  if (compact) {
    return <p className={cn("mt-2.5", lineClassName)}>{description}</p>;
  }

  return (
    <div className={className}>
      {bodyParagraphs(description).map((para, i) => (
        <p key={i} className={lineClassName}>
          {para}
        </p>
      ))}
    </div>
  );
}
