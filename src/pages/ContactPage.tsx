import { CTAButton } from "@/components/CTAButton";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion, useInView } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Github,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Twitter,
  Zap,
} from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

/* ─── Data ──────────────────────────────────────────── */
interface FormData {
  name: string;
  email: string;
  budget: string;
  message: string;
}

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "sahinhub@gmail.com",
    href: "mailto:sahinhub@gmail.com",
    desc: "Best for detailed project briefs",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
    desc: "Available Mon–Fri, 9am–6pm",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "San Francisco, CA",
    href: "#",
    desc: "Open to remote worldwide",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/sahincoderbd",
    icon: Github,
    color: "hover:text-white",
    bg: "hover:bg-white/10",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/sahincoder",
    icon: Linkedin,
    color: "hover:text-blue-400",
    bg: "hover:bg-blue-500/10",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/sahincoder",
    icon: Twitter,
    color: "hover:text-sky-400",
    bg: "hover:bg-sky-500/10",
  },
];

const budgetOptions = [
  "< $500",
  "$500 – $1,500",
  "$1,500 – $5,000",
  "$5,000+",
  "Let's discuss",
];

const faqs = [
  {
    q: "How quickly do you respond?",
    a: "I aim to reply to all inquiries within 24 hours on weekdays.",
  },
  {
    q: "Do you work with international clients?",
    a: "Absolutely — I work fully remote with clients worldwide across time zones.",
  },
  {
    q: "What's your typical project timeline?",
    a: "Depends on scope: landing pages ~1 week, full sites 3–6 weeks, complex apps 2–4 months.",
  },
];

/* ─── Animation helpers ─────────────────────────────── */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

/* ─── Page ───────────────────────────────────────────── */
export const ContactPage = (): JSX.Element => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    budget: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const headerInV = useInView(headerRef, { once: true, margin: "-10%" });
  const formInV = useInView(formRef, { once: true, margin: "-10%" });
  const infoInV = useInView(infoRef, { once: true, margin: "-10%" });
  const faqInV = useInView(faqRef, { once: true, margin: "-10%" });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: "", email: "", budget: "", message: "" });
    setTimeout(() => setIsSubmitted(false), 6000);
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04]
    text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/25
    focus:bg-white/[0.06] transition-all duration-200 h-auto`;

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <section className="w-full pt-40 pb-16 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-20 right-1/4 w-[600px] h-[400px]
          bg-gradient-to-b from-violet-600/8 to-transparent rounded-full blur-3xl"
        />

        <div
          ref={headerRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
              tracking-widest uppercase bg-white/5 border border-white/10 text-white/50 mb-4"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Get in touch
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.05)}
            className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4"
          >
            Let's build something{" "}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              amazing
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.1)}
            className="text-lg text-white/50 max-w-lg mx-auto mb-8"
          >
            Have a project in mind? Tell me about it — I typically respond
            within 24 hours.
          </motion.p>

          {/* Availability badge */}
          <motion.div
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.15)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Available for new projects
          </motion.div>
        </div>
      </section>

      {/* ── MAIN GRID ──────────────────────────────────────── */}
      <section className="w-full pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          {/* Form */}
          <motion.div
            ref={formRef}
            initial="hidden"
            animate={formInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
          >
            <div
              className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b
              from-white/[0.03] to-transparent p-8 md:p-10 overflow-hidden"
            >
              <div
                className="pointer-events-none absolute -top-10 -right-10 w-40 h-40
                bg-violet-600/8 rounded-full blur-2xl"
              />

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.37, 0.04, 0.29, 1.01] }}
                  className="flex flex-col items-center justify-center py-16 gap-4 text-center"
                >
                  <div
                    className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20
                    flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Message sent!
                  </h3>
                  <p className="text-white/50 max-w-sm">
                    Thanks for reaching out. I'll review your message and get
                    back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
                    Send a message
                  </h2>
                  <p className="text-sm text-white/40 mb-8">
                    Fill in the details below — the more context, the better.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                          Full name
                        </label>
                        <Input
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                          Email address
                        </label>
                        <Input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@company.com"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                        Budget range
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {budgetOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setFormData((p) => ({ ...p, budget: opt }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                              ${
                                formData.budget === opt
                                  ? "bg-violet-500/20 border border-violet-500/40 text-violet-300"
                                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20"
                              }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                        Tell me about your project
                      </label>
                      <textarea
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Describe your project, goals, and any specific requirements…"
                        rows={5}
                        className={`${inputClass} resize-none`}
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
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181818]" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send message
                        </>
                      )}
                    </CTAButton>
                  </form>
                </>
              )}
            </div>
          </motion.div>

          {/* Sidebar info */}
          <motion.div
            ref={infoRef}
            initial="hidden"
            animate={infoInV ? "visible" : "hidden"}
            variants={fadeUp(0.1)}
            className="space-y-5"
          >
            {/* Contact methods */}
            <div className="space-y-3">
              {contactInfo.map((info, i) => {
                const Icon = info.icon;
                return (
                  <motion.a
                    key={info.title}
                    href={info.href}
                    initial="hidden"
                    animate={infoInV ? "visible" : "hidden"}
                    variants={fadeUp(0.1 + i * 0.07)}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${info.border}
                      bg-gradient-to-br from-white/[0.02] to-transparent
                      hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200 group`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${info.bg} border ${info.border}
                      flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${info.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-0.5">
                        {info.title}
                      </p>
                      <p className="text-sm font-medium text-white group-hover:text-white/90 transition-colors">
                        {info.value}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {info.desc}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Response time card */}
            <motion.div
              initial="hidden"
              animate={infoInV ? "visible" : "hidden"}
              variants={fadeUp(0.3)}
              className="p-5 rounded-xl border border-white/[0.07] bg-white/[0.02]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">
                  Response time
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                I reply to all messages within{" "}
                <span className="text-white font-medium">24 hours</span> on
                weekdays. Urgent? Drop a line directly to my email.
              </p>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial="hidden"
              animate={infoInV ? "visible" : "hidden"}
              variants={fadeUp(0.35)}
            >
              <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
                Find me online
              </p>
              <div className="flex gap-2">
                {socialLinks.map(({ name, href, icon: Icon, color, bg }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={name}
                    className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10
                      flex items-center justify-center text-white/40 ${color} ${bg}
                      border-white/10 transition-all duration-200`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial="hidden"
              animate={infoInV ? "visible" : "hidden"}
              variants={fadeUp(0.4)}
              className="p-5 rounded-xl border border-violet-500/20
                bg-gradient-to-br from-violet-500/8 to-transparent"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">
                  Quick start
                </span>
              </div>
              <p className="text-sm text-white/50 mb-4 leading-relaxed">
                Not sure what to say? Book a free 30-min discovery call — no
                pitch, just an honest conversation.
              </p>
              <CTAButton
                href="/contact"
                variant="secondary"
                className="w-full justify-center text-xs"
              >
                Schedule a call
              </CTAButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="w-full pb-28">
        <div
          ref={faqRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl"
        >
          <motion.div
            initial="hidden"
            animate={faqInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Common questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial="hidden"
                animate={faqInV ? "visible" : "hidden"}
                variants={fadeUp(i * 0.08)}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left
                    hover:bg-white/[0.02] transition-colors duration-200"
                >
                  <span className="font-medium text-white/80 text-sm pr-4">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/30 flex-shrink-0 text-lg leading-none"
                  >
                    +
                  </motion.span>
                </button>

                <motion.div
                  animate={{
                    height: openFaq === i ? "auto" : 0,
                    opacity: openFaq === i ? 1 : 0,
                  }}
                  initial={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-white/40 leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};
