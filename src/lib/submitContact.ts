export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  phone: string;
  budget: string;
  message: string;
  turnstileToken: string | null;
};

export type SubmitContactResult =
  | { ok: true }
  | { ok: false; status: number; message?: string };

export async function submitContactForm(
  payload: ContactPayload,
): Promise<SubmitContactResult> {
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
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    let message: string | undefined;
    try {
      const j = (await res.json()) as { error?: string };
      if (typeof j?.error === "string" && j.error.trim()) message = j.error.trim();
    } catch {
      /* ignore */
    }
    return { ok: false, status: res.status, message };
  } catch {
    return { ok: false, status: 0 };
  }
}
