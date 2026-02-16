import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { Check, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { FooterSection } from "@/screens/sections/FooterSection";
import { CTAButton } from "@/components/CTAButton";
import { Card, CardContent } from "@/components/ui/card";

interface Service {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

const services: Service[] = [
  {
    icon: "🎨",
    title: "Web Design",
    description:
      "Beautiful, user-friendly interfaces that align with your brand and user expectations.",
    features: [
      "UI/UX Design",
      "Responsive Design",
      "Prototyping",
      "Design Systems",
    ],
  },
  {
    icon: "⚡",
    title: "Full Stack Development",
    description:
      "End-to-end web application development from database design to frontend implementation.",
    features: [
      "React & Next.js",
      "Node.js & Express",
      "Database Design",
      "API Development",
    ],
  },
  {
    icon: "📱",
    title: "WordPress Development",
    description:
      "Professional WordPress website development with custom themes, plugins, and optimization.",
    features: [
      "Custom Themes",
      "Plugin Development",
      "Performance Optimization",
      "SEO Optimization",
    ],
  },
  {
    icon: "🛒",
    title: "E-Commerce Solutions",
    description:
      "Complete e-commerce implementation with WooCommerce, Shopify, and custom shopping experiences.",
    features: [
      "WooCommerce",
      "Shopify",
      "Payment Integration",
      "Inventory Management",
    ],
  },
  {
    icon: "🚀",
    title: "Performance & SEO",
    description:
      "Fast-loading, SEO-optimized websites that rank well in search engines.",
    features: [
      "Speed Optimization",
      "SEO Audit",
      "Content Strategy",
      "Analytics Setup",
    ],
  },
  {
    icon: "🔧",
    title: "Maintenance & Support",
    description:
      "Ongoing support and maintenance to keep your website running smoothly.",
    features: [
      "Regular Updates",
      "Security Monitoring",
      "Backup Solutions",
      "Technical Support",
    ],
  },
];

export const ServicesPage = (): JSX.Element => {
  const headerRef = useRef<HTMLDivElement>(null);
  const servicesRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Header animation
    if (headerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(headerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Services cards animation
    const cards = servicesRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                cards,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  stagger: 0.1,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      cards.forEach((card) => observer.observe(card));
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Hover animations for service cards
    const cards = servicesRefs.current.filter(Boolean) as HTMLDivElement[];
    cards.forEach((card) => {
      const handleMouseEnter = () => {
        gsap.to(card, { y: -8, duration: 0.3, ease: "power2.out" });
      };
      const handleMouseLeave = () => {
        gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
      };
      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
      };
    });
  }, []);

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />
      <section className="py-32 relative w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={headerRef} className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Services I Provide
            </h2>
            <p className="max-w-2xl text-lg text-white/70">
              Comprehensive{" "}
              <span className="text-white font-semibold">web development</span>{" "}
              services to bring your digital vision to life with precision and
              creativity.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                ref={(el) => {
                  servicesRefs.current[index] = el;
                }}
              >
                <Card className="glass-card glass-card-hover p-8 relative overflow-hidden group h-full flex flex-col">
                  <CardContent className="p-0 flex flex-col flex-1">
                    {/* Icon */}
                    <div className="text-5xl mb-6">{service.icon}</div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-white transition-colors">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/70 mb-6 leading-relaxed flex-1">
                      {service.description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-3 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
                          <span className="text-white/70 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <CTAButton
                      href="/contact"
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      Learn More
                    </CTAButton>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FooterSection />
    </div>
  );
};
