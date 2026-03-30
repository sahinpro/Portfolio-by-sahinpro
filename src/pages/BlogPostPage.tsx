import { BlogMarkdownBody } from "@/components/blog/BlogMarkdownBody";
import { BLOG_COVER_PLACEHOLDER } from "@/constants/placeholders";
import Header from "@/components/Header";
import { PublicSeo } from "@/components/public/PublicSeo";
import { usePublishedBlogPost } from "@/hooks/usePublishedBlogPost";
import { usePublishedBlogPosts } from "@/hooks/usePublishedBlogPosts";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Tag,
} from "lucide-react";
import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";

const SITE = "Sahin Alam";

function formatDateLong(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ─── reading progress bar ─── */
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left" }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-blue-500 z-50"
    />
  );
}

/* ─── skeleton ─── */
function ArticleSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
      <div className="space-y-3">
        <div className="h-4 w-32 rounded-full bg-white/10" />
        <div className="h-10 w-4/5 rounded-lg bg-white/10" />
        <div className="h-4 w-2/3 rounded bg-white/[0.06]" />
      </div>
      <div className="h-64 rounded-2xl bg-white/[0.04]" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded bg-white/[0.06] ${i % 3 === 2 ? "w-2/3" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── related card ─── */
function RelatedCard({
  post,
  dir,
}: {
  post: {
    id: string;
    slug: string;
    title: string;
    reading_time: number | null;
    published_at: string | null;
    created_at: string;
  };
  dir: "prev" | "next";
}) {
  return (
    <Link
      to={`/blogs/${post.slug}`}
      className={`group flex-1 rounded-xl border border-white/[0.08] p-5 hover:border-white/[0.16]
        hover:bg-white/[0.03] transition-all duration-300 ${dir === "next" ? "text-right" : ""}`}
    >
      <div
        className={`flex items-center gap-2 text-xs text-white/35 mb-2 ${dir === "next" ? "justify-end" : ""}`}
      >
        {dir === "prev" && <ArrowLeft className="w-3.5 h-3.5" />}
        <span className="uppercase tracking-wider font-medium">
          {dir === "prev" ? "Previous" : "Next"}
        </span>
        {dir === "next" && <ArrowRight className="w-3.5 h-3.5" />}
      </div>
      <p className="text-sm font-semibold text-white/80 group-hover:text-white line-clamp-2 transition-colors">
        {post.title}
      </p>
      <p className="text-xs text-white/30 mt-1">
        {formatDateShort(post.published_at ?? post.created_at)}
      </p>
    </Link>
  );
}

/* ─── page ─── */
export const BlogPostPage = (): JSX.Element => {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = usePublishedBlogPost(slug);
  const { posts: allPosts } = usePublishedBlogPosts();

  const { prevPost, nextPost } = useMemo(() => {
    if (!post || allPosts.length === 0)
      return { prevPost: null, nextPost: null };
    const idx = allPosts.findIndex((p) => p.id === post.id);
    return {
      prevPost: idx < allPosts.length - 1 ? allPosts[idx + 1] : null,
      nextPost: idx > 0 ? allPosts[idx - 1] : null,
    };
  }, [post, allPosts]);

  if (!slug) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <p className="text-white/50 text-sm">Invalid link.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <PublicSeo />
      {post && (
        <Helmet prioritizeSeoTags>
          <title>{`${post.title} · ${SITE}`}</title>
          {post.excerpt && <meta name="description" content={post.excerpt} />}
          <meta property="og:title" content={post.title} />
          {post.excerpt && (
            <meta property="og:description" content={post.excerpt} />
          )}
          <meta
            property="og:image"
            content={post.cover_image || BLOG_COVER_PLACEHOLDER}
          />
        </Helmet>
      )}

      {!loading && post && <ReadingProgress />}
      <Header />

      <article className="w-full pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/75
              mb-10 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            All posts
          </Link>

          {loading ? (
            <ArticleSkeleton />
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-red-300/80 text-sm mb-2">
                Something went wrong loading this post.
              </p>
              <Link
                to="/blogs"
                className="text-violet-400 hover:text-violet-300 text-sm"
              >
                Back to blog
              </Link>
            </div>
          ) : !post ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <BookOpen className="w-8 h-8 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">
                This post could not be found.
              </p>
              <Link
                to="/blogs"
                className="text-violet-400 hover:text-violet-300 text-sm font-medium"
              >
                Back to blog
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* ── Header ── */}
              <header className="mb-10 pb-10 border-b border-white/[0.07]">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 mb-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <time dateTime={post.published_at ?? post.created_at}>
                      {formatDateLong(post.published_at ?? post.created_at)}
                    </time>
                  </span>
                  {post.reading_time != null && post.reading_time > 0 && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {post.reading_time} min read
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight
                  leading-[1.15] mb-4"
                >
                  {post.title}
                </h1>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-lg text-white/55 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                {/* Tags */}
                {post.tags?.length ? (
                  <div className="flex flex-wrap gap-2 mt-5">
                    <Tag className="w-4 h-4 text-white/20 self-center" />
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg
                          bg-violet-500/10 text-violet-400/90 border border-violet-500/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </header>

              {/* ── Cover image ── */}
              <img
                src={post.cover_image || BLOG_COVER_PLACEHOLDER}
                alt=""
                className=" aspect-auto object-contain mb-12 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40"
              />

              {/* ── Body ── */}
              <div className="prose-wrapper">
                <BlogMarkdownBody markdown={post.content} />
              </div>

              {/* ── Tags footer ── */}
              {post.tags?.length ? (
                <div className="mt-12 pt-8 border-t border-white/[0.07] flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-medium px-3 py-1.5 rounded-full
                        bg-white/[0.05] text-white/45 border border-white/[0.08]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* ── Navigation ── */}
              {(prevPost || nextPost) && (
                <div className="mt-12 pt-8 border-t border-white/[0.07]">
                  <p className="text-xs uppercase tracking-widest text-white/25 font-semibold mb-4">
                    More posts
                  </p>
                  <div className="flex gap-4">
                    {prevPost && <RelatedCard post={prevPost} dir="prev" />}
                    {nextPost && <RelatedCard post={nextPost} dir="next" />}
                  </div>
                </div>
              )}

              {/* ── CTA ── */}
              <div
                className="mt-12 p-6 rounded-2xl border border-white/[0.07] bg-gradient-to-br
                from-violet-500/[0.06] to-transparent text-center"
              >
                <p className="text-sm text-white/60 mb-3">
                  Enjoyed this article?
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black
                    text-sm font-semibold hover:bg-white/90 transition-colors"
                >
                  Get in touch
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </article>

      <FooterSection />
    </div>
  );
};
