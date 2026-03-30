import { BlogMarkdownEditor } from "@/admin/components/BlogMarkdownEditor";
import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { TagInput } from "@/admin/components/ui/TagInput";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import { useToast } from "@/admin/context/ToastContext";
import { readingMinutesFromMarkdown, slugify } from "@/admin/lib/slug";
import type { BlogPostRow } from "@/admin/types/database";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/utils/supabase";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

function formatBlogSaveError(error: { message: string; code?: string }): string {
  if (error.code === "23505") {
    return "A blog post with this slug already exists. Choose a different slug.";
  }
  return error.message;
}

export function AdminBlogFormPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isNew = id === "new" || !id;
  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [publishedAt, setPublishedAt] = useState("");

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    let c = false;
    (async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id!).single();
      if (c) return;
      setLoading(false);
      if (error || !data) {
        showToast(error?.message ?? "Not found", "error");
        navigate("/admin/blog");
        return;
      }
      const r = data as BlogPostRow;
      setTitle(r.title);
      setSlug(r.slug);
      setSlugTouched(true);
      setExcerpt(r.excerpt ?? "");
      setContent(r.content);
      setCoverImage(r.cover_image ?? "");
      setTags(r.tags ?? []);
      setFeatured(r.featured);
      setStatus(r.status);
      if (r.published_at) {
        const d = new Date(r.published_at);
        const p = (n: number) => String(n).padStart(2, "0");
        setPublishedAt(
          `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`,
        );
      } else setPublishedAt("");
    })();
    return () => {
      c = true;
    };
  }, [id, isNew, navigate, showToast]);

  const onTitleBlur = () => {
    if (!slugTouched && title.trim()) {
      setSlug(slugify(title));
    }
  };

  const save = async () => {
    if (!title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    const finalSlug = (slug.trim() ? slug : slugify(title)).trim();
    if (!finalSlug) {
      showToast("Slug is required", "error");
      return;
    }
    setSubmitting(true);
    const reading_time = readingMinutesFromMarkdown(content);
    const published_at = publishedAt.trim() ? new Date(publishedAt).toISOString() : null;

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || null,
      content,
      cover_image: coverImage.trim() || null,
      tags,
      featured,
      status,
      reading_time,
      published_at: status === "published" ? published_at : null,
    };

    if (isNew) {
      const { error } = await supabase.from("blog_posts").insert(payload);
      setSubmitting(false);
      if (error) {
        showToast(formatBlogSaveError(error), "error");
        return;
      }
      showToast("Post created");
    } else {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", id!);
      setSubmitting(false);
      if (error) {
        showToast(formatBlogSaveError(error), "error");
        return;
      }
      showToast("Post saved");
    }
    navigate("/admin/blog");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-white/50 text-sm">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-20">
      <Link
        to="/admin/blog"
        className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white/75 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <h1 className="text-2xl font-semibold text-white mb-8">
        {isNew ? "New blog post" : "Edit post"}
      </h1>

      <div className="space-y-6">
        <div>
          <label className={labelCls}>Title</label>
          <Input
            className={field}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={onTitleBlur}
          />
        </div>
        <div>
          <label className={labelCls}>Slug</label>
          <Input
            className={field}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </div>
        <div>
          <label className={labelCls}>Excerpt</label>
          <Textarea className={`${field} min-h-[80px]`} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </div>
        <ImageUrlField
          label="Cover image"
          value={coverImage}
          onChange={setCoverImage}
          bucket="blog-media"
          pathPrefix="blog"
        />
        <div>
          <label className={labelCls}>Tags</label>
          <TagInput value={tags} onChange={setTags} />
        </div>
        <div data-color-mode="dark">
          <label className={labelCls}>Content</label>
          <p className="text-xs text-white/40 mb-2 max-w-2xl">
            Click where you want text or an image. Use the toolbar:{" "}
            <span className="text-white/55">Upload image</span> or{" "}
            <span className="text-white/55">Media library</span> (next to the small image icon) inserts the picture at
            your cursor. Drag the divider to resize editor vs preview.
          </p>
          <div className="rounded-lg overflow-hidden border border-white/10 [&_.w-md-editor]:bg-[#1a1a1a] [&_.w-md-editor-text]:bg-[#1a1a1a] [&_.w-md-editor-text-pre]:text-white/90">
            <BlogMarkdownEditor value={content} onChange={setContent} height={420} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
              <SelectTrigger className={field}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111] text-white">
                <SelectItem value="draft" className="focus:bg-white/10">
                  Draft
                </SelectItem>
                <SelectItem value="published" className="focus:bg-white/10">
                  Published
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className={labelCls}>Published at (optional)</label>
            <Input
              type="datetime-local"
              className={field}
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>
        </div>
        <ToggleSwitch checked={featured} onChange={setFeatured} label="Featured" />

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            disabled={submitting}
            onClick={() => void save()}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {submitting ? "Saving…" : isNew ? "Create" : "Save"}
          </button>
          <Link
            to="/admin/blog"
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
