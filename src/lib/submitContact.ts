import { getSupabaseBrowserKey, getSupabaseProjectUrl } from "@/lib/supabaseFunctions";

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  phone: string;
  budget: string;
  message: string;
  turnstileToken: string | null;
};

export async function submitContactToSupabase(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; status: number }> {
  const base = getSupabaseProjectUrl();
  const key = getSupabaseBrowserKey();
  if (!base || !key) return { ok: false, status: 0 };

  const body: Record<string, string | undefined> = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    subject: payload.subject.trim() || undefined,
    phone: payload.phone.trim() || undefined,
    budget: payload.budget.trim(),
    message: payload.message.trim(),
    turnstileToken: payload.turnstileToken ?? undefined,
  };

  try {
    const res = await fetch(`${base}/functions/v1/submit-contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        apikey: key,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    return { ok: false, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
