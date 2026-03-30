import { isAllowedAdminEmail } from "@/admin/lib/authHelpers";
import { supabase } from "@/utils/supabase";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useId, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

export function AdminLoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";
  const formId = useId();
  const errorAlertId = `${formId}-error`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const hasConfig =
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    Boolean(
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
        import.meta.env.VITE_SUPABASE_ANON_KEY,
    );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(
        Boolean(session?.user && isAllowedAdminEmail(session.user)),
      );
      setSessionChecked(true);
    });
  }, []);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 45%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-white/[0.06] border border-white/10 animate-pulse flex items-center justify-center">
            <img
              src="/logo.svg"
              alt=""
              className="h-9 w-9 opacity-40"
              width={36}
              height={36}
            />
          </div>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span>Checking session…</span>
          </div>
        </div>
      </div>
    );
  }

  if (hasSession) {
    return <Navigate to={from === "/admin/login" ? "/admin" : from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    if (!hasConfig) {
      setError("Supabase URL and API key are missing. Check your .env file.");
      return;
    }
    setLoading(true);
    const { data, error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    if (data.user && !isAllowedAdminEmail(data.user)) {
      await supabase.auth.signOut();
      setError("This account is not authorized for admin access.");
      return;
    }
    navigate(from.startsWith("/admin") ? from : "/admin", { replace: true });
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    const addr = email.trim();
    if (!addr) {
      setError("Enter your email address first.");
      return;
    }
    if (!hasConfig) {
      setError("Supabase is not configured.");
      return;
    }
    setResetLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      addr,
      { redirectTo: `${window.location.origin}/admin/login` },
    );
    setResetLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setResetMessage("If an account exists for that email, a reset link has been sent.");
    setForgotOpen(false);
  };

  const combinedError = error ?? null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.12), transparent), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.04), transparent 40%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="w-full max-w-[400px] relative z-10">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/[0.06] border border-white/10 shadow-lg shadow-black/40 mb-5">
            <img
              src="/logo.svg"
              alt="Portfolio logo"
              className="h-10 w-10"
              width={40}
              height={40}
            />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45 mb-2">
            Portfolio
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Sign in to manage posts, media, and analytics.
          </p>
        </header>

        {!hasConfig && (
          <p className="text-amber-300/90 text-sm mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            Add{" "}
            <code className="text-amber-200">VITE_SUPABASE_URL</code> and a key
            to <code className="text-amber-200">.env</code>, then restart the dev
            server.
          </p>
        )}

        {resetMessage && (
          <p
            className="text-sm text-emerald-300/95 mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25"
            role="status"
          >
            {resetMessage}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#141414] to-[#0d0d0d] p-8 shadow-2xl shadow-black/50"
          noValidate
        >
          {combinedError && (
            <p
              id={errorAlertId}
              className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 mb-5"
              role="alert"
            >
              {combinedError}
            </p>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium text-white/55 mb-2"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={Boolean(combinedError)}
                aria-describedby={combinedError ? errorAlertId : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.12]
                  text-white text-sm placeholder:text-white/25
                  focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20
                  transition-[box-shadow,border-color]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium text-white/55"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen((s) => !s);
                    setResetMessage(null);
                  }}
                  className="text-[11px] font-medium text-white/45 hover:text-white/80 transition-colors"
                >
                  {forgotOpen ? "Cancel" : "Forgot password?"}
                </button>
              </div>

              {forgotOpen && (
                <div className="mb-4 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <p className="text-xs text-white/60 mb-3">
                    We&apos;ll email a password reset link to the address above.
                    Add <code className="text-white/80">/admin/login</code> to
                    Supabase Auth redirect URLs if needed.
                  </p>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="w-full py-2 rounded-lg text-xs font-semibold bg-white/10 text-white border border-white/15
                      hover:bg-white/15 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                </div>
              )}

              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-invalid={Boolean(combinedError)}
                  aria-describedby={combinedError ? errorAlertId : undefined}
                  className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.12]
                    text-white text-sm placeholder:text-white/25
                    focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20
                    transition-[box-shadow,border-color]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-[#0a0a0a] text-sm font-semibold
                hover:bg-white/95 active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100
                transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/30"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-white/40">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-white/55 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
