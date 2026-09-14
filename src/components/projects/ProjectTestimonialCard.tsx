import { PublicImage } from "@/components/ui/PublicImage";
import type { PublicTestimonial } from "@/data/projectUiMapper";
import { cn } from "@/lib/utils";

function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

function quotedText(quote: string): string {
  const inner = quote
    .trim()
    .replace(/^[“”"']+|[“”"']+$/g, "")
    .trim();
  return `“${inner}”`;
}

function QuoteMarkIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="mb-4 h-[34px] w-[34px] text-emerald-400"
    >
      <path d="M7.17 6.18C5.2 7.62 4 9.76 4 12.1c0 3.4 2.38 5.9 5.6 5.9 2.1 0 3.4-1.05 3.4-2.63 0-1.36-1.02-2.36-2.44-2.36-1 0-1.76.45-2.18 1.24.06-2.06 1.36-3.76 3.4-4.54V6c-1.3.05-2.92.4-4.65 1.18Zm10 0C15.2 7.62 14 9.76 14 12.1c0 3.4 2.38 5.9 5.6 5.9 2.1 0 3.4-1.05 3.4-2.63 0-1.36-1.02-2.36-2.44-2.36-1 0-1.76.45-2.18 1.24.06-2.06 1.36-3.76 3.4-4.54V6c-1.3.05-2.92.4-4.65 1.18Z" />
    </svg>
  );
}

export function ProjectTestimonialCard({
  testimonial,
  className,
}: {
  testimonial?: PublicTestimonial | null;
  className?: string;
}): JSX.Element | null {
  if (!testimonial?.quote) return null;

  const name = testimonial.clientName.trim();
  const role = testimonial.clientRole?.trim() ?? "";
  const avatar = testimonial.clientPhoto?.trim() ?? "";

  return (
    <div className={cn(className)}>
      <figure className="relative rounded-2xl bg-gradient-to-br from-white/10 to-white/0 px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            padding: 1,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <QuoteMarkIcon />

        <blockquote className="text-[1.25rem] font-light leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
          {quotedText(testimonial.quote)}
        </blockquote>

        <figcaption className="mt-6 flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-800">
            {avatar ? (
              <PublicImage
                src={avatar}
                alt={name ? `${name} portrait` : "Client portrait"}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center bg-white/10 text-xs font-semibold tracking-wide text-white/80"
                aria-hidden={!name}
              >
                {clientInitials(name)}
              </span>
            )}
          </div>
          <div>
            {name ? (
              <p className="text-base font-semibold tracking-tight text-white">
                {name}
              </p>
            ) : null}
            {role ? <p className="text-sm text-neutral-400">{role}</p> : null}
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
