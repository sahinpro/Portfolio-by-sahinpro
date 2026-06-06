import { slugify } from "./lib/slug";

export const config = {
  runtime: "edge",
};

const SITE_URL = "https://sahin.pro.bd";

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

function getSiteUrl(): string {
  return SITE_URL;
}

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!url?.trim() || !key?.trim()) return null;
  return { url: url.replace(/\/$/, ""), key: key.trim() };
}

function toIsoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderUrl(entry: SitemapEntry): string {
  const parts = [`<loc>${escapeXml(entry.loc)}</loc>`];
  if (entry.lastmod) parts.push(`<lastmod>${entry.lastmod}</lastmod>`);
  if (entry.changefreq) parts.push(`<changefreq>${entry.changefreq}</changefreq>`);
  if (entry.priority !== undefined) parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
  return `<url>${parts.join("")}</url>`;
}

async function fetchDynamicEntries(siteUrl: string): Promise<SitemapEntry[]> {
  const supabase = getSupabaseConfig();
  if (!supabase) return [];

  const headers = {
    apikey: supabase.key,
    Authorization: `Bearer ${supabase.key}`,
  };

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

  const entries: SitemapEntry[] = [];

  if (projectsRes.ok) {
    const projects = (await projectsRes.json()) as Array<{
      title: string;
      updated_at: string | null;
    }>;
    for (const project of projects) {
      entries.push({
        loc: `${siteUrl}/projects/${slugify(project.title)}`,
        lastmod: toIsoDate(project.updated_at),
        changefreq: "monthly",
        priority: 0.7,
      });
    }
  }

  if (blogsRes.ok) {
    const posts = (await blogsRes.json()) as Array<{
      slug: string;
      updated_at: string | null;
      published_at: string | null;
    }>;
    for (const post of posts) {
      entries.push({
        loc: `${siteUrl}/blogs/${post.slug}`,
        lastmod: toIsoDate(post.updated_at ?? post.published_at),
        changefreq: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}

export default async function handler(): Promise<Response> {
  const siteUrl = getSiteUrl();
  const today = new Date().toISOString().slice(0, 10);

  const staticEntries: SitemapEntry[] = [
    { loc: `${siteUrl}/`, lastmod: today, changefreq: "weekly", priority: 1.0 },
    { loc: `${siteUrl}/about`, lastmod: today, changefreq: "monthly", priority: 0.9 },
    { loc: `${siteUrl}/projects`, lastmod: today, changefreq: "weekly", priority: 0.9 },
    { loc: `${siteUrl}/services`, lastmod: today, changefreq: "monthly", priority: 0.8 },
    { loc: `${siteUrl}/blogs`, lastmod: today, changefreq: "weekly", priority: 0.8 },
    { loc: `${siteUrl}/contact`, lastmod: today, changefreq: "monthly", priority: 0.7 },
  ];

  let dynamicEntries: SitemapEntry[] = [];
  try {
    dynamicEntries = await fetchDynamicEntries(siteUrl);
  } catch {
    dynamicEntries = [];
  }

  const urls = [...staticEntries, ...dynamicEntries].map(renderUrl).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
