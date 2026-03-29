import { fetchPublishedBlogPostBySlug } from "@/data/publicSupabase";
import type { BlogPostRow } from "@/admin/types/database";
import { usePublicData } from "@/hooks/usePublicData";

export function usePublishedBlogPost(slug: string | undefined): {
  post: BlogPostRow | null;
  loading: boolean;
  error: Error | null;
} {
  const key = slug ? `blog_post_slug:${slug}` : "blog_post_slug:__empty__";
  const { data, loading, error } = usePublicData(key, () => {
    if (!slug) return Promise.resolve(null);
    return fetchPublishedBlogPostBySlug(slug);
  });
  return { post: data ?? null, loading, error };
}
