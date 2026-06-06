import { BlogMarkdownEditor } from "@/admin/components/BlogMarkdownEditor";
import { AdminSidePanel } from "@/admin/components/ui/AdminSidePanel";
import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { TagInput } from "@/admin/components/ui/TagInput";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import { useToast } from "@/admin/context/ToastContext";
import {
  buildBlogPostPayload,
  canLenientBlogDraftInsert,
  defaultEmptyBlogForm,
  shouldPersistNewBlogDraft,
  type BlogDraftFormState,
} from "@/admin/lib/blogDraftHelpers";
import { slugify } from "@/admin/lib/slug";
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
import { invalidatePublicDataCache } from "@/lib/publicDataCache";
import { supabase } from "@/utils/supabase";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

function formatBlogSaveError(error: {
  message: string;
  code?: string;
}): string {
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
  const [status, setStatus] = useState<"draft" | "published" | "trash">(
    "draft",
  );
  const [publishedAt, setPublishedAt] = useState("");

  const formSnapshot = useCallback(
    (): BlogDraftFormState => ({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      tags,
      featured,
      status,
      publishedAt,
    }),
    [
      title,
      slug,
      excerpt,
      content,
      coverImage,
      tags,
      featured,
      status,
      publishedAt,
    ],
  );

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      const empty = defaultEmptyBlogForm();
      setTitle(empty.title);
      setSlug(empty.slug);
      setSlugTouched(false);
      setExcerpt(empty.excerpt);
      setContent(empty.content);
      setCoverImage(empty.coverImage);
      setTags(empty.tags);
      setFeatured(empty.featured);
      setStatus(empty.status);
      setPublishedAt(empty.publishedAt);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id!)
        .single();
      if (cancelled) return;
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
      cancelled = true;
    };
  }, [id, isNew, navigate, showToast]);

  const closePanel = useCallback(() => {
    if (loading) {
      navigate("/admin/blog");
      return;
    }

    const snap = formSnapshot();

    if (isNew) {
      if (!shouldPersistNewBlogDraft(snap)) {
        navigate("/admin/blog");
        return;
      }
      if (!canLenientBlogDraftInsert(snap)) {
        showToast("Add a title to save this draft.", "warning");
        navigate("/admin/blog");
        return;
      }
      const payload = buildBlogPostPayload(snap, { forceDraft: true });
      if (!payload.slug) {
        showToast("Could not save draft without a valid slug.", "warning");
        navigate("/admin/blog");
        return;
      }
      void (async () => {
        try {
          const { error } = await supabase.from("blog_posts").insert(payload);
          if (error) showToast(formatBlogSaveError(error), "error");
          else {
            invalidatePublicDataCache();
            showToast("Draft saved", "success");
          }
        } finally {
          navigate("/admin/blog");
        }
      })();
      return;
    }

    if (!id) {
      navigate("/admin/blog");
      return;
    }

    void (async () => {
      try {
        const payload = buildBlogPostPayload(snap);
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", id);
        if (error) showToast(formatBlogSaveError(error), "error");
        else invalidatePublicDataCache();
      } finally {
        navigate("/admin/blog");
      }
    })();
  }, [loading, formSnapshot, isNew, id, navigate, showToast]);

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
    const snap = formSnapshot();
    const payload = buildBlogPostPayload(snap);
    if (!payload.slug) {
      showToast("Slug is required", "error");
      return;
    }
    setSubmitting(true);

    if (isNew) {
      const { error } = await supabase.from("blog_posts").insert(payload);
      setSubmitting(false);
      if (error) {
        showToast(formatBlogSaveError(error), "error");
        return;
      }
      showToast("Post created");
    } else {
      const { error } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", id!);
      setSubmitting(false);
      if (error) {
        showToast(formatBlogSaveError(error), "error");
        return;
      }
      showToast("Post saved");
    }
    invalidatePublicDataCache();
    navigate("/admin/blog");
  };

  if (loading) {
    return (
      <AdminSidePanel
        title={isNew ? "New blog post" : "Edit post"}
        description="Write, schedule, and publish blog content."
        onClose={closePanel}
      >
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      </AdminSidePanel>
    );
  }

  return (
    <AdminSidePanel
      title={isNew ? "New blog post" : "Edit post"}
      description={
        isNew
          ? "Nothing is stored until you save, or close after editing  then a draft is created if there are changes."
          : "Write, schedule, and publish blog content. Closing saves your latest edits."
      }
      onClose={closePanel}
    >
      <div className="mx-auto max-w-4xl space-y-6 pb-20">
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
          <Textarea
            className={`${field} min-h-[80px]`}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
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
            <span className="text-white/55">Media library</span> (next to the
            small image icon) inserts the picture at your cursor. Drag the
            divider to resize editor vs preview.
          </p>
          <div className="rounded-lg overflow-hidden border border-white/10 [&_.w-md-editor]:bg-[#1a1a1a] [&_.w-md-editor-text]:bg-[#1a1a1a] [&_.w-md-editor-text-pre]:text-white/90">
            <BlogMarkdownEditor
              value={content}
              onChange={setContent}
              height={420}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Status</label>
            <Select
              value={status}
              onValueChange={(v) =>
                setStatus(v as "draft" | "published" | "trash")
              }
            >
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
                <SelectItem value="trash" className="focus:bg-white/10">
                  Trash
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
        <ToggleSwitch
          checked={featured}
          onChange={setFeatured}
          label="Featured"
        />

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            disabled={submitting}
            onClick={() => void save()}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {submitting ? "Saving…" : isNew ? "Create" : "Save"}
          </button>
          <button
            type="button"
            onClick={closePanel}
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/[0.06]"
          >
            Cancel
          </button>
        </div>
      </div>
    </AdminSidePanel>
  );
}
