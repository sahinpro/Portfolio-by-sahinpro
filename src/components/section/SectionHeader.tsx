import { SectionLabel } from "./SectionLabel";

const headingClass =
  "section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-4xl   lg:text-5xl tracking-[-1.00px] leading-tight sm:leading-[40px] md:leading-[48px] lg:leading-[56px]";

const descriptionClass =
  "[font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-base sm:text-lg md:text-xl tracking-[-0.20px] leading-6 sm:leading-7 md:leading-[32px]";

export const SectionHeader = ({
  label,
  title,
  description,
  align = "center",
  className = "",
}: {
  label?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}): JSX.Element => {
  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-4 w-full ${alignClass} ${className}`}>
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      <h2 className={headingClass}>{title}</h2>
      {description ? (
        <p
          className={`${descriptionClass} ${align === "center" ? "max-w-3xl" : "max-w-2xl"}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
};
