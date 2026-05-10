import type { BlogPostRow } from "@/admin/types/database";
import Header from "@/components/Header";
import { PublicSeo } from "@/components/public/PublicSeo";
import { Input } from "@/components/ui/input";
import { BLOG_COVER_PLACEHOLDER } from "@/constants/placeholders";
import { usePublishedBlogPosts } from "@/hooks/usePublishedBlogPosts";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion, useInView } from "framer-motion";
import { ArrowRight, BookOpen, Clock, Search, Tag } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────── helpers ─────────────────────── */

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ─────────────────────── animations ─────────────────────── */

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

/* ─────────────────────── skeleton ─────────────────────── */

function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex gap-3 mb-4">
        <div className="h-4 w-20 rounded-full bg-white/10" />
        <div className="h-4 w-16 rounded-full bg-white/10" />
      </div>
      <div className="h-7 w-3/4 rounded-lg bg-white/10 mb-3" />
      <div className="h-4 w-full rounded bg-white/[0.06] mb-2" />
      <div className="h-4 w-2/3 rounded bg-white/[0.06]" />
    </div>
  );
}

/* ─────────────────────── post card ─────────────────────── */

function PostCard({ post, index }: { post: BlogPostRow; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.26,
        delay: Math.min(index, 8) * 0.035,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02]
        hover:border-white/[0.14] hover:bg-white/[0.035] transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-60 overflow-hidden">
        <img
          src={post.cover_image || BLOG_COVER_PLACEHOLDER}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 to-transparent" />
        {post.featured ? (
          <span
            className="absolute top-3 right-3 z-[1] inline-flex items-center px-2 py-0.5 rounded-full
              text-[10px] font-semibold uppercase tracking-wider
              bg-violet-500/25 border border-violet-500/35 text-violet-200"
          >
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-col flex-1 p-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/35 mb-3">
          <time>{formatDate(post.published_at ?? post.created_at)}</time>
          {post.reading_time ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time} min
            </span>
          ) : null}
        </div>

        <h3
          className="text-base font-semibold text-white/90 mb-2 leading-snug
          group-hover:text-white transition-colors line-clamp-1"
        >
          <Link to={`/blogs/${post.slug}`}>{post.title}</Link>
        </h3>

        {post.excerpt ? (
          <p className="text-sm text-white/45 leading-relaxed line-clamp-2 flex-1 mb-4">
            {post.excerpt}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-white/[0.06]">
          <div className="flex flex-wrap gap-1.5">
            {post.tags?.slice(0, 2).map((t) => (
              <span
                key={t}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md
                bg-violet-500/10 text-violet-400/80 border border-violet-500/20"
              >
                {t}
              </span>
            ))}
          </div>
          <Link
            to={`/blogs/${post.slug}`}
            className="shrink-0 text-xs font-medium text-white/40 hover:text-violet-400
              transition-colors inline-flex items-center gap-1"
          >
            Read <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

/* ─────────────────────── all tags ─────────────────────── */

function TagFilter({
  tags,
  active,
  onSelect,
}: {
  tags: string[];
  active: string | null;
  onSelect: (t: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          !active
            ? "bg-white/15 text-white shadow-sm"
            : "bg-white/[0.04] text-white/45 border border-white/[0.07] hover:text-white/70"
        }`}
      >
        All
      </button>
      {tags.map((t) => (
        <button
          key={t}
          onClick={() => onSelect(active === t ? null : t)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            active === t
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
              : "bg-white/[0.04] text-white/45 border border-white/[0.07] hover:text-white/70"
          }`}
        >
          <Tag className="w-3 h-3" />
          {t}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────── page ─────────────────────── */

export const BlogsPage = (): JSX.Element => {
  const { posts, loading, error } = usePublishedBlogPosts();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInV = useInView(headerRef, { once: true, margin: "-10%" });

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q));
      const matchTag = !activeTag || p.tags?.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [posts, search, activeTag]);

  const listAnimKey = useMemo(
    () =>
      `${search.trim()}\u0000${activeTag ?? ""}\u0000${filtered.map((p) => p.id).join(",")}`,
    [search, activeTag, filtered],
  );

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <PublicSeo />
      <Header />

      {/* ── Hero ── */}
      <section className="w-full pt-28 sm:pt-36 lg:pt-40 pb-10 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-20 right-1/4 w-[600px] h-[400px]
          bg-gradient-to-b from-violet-600/10 to-transparent rounded-full blur-3xl"
        />

        <div ref={headerRef} className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
              tracking-widest uppercase bg-white/5 border border-white/10 text-white/50 mb-5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Writing
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <motion.h1
                initial="hidden"
                animate={headerInV ? "visible" : "hidden"}
                variants={fadeUp(0.05)}
                className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2"
              >
                Blog
                <span className="ml-3 text-2xl sm:text-3xl font-normal text-white/25">
                  ({posts.length})
                </span>
              </motion.h1>
              <motion.p
                initial="hidden"
                animate={headerInV ? "visible" : "hidden"}
                variants={fadeUp(0.1)}
                className="text-white/50 max-w-lg"
              >
                Notes on shipping web projects, tooling, and working with
                clients.
              </motion.p>
            </div>

            {/* Search */}
            <motion.div
              initial="hidden"
              animate={headerInV ? "visible" : "hidden"}
              variants={fadeUp(0.12)}
              className="relative w-full sm:w-64 shrink-0"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.05] border-white/10
                  text-sm text-white placeholder:text-white/30 focus-visible:border-white/20
                  focus-visible:bg-white/[0.07] transition-all duration-200"
              />
            </motion.div>
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <motion.div
              initial="hidden"
              animate={headerInV ? "visible" : "hidden"}
              variants={fadeUp(0.15)}
              className="mt-6"
            >
              <TagFilter
                tags={allTags}
                active={activeTag}
                onSelect={setActiveTag}
              />
            </motion.div>
          )}

          {/* Divider */}
          <motion.div
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.18)}
            className="mt-8 h-px bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-transparent"
          />
        </div>
      </section>

      {/* ── Content ── */}
      <section className="container mx-auto px-4 pb-24 w-full">
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400/80 text-sm mb-2">
                Could not load posts.
              </p>
              <p className="text-white/30 text-xs">
                Check Supabase connection and published items.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20">
              <BookOpen className="w-8 h-8 text-white/20" />
              <p className="text-white/40 text-sm">
                No posts match your search.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveTag(null);
                }}
                className="text-violet-400 text-xs hover:text-violet-300 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div
                key={listAnimKey}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filtered.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>

              <p className="text-center text-xs text-white/20 mt-12">
                {filtered.length} post{filtered.length !== 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};
