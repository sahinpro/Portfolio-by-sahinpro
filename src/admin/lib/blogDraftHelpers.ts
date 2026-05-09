import { readingMinutesFromMarkdown, slugify } from "@/admin/lib/slug";
import type { BlogPostRow } from "@/admin/types/database";

/** Snapshot of blog form fields used for “anything changed?” checks. */
export type BlogDraftFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  featured: boolean;
  status: BlogPostRow["status"];
  publishedAt: string;
};

export function defaultEmptyBlogForm(): BlogDraftFormState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: [],
    featured: false,
    status: "draft",
    publishedAt: "",
  };
}

function normTags(tags: string[]): string[] {
  return [...tags].map((t) => t.trim()).filter(Boolean).sort();
}

export function shouldPersistNewBlogDraft(s: BlogDraftFormState): boolean {
  const d = defaultEmptyBlogForm();
  const t = (x: string) => x.trim();
  if (t(s.title) !== t(d.title)) return true;
  if (t(s.slug) !== t(d.slug)) return true;
  if (t(s.excerpt) !== t(d.excerpt)) return true;
  if (t(s.content) !== t(d.content)) return true;
  if (t(s.coverImage) !== t(d.coverImage)) return true;
  if (JSON.stringify(normTags(s.tags)) !== JSON.stringify(normTags(d.tags))) return true;
  if (s.featured !== d.featured) return true;
  if (s.status !== d.status) return true;
  if (t(s.publishedAt) !== t(d.publishedAt)) return true;
  return false;
}

/** Minimum to insert a row when closing the panel without full “Save” validation. */
export function canLenientBlogDraftInsert(s: BlogDraftFormState): boolean {
  return s.title.trim().length > 0;
}

export type BlogPostPayload = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[];
  featured: boolean;
  status: BlogPostRow["status"];
  reading_time: number;
  published_at: string | null;
};

/** Shared insert/update shape for `blog_posts`. */
export function buildBlogPostPayload(
  s: BlogDraftFormState,
  opts?: { forceDraft?: boolean },
): BlogPostPayload {
  const status = opts?.forceDraft ? "draft" : s.status;
  const reading_time = readingMinutesFromMarkdown(s.content);
  const finalSlug = (s.slug.trim() ? s.slug : slugify(s.title)).trim();
  const published_at =
    status === "published" && s.publishedAt.trim()
      ? new Date(s.publishedAt).toISOString()
      : null;
  return {
    title: s.title.trim(),
    slug: finalSlug,
    excerpt: s.excerpt.trim() || null,
    content: s.content,
    cover_image: s.coverImage.trim() || null,
    tags: s.tags,
    featured: s.featured,
    status,
    reading_time,
    published_at: status === "published" ? published_at : null,
  };
}
