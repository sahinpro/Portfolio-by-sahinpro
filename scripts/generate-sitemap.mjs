import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = "https://sahin.pro.bd";
const OUTPUT = resolve("public/sitemap.xml");

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

function renderUrl(entry) {
  const parts = [`<loc>${escapeXml(entry.loc)}</loc>`];
  if (entry.lastmod) parts.push(`<lastmod>${entry.lastmod}</lastmod>`);
  if (entry.changefreq) parts.push(`<changefreq>${entry.changefreq}</changefreq>`);
  if (entry.priority !== undefined) {
    parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
  }
  return `<url>${parts.join("")}</url>`;
}

function getSupabaseConfig() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!url?.trim() || !key?.trim()) return null;
  return { url: url.replace(/\/$/, ""), key: key.trim() };
}

async function fetchDynamicEntries() {
  const supabase = getSupabaseConfig();
  if (!supabase) return [];

  const headers = {
    apikey: supabase.key,
    Authorization: `Bearer ${supabase.key}`,
  };

  const entries = [];

  try {
    const [projectsRes, blogsRes] = await Promise.all([
      fetch(
        `${supabase.url}/rest/v1/projects?status=eq.published&select=title,updated_at&order=sort_order.asc`,
        { headers },
      ),
      fetch(
        `${supabase.url}/rest/v1/blog_posts?status=eq.published&select=slug,updated_at,published_at&order=published_at.desc`,
        { headers },
      ),
    ]);

    if (projectsRes.ok) {
      const projects = await projectsRes.json();
      for (const project of projects) {
        entries.push({
          loc: `${SITE_URL}/projects/${slugify(project.title)}`,
          lastmod: toIsoDate(project.updated_at),
          changefreq: "monthly",
          priority: 0.7,
        });
      }
    }

    if (blogsRes.ok) {
      const posts = await blogsRes.json();
      for (const post of posts) {
        entries.push({
          loc: `${SITE_URL}/blogs/${post.slug}`,
          lastmod: toIsoDate(post.updated_at ?? post.published_at),
          changefreq: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // Static pages still ship if Supabase is unreachable at build time.
  }

  return entries;
}

async function main() {
  loadLocalEnv();

  const today = new Date().toISOString().slice(0, 10);
  const staticEntries = [
    { loc: `${SITE_URL}/`, lastmod: today, changefreq: "weekly", priority: 1.0 },
    { loc: `${SITE_URL}/about`, lastmod: today, changefreq: "monthly", priority: 0.9 },
    { loc: `${SITE_URL}/projects`, lastmod: today, changefreq: "weekly", priority: 0.9 },
    { loc: `${SITE_URL}/services`, lastmod: today, changefreq: "monthly", priority: 0.8 },
    { loc: `${SITE_URL}/blogs`, lastmod: today, changefreq: "weekly", priority: 0.8 },
    { loc: `${SITE_URL}/contact`, lastmod: today, changefreq: "monthly", priority: 0.7 },
  ];

  const dynamicEntries = await fetchDynamicEntries();
  const allEntries = [...staticEntries, ...dynamicEntries];
  const urls = allEntries.map(renderUrl).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  writeFileSync(OUTPUT, xml, "utf8");
  console.log(`Generated ${OUTPUT} (${allEntries.length} URLs)`);
}

main();
