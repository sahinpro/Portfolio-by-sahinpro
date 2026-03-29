import { fetchPublishedBlogPosts } from "@/data/publicSupabase";
import type { BlogPostRow } from "@/admin/types/database";
import { usePublicData } from "@/hooks/usePublicData";

export function usePublishedBlogPosts(): {
  posts: BlogPostRow[];
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData("published_blog_posts", fetchPublishedBlogPosts);
  return { posts: data ?? [], loading, error };
}
