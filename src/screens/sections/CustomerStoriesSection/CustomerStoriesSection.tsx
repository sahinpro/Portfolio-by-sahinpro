import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";

// Types
interface Author {
  name: string;
  role: string;
  company: string;
  avatar: string;
}

interface Testimonial {
  id: number;
  author: Author;
  quote: string;
  highlightedQuote: string;
}

// Data
const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    author: {
      name: "Alex Chen",
      role: "Product Manager",
      company: "Digital Assets Corp",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    quote: "Working with Sahin transformed our online presence. The website he built increased our conversion rate by 40% and the clean, modern design perfectly represents our brand.",
    highlightedQuote: "Working with Sahin <span class='text-purple-700 font-medium'>transformed our online presence</span>. The website he built increased our conversion rate by 40% and the clean, modern design <span class='text-purple-700 font-medium'>perfectly represents our brand</span>.",
  },
  {
    id: 2,
    author: {
      name: "Michael Rodriguez",
      role: "CEO",
      company: "TechFlow Solutions",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    quote: "Sahin delivered an exceptional e-commerce solution that exceeded our expectations. The site loads incredibly fast, ranks well on Google, and our sales have increased significantly since launch.",
    highlightedQuote: "Sahin delivered an <span class='text-purple-700 font-medium'>exceptional e-commerce solution</span> that exceeded our expectations. The site loads incredibly fast, ranks well on Google, and our sales have <span class='text-purple-700 font-medium'>increased significantly since launch</span>.",
  },
  {
    id: 3,
    author: {
      name: "David Thompson",
      role: "CTO",
      company: "Digital Innovations",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    quote: "The custom WordPress theme Sahin created for us is exactly what we needed. It's fast, SEO-optimized, and easy to manage. His attention to detail and technical expertise made the entire process smooth and stress-free.",
    highlightedQuote: "The custom WordPress theme Sahin created for us is <span class='text-purple-700 font-medium'>exactly what we needed</span>. It's fast, SEO-optimized, and easy to manage. His attention to detail made the entire process <span class='text-purple-700 font-medium'>smooth and stress-free</span>.",
  },
  {
    id: 4,
    author: {
      name: "Sarah Martinez",
      role: "Marketing Director",
      company: "Creative Studios",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    quote: "The website Sahin built has become our most powerful marketing tool. The user experience is intuitive, the design is stunning, and we've seen a dramatic increase in qualified leads.",
    highlightedQuote: "The website Sahin built has become our <span class='text-purple-700 font-medium'>most powerful marketing tool</span>. The user experience is intuitive, the design is stunning, and we've seen a <span class='text-purple-700 font-medium'>dramatic increase in qualified leads</span>.",
  },
  {
    id: 5,
    author: {
      name: "James Wilson",
      role: "Founder",
      company: "StartupHub",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    },
    quote: "Working with Sahin was a game-changer for our startup. He delivered a professional, high-performing website that has helped us secure funding and attract top talent.",
    highlightedQuote: "Working with Sahin was a <span class='text-purple-700 font-medium'>game-changer for our startup</span>. He delivered a professional, high-performing website that has helped us <span class='text-purple-700 font-medium'>secure funding and attract top talent</span>.",
  },
];

// Avatar Component
interface AvatarProps {
  testimonial: Testimonial;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const Avatar = ({ testimonial, isActive, onClick, disabled }: AvatarProps) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      testimonial.author.name
    )}&background=7e22ce&color=fff&size=150`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-0 border-none bg-transparent cursor-pointer 
        transition-all duration-300 ease-out flex-shrink-0
        w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
        rounded-xl overflow-hidden
        ${isActive 
          ? "scale-110 shadow-[0_0_0_2px_rgba(126,34,206,0.5),0_8px_24px_rgba(126,34,206,0.3)]" 
          : "hover:scale-105 hover:-translate-y-0.5"
        }
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        disabled:cursor-not-allowed disabled:opacity-50
      `}
      aria-label={`View testimonial from ${testimonial.author.name}`}
      aria-pressed={isActive}
    >
      <img
        src={testimonial.author.avatar}
        alt={testimonial.author.name}
        onError={handleImageError}
        draggable={false}
        className={`
          w-full h-full object-cover transition-all duration-300
          ${isActive ? "grayscale-0 opacity-100" : "grayscale opacity-40 group-hover:opacity-70"}
        `}
      />
    </button>
  );
};

