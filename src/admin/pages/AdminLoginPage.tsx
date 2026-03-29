import { isAllowedAdminEmail } from "@/admin/lib/authHelpers";
import { supabase } from "@/utils/supabase";
import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

export function AdminLoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50 text-sm">
        Loading…
      </div>
    );
  }

  if (hasSession) {
    return <Navigate to={from === "/admin/login" ? "/admin" : from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">
          Portfolio
        </p>
        <h1 className="text-2xl font-semibold text-white mb-6">Admin sign in</h1>

        {!hasConfig && (
          <p className="text-amber-300/90 text-sm mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            Add{" "}
            <code className="text-amber-200">VITE_SUPABASE_URL</code> and a key
            to <code className="text-amber-200">.env</code>, then restart the dev
            server.
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6 rounded-2xl border border-white/[0.08] bg-[#111]"
        >
          {error && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium text-white/50 mb-1.5"
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
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/10
                text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20"
            />
          </div>
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-white/50 mb-1.5"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/10
                text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-white text-[#0a0a0a] text-sm font-semibold
              hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          <Link to="/" className="text-white/60 hover:text-white underline-offset-2">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
