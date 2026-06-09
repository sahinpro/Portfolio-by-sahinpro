"use client";

import Carousel, { type CarouselItem } from "@/components/ui/Carousel";
import type { PublicProjectDetail } from "@/data/projectUiMapper";
import { projectImageAlt } from "@/lib/seoImages";
import { modalHeroHeight } from "@/views/ProjectsPage/projectModalStyles";
import { useEffect, useMemo, useRef, useState } from "react";

export interface ProjectImageGalleryProps {
  project: PublicProjectDetail;
  className?: string;
}

export function ProjectImageGallery({
  project,
  className = "",
}: ProjectImageGalleryProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setWidth(el.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    const mq = window.matchMedia("(max-width: 767px)");
    const onMq = () => setIsMobile(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, []);

  const items = useMemo((): CarouselItem[] => {
    const slides: CarouselItem[] = [
      {
        id: 0,
        title: "Cover",
        description: project.title,
        image: {
          src: project.image,
          alt: projectImageAlt(project.title),
        },
      },
    ];

    project.screenshots.forEach((src, i) => {
      slides.push({
        id: i + 1,
        title: `Screenshot ${i + 1}`,
        description: project.title,
        image: {
          src,
          alt: `${project.title} screenshot ${i + 1}`,
        },
      });
    });

    return slides;
  }, [project]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${modalHeroHeight} ${className}`.trim()}
    >
      {width > 0 ? (
        <Carousel
          items={items}
          baseWidth={width}
          autoplay={!isMobile && items.length > 1}
          autoplayDelay={4000}
          pauseOnHover
          loop={items.length > 1}
          flush
          className="h-full"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent sm:h-24" />
    </div>
  );
}
