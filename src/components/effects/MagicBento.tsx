import { PublicImage } from "@/components/ui/PublicImage";
import { cn } from "@/lib/utils";

export interface BentoCardProps {
  color?: string;
  title?: string;
  description?: string;
  label?: string;
  textAutoHide?: boolean;
  disableAnimations?: boolean;
  image?: string;
}

export interface BentoProps {
  textAutoHide?: boolean;
  enableLiquidBorder?: boolean;
  cards?: BentoCardProps[];
}

const BENTO_LAYOUT_CSS = `
  .card-responsive {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
    margin: 0 auto;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .card-responsive {
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 0rem;
    }
  }

  @media (min-width: 1024px) {
    .card-responsive {
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      padding: 0;
    }

    .card-responsive .card:nth-child(3) {
      grid-column: span 2;
      grid-row: span 2;
    }

    .card-responsive .card:nth-child(4) {
      grid-column: 1 / span 2;
      grid-row: 2 / span 2;
    }

    .card-responsive .card:nth-child(6) {
      grid-column: 4;
      grid-row: 3;
    }
  }

  @media (max-width: 639px) {
    .card-responsive .card {
      min-height: 200px;
      aspect-ratio: auto;
    }
  }

  .card--liquid-border {
    --liquid-inset: 4px;
    --liquid-inner-radius: 13px;
    backdrop-filter: blur(10px) saturate(1.25);
    -webkit-backdrop-filter: blur(10px) saturate(1.25);
    border-color: rgba(255, 255, 255, 0.08) !important;
    isolation: isolate;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      inset 1px 0 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.35),
      inset -1px 0 0 rgba(0, 0, 0, 0.22),
      0 10px 28px rgba(0, 0, 0, 0.32);
  }

  .card--liquid-border::after {
    content: '';
    position: absolute;
    inset: var(--liquid-inset);
    border-radius: var(--liquid-inner-radius);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
    pointer-events: none;
    z-index: 4;
  }

  .text-clamp-1 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .text-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

function BentoCardMedia({
  image,
  title,
}: {
  image?: string;
  title?: string;
}): JSX.Element | null {
  if (!image) return null;
  return (
    <>
      <div className="absolute inset-0">
        <PublicImage
          src={image}
          alt={title ?? ""}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          className="object-cover opacity-40"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
    </>
  );
}

const MagicBento: React.FC<BentoProps> = ({
  textAutoHide = true,
  enableLiquidBorder = false,
  cards = [],
}) => {
  return (
    <>
      <style>{BENTO_LAYOUT_CSS}</style>
      <div
        className="bento-section relative w-full"
        style={{ fontSize: "clamp(1rem, 0.9rem + 0.5vw, 1.5rem)" }}
      >
        <div className="card-responsive grid gap-2 p-0 lg:p-4">
          {cards.map((card, index) => (
            <div
              key={`${card.title ?? "card"}-${index}`}
              className={cn(
                "card relative flex aspect-[4/3] min-h-[200px] w-full max-w-full flex-col justify-between overflow-hidden rounded-[20px] border border-solid border-white/[0.08] p-3 font-light lg:p-5",
                enableLiquidBorder && "card--liquid-border",
              )}
              style={{
                backgroundColor: card.color || "var(--background-dark)",
                color: "var(--white)",
              }}
            >
              <BentoCardMedia image={card.image} title={card.title} />
              <div className="card__header relative z-10 flex justify-between gap-3 text-white">
                {card.label ? (
                  <span className="card__label inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/90">
                    {card.label}
                  </span>
                ) : null}
              </div>
              <div className="card__content relative z-10 flex flex-col text-white">
                <h3
                  className={cn(
                    "card__title m-0 mb-3 text-xl font-bold tracking-tight text-white lg:text-2xl",
                    textAutoHide && "text-clamp-1",
                  )}
                >
                  {card.title}
                </h3>
                <p
                  className={cn(
                    "card__description text-sm leading-6 opacity-95 md:text-base",
                    textAutoHide && "text-clamp-2",
                  )}
                >
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MagicBento;
