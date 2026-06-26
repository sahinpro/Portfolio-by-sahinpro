export interface ProjectCardTeaserProps {
  title: string;
  categoryLine: string;
  description: string;
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
  techPreview,
  extraTechCount = 0,
  className,
  titleClassName = "text-[1.45rem] font-bold leading-tight text-white",
  descriptionClassName = "mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-white/55",
}: ProjectCardTeaserProps): JSX.Element {
  return (
    <div className={className}>
      <h3 className={titleClassName}>{title}</h3>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00BB7D]">
        {categoryLine}
      </p>
      <p className={descriptionClassName}>{description}</p>
      {techPreview ? (
        <p className="mt-1.5 line-clamp-1 text-[11px] leading-snug text-white/35">
          {techPreview}
          {extraTechCount > 0 ? ` +${extraTechCount}` : ""}
        </p>
      ) : null}
    </div>
  );
}