// Main Component
export const CustomerStoriesSection = (): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeTestimonial = TESTIMONIALS[activeIndex];

  // Handle testimonial change
  const changeTestimonial = useCallback((newIndex: number) => {
    if (newIndex === activeIndex || isTransitioning) return;

    setIsTransitioning(true);

    // Smooth fade transition
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setActiveIndex(newIndex);
          gsap.to(contentRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => setIsTransitioning(false),
          });
        },
      });
    }
  }, [activeIndex, isTransitioning]);

  // Initial entrance animation
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".section-header", {
        opacity: 0,
        y: 30,
        duration: 0.8,
      })
        .from(".testimonial-card", {
          opacity: 0,
          y: 40,
          duration: 0.8,
        }, "-=0.4")
        .from(".avatar-button", {
          opacity: 0,
          scale: 0.8,
          duration: 0.4,
          stagger: 0.08,
        }, "-=0.4");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="testimonials"
        className="relative w-full max-w-[1440px] mx-auto px-4 py-10 sm:px-8 lg:px-12 lg:py-14 "
        aria-label="Customer testimonials"
      >
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Glow 1 */}
          <div 
            className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(126, 34, 206, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          />
          {/* Glow 2 */}
          <div 
            className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          />
        </div>

        {/* Header */}
        <div className="section-header text-center mb-12 md:mb-16">
          <h2 className="flex items-center justify-center self-stretch mt-[-1.00px] section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.00px] leading-tight sm:leading-[40px] md:leading-[48px] lg:leading-[56.0px]">
            Customer Stories
          </h2>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed text-neutral-400 max-w-[656px] mx-auto">
            Hear from clients and teams who've transformed their online presence
            and accelerated their business growth with my web solutions.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="testimonial-card relative max-w-[1100px] mx-auto mb-10 sm:mb-12 p-8 sm:p-12 md:p-14 lg:p-16 bg-gradient-to-br from-[rgba(15,15,15,0.6)] to-[rgba(10,10,10,0.6)] border border-white/[0.08] rounded-3xl backdrop-blur-xl overflow-hidden">
          {/* Card Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px'
            }}
          />

          {/* Card Glows */}
          <div 
            className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full"
            style={{
              background: 'rgba(126, 34, 206, 0.08)',
              filter: 'blur(60px)'
            }}
          />
          <div 
            className="absolute -bottom-20 -right-20 w-[300px] h-[300px] rounded-full"
            style={{
              background: 'rgba(168, 85, 247, 0.08)',
              filter: 'blur(60px)'
            }}
          />

          {/* Quote Icon */}
          <svg
            className="absolute top-6 left-6 w-12 h-12 sm:w-16 sm:h-16 opacity-[0.08]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M7 7h3v10H5V9a2 2 0 0 1 2-2Zm9 0h3v10h-5V9a2 2 0 0 1 2-2Z" />
          </svg>

          {/* Content */}
          <div 
            ref={contentRef} 
            className="relative z-10 min-h-[300px] sm:min-h-[350px] md:min-h-[400px] flex flex-col justify-center items-center text-center"
          >
            <blockquote className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light leading-snug text-white/95 mb-8 sm:mb-10 max-w-[900px]">
              <span
                dangerouslySetInnerHTML={{
                  __html: activeTestimonial.highlightedQuote,
                }}
              />
            </blockquote>

            <div className="flex flex-col items-center gap-1">
              <cite className="text-base sm:text-lg font-semibold text-white/95 not-italic">
                {activeTestimonial.author.name}
              </cite>
              <span className="text-sm sm:text-base text-white/50">
                {activeTestimonial.author.role}, {activeTestimonial.author.company}
              </span>
            </div>
          </div>
        </div>

        {/* Avatars */}
        <div className="relative z-20">
          <div className="avatar-button flex justify-center items-center gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-0 bg-black/80 sm:bg-transparent border border-white/[0.08] sm:border-0 rounded-2xl backdrop-blur-xl sm:backdrop-blur-none max-w-fit mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <Avatar
                key={testimonial.id}
                testimonial={testimonial}
                isActive={index === activeIndex}
                onClick={() => changeTestimonial(index)}
                disabled={isTransitioning}
              />
            ))}
          </div>
        </div>

        {/* Screen reader announcement */}
        <div className="sr-only" role="status" aria-live="polite">
          Showing testimonial {activeIndex + 1} of {TESTIMONIALS.length}
        </div>
      </section>
    </>
  );
};
