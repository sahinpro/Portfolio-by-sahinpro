import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const { error } = await admin.from("contact_submissions").insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || null,
      phone: phone?.trim() || null,
      budget: budget.trim(),
      message: message.trim(),
      status: "unread",
    });

    if (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: "Save failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
