import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ContactSubmission = {
  name: string;
  email: string;
  subject: string | null;
  phone: string | null;
  budget: string;
  message: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nl2br(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

async function sendResendNotification(
  submission: ContactSubmission,
): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const toEmail = Deno.env.get("CONTACT_NOTIFICATION_TO_EMAIL");
  const fromEmail =
    Deno.env.get("CONTACT_NOTIFICATION_FROM_EMAIL") ?? "Portfolio Contact <onboarding@resend.dev>";

  if (!resendApiKey || !toEmail) {
    return;
  }

  const resend = new Resend(resendApiKey);

  const subjectLine = submission.subject?.trim()
    ? `New contact: ${submission.subject.trim()}`
    : `New contact from ${submission.name}`;

  const previewLine = submission.subject?.trim()
    ? `${submission.name} sent a new inquiry about "${submission.subject.trim()}".`
    : `${submission.name} sent a new portfolio inquiry.`;

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(subjectLine)}</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
          ${escapeHtml(previewLine)}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;margin:0;padding:24px 0;width:100%;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:680px;">
                <tr>
                  <td style="padding:0 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#111827;border-radius:20px;overflow:hidden;">
                      <tr>
                        <td style="padding:28px 32px;background:linear-gradient(135deg,#111827 0%,#1f2937 100%);">
                          <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.1);font-size:12px;line-height:1;color:#e5e7eb;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">
                            New Contact Lead
                          </div>
                          <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2;color:#ffffff;font-weight:700;">
                            ${escapeHtml(submission.subject?.trim() || "New portfolio contact submission")}
                          </h1>
                          <p style="margin:0;font-size:15px;line-height:1.7;color:#d1d5db;">
                            ${escapeHtml(previewLine)}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;">
                      <tr>
                        <td style="padding:28px 32px 20px;">
                          <h2 style="margin:0 0 20px;font-size:18px;line-height:1.3;color:#111827;">Contact details</h2>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding:0 0 16px;vertical-align:top;width:50%;">
                                <div style="font-size:12px;line-height:1;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:8px;">Name</div>
                                <div style="font-size:16px;line-height:1.5;color:#111827;font-weight:600;">${escapeHtml(submission.name)}</div>
                              </td>
                              <td style="padding:0 0 16px;vertical-align:top;width:50%;">
                                <div style="font-size:12px;line-height:1;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:8px;">Email</div>
                                <div style="font-size:16px;line-height:1.5;">
                                  <a href="mailto:${escapeHtml(submission.email)}" style="color:#2563eb;text-decoration:none;font-weight:600;">
                                    ${escapeHtml(submission.email)}
                                  </a>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:0 0 16px;vertical-align:top;width:50%;">
                                <div style="font-size:12px;line-height:1;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:8px;">Phone</div>
                                <div style="font-size:15px;line-height:1.5;color:#111827;">
                                  ${escapeHtml(submission.phone ?? "Not provided")}
                                </div>
                              </td>
                              <td style="padding:0 0 16px;vertical-align:top;width:50%;">
                                <div style="font-size:12px;line-height:1;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:8px;">Budget</div>
                                <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:#eef2ff;color:#3730a3;font-size:14px;line-height:1;font-weight:700;">
                                  ${escapeHtml(submission.budget)}
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding:0;vertical-align:top;">
                                <div style="font-size:12px;line-height:1;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:8px;">Subject</div>
                                <div style="font-size:15px;line-height:1.6;color:#111827;">
                                  ${escapeHtml(submission.subject ?? "Not provided")}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;">
                      <tr>
                        <td style="padding:28px 32px;">
                          <h2 style="margin:0 0 16px;font-size:18px;line-height:1.3;color:#111827;">Message</h2>
                          <div style="padding:18px 20px;border-radius:16px;background:#f9fafb;border:1px solid #e5e7eb;font-size:15px;line-height:1.8;color:#1f2937;">
                            ${nl2br(submission.message)}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                      <tr>
                        <td style="padding:0 4px;">
                          <p style="margin:0;font-size:12px;line-height:1.7;color:#6b7280;text-align:center;">
                            Sent from your portfolio contact form. Reply directly to this email to respond to
                            ${" "}
                            ${escapeHtml(submission.name)}.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    replyTo: submission.email,
    subject: subjectLine,
    html,
  });

  if (error) {
    throw new Error(`Resend request failed: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    // Hosted Edge Functions inject SUPABASE_SERVICE_ROLE_KEY; CLI cannot set SUPABASE_* secrets.
    // For a manual secret use: npx supabase secrets set SERVICE_ROLE_KEY=<service_role from dashboard>
    const serviceKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error(
        "submit-contact: missing SUPABASE_URL or service role key. " +
          "On Supabase Cloud, SUPABASE_SERVICE_ROLE_KEY is injected automatically after deploy. " +
          "Otherwise set: npx supabase secrets set SERVICE_ROLE_KEY=<Project Settings → API → service_role>",
      );
      return new Response(JSON.stringify({ error: "Save failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      name,
      email,
      subject,
      phone,
      budget,
      message,
      turnstileToken,
    } = body as Record<string, string | undefined>;

    if (!name?.trim() || !email?.trim() || !budget?.trim() || !message?.trim()) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (turnstileSecret) {
      if (!turnstileToken) {
        return new Response(JSON.stringify({ error: "Verification required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const verify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: turnstileToken,
          }),
        },
      );
      const outcome = await verify.json();
      if (!outcome.success) {
        return new Response(JSON.stringify({ error: "Verification failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const submission: ContactSubmission = {
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || null,
      phone: phone?.trim() || null,
      budget: budget.trim(),
      message: message.trim(),
    };

    const { error } = await admin.from("contact_submissions").insert({
      ...submission,
      status: "unread",
    });

    if (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: "Save failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      await sendResendNotification(submission);
    } catch (emailError) {
      console.error("submit-contact: resend notification failed", emailError);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
