import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = "https://www.sahinpro.me";
const OUTPUT = resolve("public/sitemap.xml");
const PROFILE_IMAGE = `${SITE_URL}/sahin.jpg`;
const PROFILE_IMAGE_TITLE = "Sahin Alam — Full Stack Developer · React · Next.js · WordPress";

function loadLocalEnv() {
  try {
    const text = readFileSync(".env", "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // .env is optional locally; Vercel injects env at build time.
  }
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toIsoDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderImage(image) {
  const parts = [`<image:loc>${escapeXml(image.loc)}</image:loc>`];
  if (image.title) parts.push(`<image:title>${escapeXml(image.title)}</image:title>`);
  if (image.caption) parts.push(`<image:caption>${escapeXml(image.caption)}</image:caption>`);
  return `<image:image>${parts.join("")}</image:image>`;
}

function renderUrl(entry) {
  const parts = [`<loc>${escapeXml(entry.loc)}</loc>`];
  if (entry.lastmod) parts.push(`<lastmod>${entry.lastmod}</lastmod>`);
  if (entry.changefreq) parts.push(`<changefreq>${entry.changefreq}</changefreq>`);
  if (entry.priority !== undefined) {
    parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
  }
  for (const image of entry.images ?? []) {
    parts.push(renderImage(image));
  }
  return `<url>${parts.join("")}</url>`;
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  // Build-time script: the service-role key bypasses RLS, which is required
  // because anon reads on `projects` depend on public.is_admin() EXECUTE grants.
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!url?.trim() || !key?.trim()) return null;
  return { url: url.replace(/\/$/, ""), key: key.trim() };
}

async function fetchDynamicEntries() {
  const config = getSupabaseConfig();
  if (!config) return [];

  try {
    // Same slug normalization as src/lib/projectPaths.ts → projectSlugFromTitle (slugify of title).
    const res = await fetch(
      `${config.url}/rest/v1/projects?select=title,updated_at&status=eq.published&order=updated_at.desc`,
      {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
        },
      },
    );
    if (!res.ok) return [];

    const rows = await res.json();
    const seen = new Set();
    return (Array.isArray(rows) ? rows : [])
      .map((row) => {
        const slug = slugify(String(row?.title ?? ""));
        if (!slug || seen.has(slug)) return null;
        seen.add(slug);
        return {
          loc: `${SITE_URL}/projects/${slug}`,
          lastmod: toIsoDate(row.updated_at),
          changefreq: "monthly",
          priority: 0.6,
        };
      })
      .filter(Boolean);
  } catch {
    // Network/schema failures must not break sitemap generation.
    return [];
  }
}

async function main() {
  loadLocalEnv();

  const today = new Date().toISOString().slice(0, 10);
  const profileImageEntry = {
    loc: PROFILE_IMAGE,
    title: PROFILE_IMAGE_TITLE,
    caption: PROFILE_IMAGE_TITLE,
  };

  const staticEntries = [
    {
      loc: `${SITE_URL}/`,
      lastmod: today,
      changefreq: "weekly",
      priority: 1.0,
      images: [profileImageEntry],
    },
    {
      loc: `${SITE_URL}/about`,
      lastmod: today,
      changefreq: "monthly",
      priority: 0.9,
      images: [profileImageEntry],
    },
    { loc: `${SITE_URL}/projects`, lastmod: today, changefreq: "weekly", priority: 0.9 },
    { loc: `${SITE_URL}/services`, lastmod: today, changefreq: "monthly", priority: 0.8 },
    { loc: `${SITE_URL}/contact`, lastmod: today, changefreq: "monthly", priority: 0.7 },
  ];

  const dynamicEntries = await fetchDynamicEntries();
  const allEntries = [...staticEntries, ...dynamicEntries];
  const urls = allEntries.map(renderUrl).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;

  writeFileSync(OUTPUT, xml, "utf8");
  console.log(`Generated ${OUTPUT} (${allEntries.length} URLs)`);
}

main();
