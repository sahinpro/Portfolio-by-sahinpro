import { slugify } from "@/admin/lib/slug";
import fs from "fs/promises";
import path from "path";

const ROOT = path.join(process.cwd(), "content", "challenges");

export type ChallengeSummary = {
  slug: string;
  title: string;
  updatedAt: string;
};

export type ChallengeFile = ChallengeSummary & {
  html: string;
};

function assertSlug(slug: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid challenge name");
  }
  return slug;
}

function challengeDir(slug: string): string {
  return path.join(ROOT, assertSlug(slug));
}

export function titleFromHtml(html: string, fallback: string): string {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1?.[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (h1Text) return h1Text;
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleText = title?.[1]?.replace(/\s+/g, " ").trim();
  if (titleText) return titleText;
  return fallback;
}

async function readTitle(dir: string, html: string, slug: string): Promise<string> {
  try {
    const raw = await fs.readFile(path.join(dir, "meta.json"), "utf8");
    const parsed = JSON.parse(raw) as { title?: string };
    if (parsed.title?.trim()) return parsed.title.trim();
  } catch {
    /* meta is optional */
  }
  return titleFromHtml(html, slug);
}

export async function listChallenges(): Promise<ChallengeSummary[]> {
  await fs.mkdir(ROOT, { recursive: true });
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const rows: ChallengeSummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name)) continue;
    const dir = path.join(ROOT, entry.name);
    const htmlPath = path.join(dir, "index.html");
    try {
      const [html, stat] = await Promise.all([
        fs.readFile(htmlPath, "utf8"),
        fs.stat(htmlPath),
      ]);
      rows.push({
        slug: entry.name,
        title: await readTitle(dir, html, entry.name),
        updatedAt: stat.mtime.toISOString(),
      });
    } catch {
      /* skip folders that are not a challenge sheet */
    }
  }

  rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return rows;
}

export async function readChallenge(slug: string): Promise<ChallengeFile | null> {
  const dir = challengeDir(slug);
  try {
    const htmlPath = path.join(dir, "index.html");
    const [html, stat] = await Promise.all([
      fs.readFile(htmlPath, "utf8"),
      fs.stat(htmlPath),
    ]);
    return {
      slug,
      title: await readTitle(dir, html, slug),
      html,
      updatedAt: stat.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function createChallenge(
  title: string,
  html: string,
): Promise<ChallengeSummary> {
  const slug = slugify(title);
  assertSlug(slug);
  const dir = challengeDir(slug);
  try {
    await fs.access(path.join(dir, "index.html"));
    throw new Error("A challenge with that name already exists");
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) throw error;
  }
  await fs.mkdir(path.join(dir, "uploads"), { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), html);
  await fs.writeFile(
    path.join(dir, "meta.json"),
    `${JSON.stringify({ title: title.trim() }, null, 2)}\n`,
  );
  const stat = await fs.stat(path.join(dir, "index.html"));
  return { slug, title: title.trim(), updatedAt: stat.mtime.toISOString() };
}

export async function updateChallenge(
  slug: string,
  input: { title?: string; html?: string },
): Promise<ChallengeSummary> {
  const existing = await readChallenge(slug);
  if (!existing) throw new Error("Challenge not found");
  const dir = challengeDir(slug);
  const title = input.title?.trim() || existing.title;
  const html = input.html ?? existing.html;
  await fs.mkdir(path.join(dir, "uploads"), { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), html);
  await fs.writeFile(
    path.join(dir, "meta.json"),
    `${JSON.stringify({ title }, null, 2)}\n`,
  );
  const stat = await fs.stat(path.join(dir, "index.html"));
  return { slug, title, updatedAt: stat.mtime.toISOString() };
}

export async function deleteChallenge(slug: string): Promise<void> {
  const dir = challengeDir(slug);
  await fs.rm(dir, { recursive: true, force: true });
}

export async function saveChallengeCsv(
  slug: string,
  filename: string,
  bytes: Buffer,
  niche: string,
): Promise<string> {
  const existing = await readChallenge(slug);
  if (!existing) throw new Error("Challenge not found");
  const base = path.basename(filename).replace(/[^a-zA-Z0-9._-]+/g, "-");
  if (!base.toLowerCase().endsWith(".csv")) {
    throw new Error("Only CSV files can be saved");
  }
  const nichePart = slugify(niche);
  const storedName = `${Date.now()}${nichePart ? `-${nichePart}` : ""}-${base}`;
  const uploadsDir = path.resolve(challengeDir(slug), "uploads");
  const target = path.resolve(uploadsDir, storedName);
  if (!target.startsWith(`${uploadsDir}${path.sep}`)) {
    throw new Error("Invalid file name");
  }
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(target, bytes);
  return storedName;
}
