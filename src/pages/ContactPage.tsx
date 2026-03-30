import errorAnimationData from "@/assets/lottie/error.json";
import successAnimationData from "@/assets/lottie/success.json";
import { CTAButton } from "@/components/CTAButton";
import Header from "@/components/Header";
import { PublicSeo } from "@/components/public/PublicSeo";
import { SocialLinksRow } from "@/components/public/SocialLinksRow";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { submitContactToSupabase } from "@/lib/submitContact";
import { isSupabaseBrowserConfigured } from "@/lib/supabaseFunctions";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion, useInView } from "framer-motion";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import {
  CheckIcon,
  ChevronsUpDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";
import type { ComponentType } from "react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { BsWhatsapp } from "react-icons/bs";
import { isValidPhoneNumber } from "react-phone-number-input";
import Turnstile from "react-turnstile";

const CALENDLY_POPUP_URL =
  "https://calendly.com/sahinhub/15-min-one-by-one-meeting?hide_landing_page_details=1&background_color=1a1a1a&text_color=ffffff";

interface FormData {
  name: string;
  email: string;
  subject: string;
  phone: string;
  budget: string;
  message: string;
}

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "sahinhub@gmail.com",
    href: "mailto:sahinhub@gmail.com",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: BsWhatsapp,
    title: "Chat on WhatsApp",
    value: "+8801791992313",
    desc: "WhatsApp is the best way to get in touch with me.",
    href: "tel:+8801791992313",
    color: "text-green-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Sunamganj, Sylhet, Bangladesh",
    href: "#",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

const budgetOptions = [
  "< $500",
  "$500 – $1,500",
  "$1,500 – $5,000",
  "$5,000+",
  "Let's discuss",
];

const CONTACT_FORM_SUCCESS_DATE_KEY = "contact_form_success_date";

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hasAlreadySubmittedToday(): boolean {
  try {
    const stored = localStorage.getItem(CONTACT_FORM_SUCCESS_DATE_KEY);
    return stored === getTodayDateString();
  } catch {
    return false;
  }
}

function markSubmittedToday(): void {
  try {
    localStorage.setItem(CONTACT_FORM_SUCCESS_DATE_KEY, getTodayDateString());
  } catch {
    /* ignore */
  }
}

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

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

const SUCCESS_SPEED = 1;
const ERROR_SPEED = 1;
const SUCCESS_SEGMENT: [number, number] = [0, 354];
const ERROR_SEGMENT: [number, number] = [0, 21];

function SuccessLottie() {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  return (
    <div className="w-[180px] h-[180px] shrink-0 flex items-center justify-center">
      <Lottie
        lottieRef={lottieRef}
        animationData={successAnimationData}
        loop={false}
        autoplay
        initialSegment={SUCCESS_SEGMENT}
        onDOMLoaded={() => {
          lottieRef.current?.setSpeed(SUCCESS_SPEED);
          lottieRef.current?.play();
        }}
        style={{ width: 180, height: 180 }}
      />
    </div>
  );
}

function ErrorLottie() {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  return (
    <div className="w-[100px] h-[100px] shrink-0 flex items-center justify-center mx-auto">
      <Lottie
        lottieRef={lottieRef}
        animationData={errorAnimationData}
        loop={false}
        autoplay
        initialSegment={ERROR_SEGMENT}
        onDOMLoaded={() => {
          lottieRef.current?.setSpeed(ERROR_SPEED);
          lottieRef.current?.play();
        }}
        style={{ width: 100, height: 100 }}
      />
    </div>
  );
}

export const ContactPage = (): JSX.Element => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    phone: "",
    budget: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedJustNow, setSubmittedJustNow] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as
    | string
    | undefined;
  const formEndpoint = import.meta.env.VITE_CONTACT_FORM_ID
    ? `https://formspree.io/f/${import.meta.env.VITE_CONTACT_FORM_ID}`
    : null;

  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const headerInV = useInView(headerRef, { once: true, margin: "-10%" });
  const formInV = useInView(formRef, { once: true, margin: "-10%" });
  const infoInV = useInView(infoRef, { once: true, margin: "-10%" });
  const faqInV = useInView(faqRef, { once: true, margin: "-10%" });

  useEffect(() => {
    if (hasAlreadySubmittedToday()) {
      setIsSubmitted(true);
      setSubmittedJustNow(false);
    }
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setSubmitError(null);

    const missing = [];
    if (!formData.name.trim()) missing.push("Full name");
    if (!formData.email.trim()) missing.push("Email");
    if (!formData.budget.trim()) missing.push("Budget range");
    if (!formData.message.trim()) missing.push("Message");
    if (missing.length) {
      setSubmitError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      setPhoneError("Invalid phone number");
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setSubmitError("Please complete the verification check.");
      return;
    }
    if (hasAlreadySubmittedToday()) {
      setSubmitError(
        "You can only send one message per day. Try again tomorrow.",
      );
      return;
    }

    setIsSubmitting(true);

    const formspreePayload: Record<string, string | undefined> = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      phone: formData.phone || undefined,
      budget: formData.budget,
      message: formData.message,
    };
    if (turnstileToken) {
      formspreePayload["cf-turnstile-response"] = turnstileToken;
    }

    const applySuccess = () => {
      setFormData({
        name: "",
        email: "",
        subject: "",
        phone: "",
        budget: "",
        message: "",
      });
      markSubmittedToday();
      setSubmittedJustNow(true);
      setIsSubmitted(true);
      setIsSubmitting(false);
    };

    const postFormspree = async (): Promise<boolean> => {
      if (!formEndpoint) return false;
      try {
        const res = await fetch(formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formspreePayload),
        });
        return res.ok;
      } catch {
        return false;
      }
    };

    if (isSupabaseBrowserConfigured()) {
      const r = await submitContactToSupabase({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        phone: formData.phone,
        budget: formData.budget,
        message: formData.message,
        turnstileToken,
      });
      if (!r.ok) {
        const detail =
          r.message ??
          (r.status === 400
            ? "The server could not accept this submission (check required fields or verification)."
            : r.status === 401 || r.status === 403
              ? "Submission was rejected. Check Supabase function secrets (e.g. Turnstile)."
              : null);
        setSubmitError(
          detail ??
            "Message was not saved to your admin inbox. Redeploy the `submit-contact` Edge Function and confirm `SUPABASE_SERVICE_ROLE_KEY` is set for that function.",
        );
        setTurnstileToken(null);
        setIsSubmitting(false);
        return;
      }
      applySuccess();
      if (formEndpoint) {
        void postFormspree();
      }
      return;
    }

    if (formEndpoint) {
      const ok = await postFormspree();
      if (ok) {
        applySuccess();
        return;
      }
      setSubmitError(
        "Message not sent. Please try again or email me directly.",
      );
      setTurnstileToken(null);
      setIsSubmitting(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 1200));
    applySuccess();
  };

  const inputClass = `w-full px-4 py-3 sm:py-2.5 rounded-xl border border-white/10 bg-white/[0.04]
    text-white text-base sm:text-sm placeholder-white/25 focus:outline-none focus:border-white/25
    focus:bg-white/[0.06] transition-all duration-200 h-auto min-h-[44px]`;

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <PublicSeo />
      <Header />

      <section className="w-full pt-28 sm:pt-36 lg:pt-40 pb-10 sm:pb-16 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-20 right-1/4 w-[600px] h-[400px]
          bg-gradient-to-b from-violet-600/8 to-transparent rounded-full blur-3xl"
        />

        <div
          ref={headerRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-full"
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
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-3 sm:mb-4"
          >
            Let's build something{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-800 bg-clip-text text-transparent">
              amazing
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.1)}
            className="text-base sm:text-lg text-white/50 max-w-lg mx-auto mb-6 sm:mb-8 px-1"
          >
            Have a project in mind? Tell me about it — I typically respond
            within 24 hours.
          </motion.p>

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

      <section className="container mx-auto px-3 lg:px-4 pb-16 sm:pb-24">
        <div className=" lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-10 max-w-full">
          {/* Form */}
          <motion.div
            id="contact-form"
            ref={formRef}
            initial="hidden"
            animate={formInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
            className="min-w-0"
          >
            <div
              className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b
              from-white/[0.03] to-transparent p-5 sm:p-6 md:p-8 lg:p-7 overflow-hidden"
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
                  <SuccessLottie />
                  <h3 className="text-2xl font-bold text-white">
                    {submittedJustNow ? "Message sent!" : "Already sent today"}
                  </h3>
                  <p className="text-white/50 text-sm sm:text-base max-w-sm">
                    {submittedJustNow
                      ? "Thanks for reaching out. I'll get back to you within 24 hours."
                      : "You've already sent a message today. You can send another tomorrow."}
                  </p>
                </motion.div>
              ) : (
                <>
                  <h2 className="flex lg:py-5 py-2 self-stretch mt-[-1.00px] section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-3xl sm:text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.00px] leading-tight sm:leading-[40px] md:leading-[48px] lg:leading-[50px]">
                    Send a message
                  </h2>
                  <p className="text-sm text-white/40 mb-6 sm:mb-8">
                    Fill in the details below — the more context, the better.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-5"
                  >
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
                          placeholder="Sahin Alam"
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
                          placeholder="sahinhub@gmail.com"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="subject"
                        className="text-xs font-semibold text-white/50 uppercase tracking-widest"
                      >
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="e.g. Website project, Brand design, Consultation…"
                        className={inputClass}
                      />
                    </div>

                    {/* Phone + Budget (50% each, inline) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 w-full min-w-0">
                        <label
                          htmlFor="phone"
                          className="text-xs font-semibold text-white/50 uppercase tracking-widest"
                        >
                          Phone number
                        </label>
                        <PhoneInput
                          id="phone"
                          value={formData.phone}
                          onChange={(val: string | undefined) => {
                            setFormData((p) => ({ ...p, phone: val ?? "" }));
                            if (phoneError && val && isValidPhoneNumber(val))
                              setPhoneError(null);
                          }}
                          placeholder="Enter a phone number"
                          defaultCountry="BD"
                          error={phoneError ?? undefined}
                          numberInputProps={{
                            className:
                              "text-white placeholder:text-white/25 focus:outline-none",
                          }}
                        />
                      </div>
                      <div className="space-y-1.5 w-full min-w-0">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                          Budget range
                        </label>
                        <Popover open={budgetOpen} onOpenChange={setBudgetOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={`${inputClass} w-full flex items-center justify-between cursor-pointer text-left`}
                              aria-label="Budget range"
                              aria-haspopup="listbox"
                              aria-expanded={budgetOpen}
                            >
                              <span
                                className={
                                  formData.budget
                                    ? "text-white"
                                    : "text-white/40"
                                }
                              >
                                {formData.budget || "Select budget"}
                              </span>
                              <ChevronsUpDown className="h-4 w-4 shrink-0 text-white/40" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] min-w-[260px] max-w-[calc(100vw-2rem)] p-1 border-white/10 bg-[#0d0d0d] text-white rounded-xl shadow-xl shadow-black/40"
                            align="start"
                            sideOffset={4}
                          >
                            <ul
                              className="max-h-[240px] overflow-y-auto py-1 touch-pan-y"
                              role="listbox"
                            >
                              {budgetOptions.map((opt) => {
                                const isSelected = formData.budget === opt;
                                return (
                                  <li key={opt}>
                                    <button
                                      type="button"
                                      role="option"
                                      aria-selected={isSelected}
                                      className={`w-full flex items-center justify-between rounded-lg px-3 py-3 sm:py-2.5 text-sm text-left transition-colors min-h-[44px] sm:min-h-0
                                        text-white/90 hover:bg-white/10 hover:text-white active:bg-white/10
                                        ${isSelected ? "bg-white/10 text-white" : ""}`}
                                      onClick={() => {
                                        setFormData((p) => ({
                                          ...p,
                                          budget: opt,
                                        }));
                                        setBudgetOpen(false);
                                      }}
                                    >
                                      {opt}
                                      {isSelected && (
                                        <CheckIcon className="h-4 w-4 shrink-0 text-violet-400" />
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </PopoverContent>
                        </Popover>
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
                        className={`${inputClass} resize-none min-h-[120px] sm:min-h-0`}
                      />
                    </div>

                    {turnstileSiteKey && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                          Verification
                        </span>
                        <Turnstile
                          sitekey={turnstileSiteKey}
                          theme="dark"
                          onVerify={setTurnstileToken}
                          onExpire={() => setTurnstileToken(null)}
                          onError={() => setTurnstileToken(null)}
                        />
                      </div>
                    )}

                    {submitError && (
                      <div className="flex flex-col items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3">
                        <ErrorLottie />
                        <p className="text-sm text-rose-400 text-center">
                          {submitError}
                        </p>
                      </div>
                    )}

                    <CTAButton
                      type="submit"
                      variant="primary"
                      className="w-full justify-center min-h-[44px] py-3 sm:py-2.5 text-base sm:text-sm"
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
            className="space-y-4 sm:space-y-5 min-w-0 lg:max-w-[380px]"
          >
            {/* Contact methods */}
            <div className="space-y-4">
              {contactInfo.map((info, i) => {
                const Icon = info.icon as ComponentType<{ className?: string }>;
                return (
                  <motion.a
                    key={info.title}
                    href={info.href}
                    initial="hidden"
                    animate={infoInV ? "visible" : "hidden"}
                    variants={fadeUp(0.1 + i * 0.07)}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${info.border}
                      bg-gradient-to-br from-white/[0.02] to-transparent
                      hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200 group min-h-[44px] sm:min-h-0`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${info.bg} border ${info.border}
                      flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${info.color}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-0.5">
                        {info.title}
                      </p>
                      <p className="text-sm font-medium text-white group-hover:text-white/90 transition-colors">
                        {info.value}
                      </p>
                      <p className="text-xs text-white/50">{info.desc}</p>
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
                I reply to all messages{" "}
                <span className="text-white font-medium"> ASAP</span>. Urgent?
                Drop a line directly to my email.
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
              <SocialLinksRow size="contact" />
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial="hidden"
              animate={infoInV ? "visible" : "hidden"}
              variants={fadeUp(0.4)}
              className="p-5 rounded-xl border border-violet-500/20
                bg-gradient-to-br from-violet-500/8 to-transparent"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg"
                  alt="Google Meet"
                  className="w-5 h-5 object-contain"
                />
                <span className="text-sm font-semibold text-white">
                  Quick start
                </span>
              </div>
              <p className="text-sm text-white/50 mb-4 leading-relaxed">
                Prefer to talk? Schedule a free 15-minute Google Meet — no
                pitch, no pressure, just an honest conversation.
              </p>
              <CTAButton
                type="button"
                variant="secondary"
                className="w-full justify-center text-xs"
                onClick={() => {
                  window.Calendly?.initPopupWidget({
                    url: CALENDLY_POPUP_URL,
                  });
                }}
              >
                Schedule your free Google Meet
              </CTAButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

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
