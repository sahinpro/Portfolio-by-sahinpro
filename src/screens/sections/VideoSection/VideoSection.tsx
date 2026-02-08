import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";

export const VideoSection = (): JSX.Element => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const pauseBtnRef = useRef<HTMLButtonElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    // Preload video metadata to get dimensions
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        setIsLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    // Container animation on scroll
    if (containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1, rootMargin: "-100px" }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Loading animation
    if (loadingRef.current) {
      gsap.fromTo(
        loadingRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
    }
    if (spinnerRef.current) {
      gsap.to(spinnerRef.current, {
        rotate: 360,
        duration: 1,
        repeat: -1,
        ease: "none",
      });
    }
  }, []);

  useEffect(() => {
    // Overlay animation
    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, delay: 0.3, duration: 0.5 }
      );
    }
    // Play button animation
    if (playBtnRef.current && !isPlaying) {
      gsap.fromTo(
        playBtnRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          delay: 0.4,
          duration: 0.4,
          ease: "power3.out",
        }
      );
    }
    // Pause button animation
    if (pauseBtnRef.current && isPlaying) {
      gsap.fromTo(
        pauseBtnRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power3.out",
        }
      );
    }
  }, [isPlaying]);

  return (
    <section className="flex flex-col w-full items-center gap-12 px-4 sm:px-8 md:px-12 lg:px-[100px] pt-30 relative pt-20">
      <div
        ref={containerRef}
        className="relative max-w-[1000px] w-full rounded-[32px] border border-white/10 backdrop-blur-xl bg-gradient-to-b from-white/30 to-white/50 p-3"
      >
        {/* Gradient Overlay at Bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full scale-[1.1] bg-gradient-to-b from-transparent via-black/50 to-black" />
        {/* Inner Container */}
        <div className="relative rounded-[24px] bg-[#0f0f0f] overflow-visible">
          {/* Video Container with Play Button - Fixed Aspect Ratio */}
          <div className="relative rounded-[20px] overflow-hidden group cursor-pointer z-10 aspect-video bg-[#0a0a0a]">
            {/* Loading Placeholder */}
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
                <div ref={loadingRef} className="flex flex-col items-center gap-3">
                  <div
                    ref={spinnerRef}
                    className="w-12 h-12 border-2 border-white/20 border-t-white/60 rounded-full"
                  />
                  <span className="text-white/40 text-sm">Loading video...</span>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              className={`rounded-[20px] w-full h-full object-cover transition-opacity duration-500 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              src="/4733-179738669.mp4"
              loop
              muted
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedData={() => setIsLoaded(true)}
            />
            
            {/* Play/Pause Button Overlay */}
            <div 
              ref={overlayRef}
              className={`absolute inset-0 flex items-center justify-center transition-colors duration-300 ${
                isPlaying ? 'bg-black/0 hover:bg-black/10' : 'bg-black/20 group-hover:bg-black/30'
              }`}
              onClick={togglePlay}
            >
              {!isPlaying && (
                <button
                  ref={playBtnRef}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
                  }}
                  onMouseDown={(e) => {
                    gsap.to(e.currentTarget, { scale: 0.95, duration: 0.1 });
                  }}
                  onMouseUp={(e) => {
                    gsap.to(e.currentTarget, { scale: 1.1, duration: 0.1 });
                  }}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-black/60 backdrop-blur-md border border-white/40 shadow-lg hover:bg-black/80 hover:border-white/30 transition-all duration-300"
                  aria-label="Play video"
                >
                  {/* @ts-expect-error - react-icons type issue with strict mode */}
                  <FaPlay className="w-8 h-8 text-white ml-1" aria-hidden="true" />
                </button>
              )}
              {isPlaying && (
                <button
                  ref={pauseBtnRef}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
                  }}
                  onMouseDown={(e) => {
                    gsap.to(e.currentTarget, { scale: 0.95, duration: 0.1 });
                  }}
                  onMouseUp={(e) => {
                    gsap.to(e.currentTarget, { scale: 1.1, duration: 0.1 });
                  }}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg hover:bg-black/80 hover:border-white/30 transition-all duration-300"
                  aria-label="Pause video"
                >
                  {/* @ts-expect-error - react-icons type issue with strict mode */}
                  <FaPause className="w-8 h-8 text-white" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          
          
        </div>
      </div>
    </section>
  );
};
