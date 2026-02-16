import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { CheckCircle, Github, Linkedin, Mail, MapPin, Phone, Send, Twitter } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import Header from "@/components/Header";
import { FooterSection } from "@/screens/sections/FooterSection";
import { CTAButton } from "@/components/CTAButton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface FormData {
  name: string;
  email: string;
  message: string;
}

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "sahinhub@gmail.com",
    href: "mailto:sahinhub@gmail.com",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "San Francisco, CA",
    href: "#",
  },
];

const socialLinks = [
  { name: "GitHub", href: "https://github.com/sahincoderbd", icon: Github },
  { name: "LinkedIn", href: "https://linkedin.com/in/sahincoder", icon: Linkedin },
  { name: "Twitter", href: "https://twitter.com/sahincoder", icon: Twitter },
];

export const ContactPage = (): JSX.Element => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const contactInfoRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const socialLinksRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const successRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  duration: 0.8,
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
    // Form animation
    if (formRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                formRef.current,
                { opacity: 0, x: -30 },
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.8,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(formRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Info section animation
    if (infoRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                infoRef.current,
                { opacity: 0, x: 30 },
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.8,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(infoRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Contact info items animation
    const items = contactInfoRefs.current.filter(Boolean) as HTMLAnchorElement[];
    if (items.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                items,
                { opacity: 0, y: 20 },
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
      items.forEach((item) => observer.observe(item));
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Social links animation
    const links = socialLinksRefs.current.filter(Boolean) as HTMLAnchorElement[];
    if (links.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                links,
                { opacity: 0, y: 20 },
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
      links.forEach((link) => observer.observe(link));
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Success message animation
    if (successRef.current && isSubmitted) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [isSubmitted]);

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />
      <section className="py-32 relative w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={headerRef} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
              Let's Build Something Amazing Together
            </h1>
            <p className="text-white/70 max-w-xl mx-auto text-lg">
              Have a project in mind? Let's discuss how we can bring your ideas
              to life. I typically respond within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div ref={formRef}>
              <Card className="glass-card glass-card-hover p-6">
                <CardContent className="p-0">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Send me a message
                    </h2>
                    <p className="text-white/70">
                      Fill out the form below and I'll get back to you within 24
                      hours.
                    </p>
                  </div>
                  {isSubmitted ? (
                    <div ref={successRef} className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-white/70">
                        Thank you for your message. I'll get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-white mb-2"
                        >
                          Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          className="bg-[#070707cc] backdrop-blur-[45.94px] border-[0.81px] border-solid border-[#ffffff1a] text-white placeholder-white/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-white mb-2"
                        >
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          className="bg-[#070707cc] backdrop-blur-[45.94px] border-[0.81px] border-solid border-[#ffffff1a] text-white placeholder-white/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-white mb-2"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell me about your project..."
                          rows={5}
                          className="w-full px-4 py-2 rounded-lg border-[0.81px] border-solid border-[#ffffff1a] bg-[#070707cc] backdrop-blur-[45.94px] text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                        />
                      </div>

                      <CTAButton
                        type="submit"
                        variant="primary"
                        className="w-full justify-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181818] mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </CTAButton>
                </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div ref={infoRef} className="space-y-8">
              {/* Contact Details */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">
                  Contact Information
                </h3>

                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <a
                      key={info.title}
                      ref={(el) => {
                        contactInfoRefs.current[index] = el;
                      }}
                      href={info.href}
                    >
                      <Card className="glass-card glass-card-hover p-4">
                        <CardContent className="p-0">
                          <div className="flex items-center space-x-4 group">
                            <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center group-hover:bg-cyan-400/20 transition-colors">
                              <Icon className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {info.title}
                              </div>
                              <div className="text-white/70">{info.value}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Follow Me</h3>

                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.name}
                        ref={(el) => {
                          socialLinksRefs.current[index] = el;
                        }}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Card className="glass-card glass-card-hover p-4">
                          <CardContent className="p-0">
                            <div className="flex items-center space-x-3 group">
                              <Icon className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                              <span className="font-medium text-white">
                                {link.name}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FooterSection />
    </div>
  );
};
