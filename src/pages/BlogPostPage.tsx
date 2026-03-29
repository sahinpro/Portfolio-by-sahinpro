import { BlogMarkdownBody } from "@/components/blog/BlogMarkdownBody";
import Header from "@/components/Header";
import { PublicSeo } from "@/components/public/PublicSeo";
import { FooterSection } from "@/screens/sections/FooterSection";
import { usePublishedBlogPost } from "@/hooks/usePublishedBlogPost";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";

const SITE = "Sahin Alam";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const BlogPostPage = (): JSX.Element => {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = usePublishedBlogPost(slug);

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
      {post ? (
        <Helmet prioritizeSeoTags>
          <title>{`${post.title} · Blog · ${SITE}`}</title>
          {post.excerpt ? <meta name="description" content={post.excerpt} /> : null}
          <meta property="og:title" content={post.title} />
          {post.excerpt ? <meta property="og:description" content={post.excerpt} /> : null}
          {post.cover_image ? <meta property="og:image" content={post.cover_image} /> : null}
        </Helmet>
      ) : null}

      <Header />

      <article className="w-full pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white/75 mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All posts
          </Link>

          {loading ? (
            <p className="text-white/45 text-sm py-20 text-center">Loading…</p>
          ) : error ? (
            <p className="text-red-300/80 text-sm py-20 text-center">
              Something went wrong loading this post.
            </p>
          ) : !post ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <p className="text-white/60 mb-6">This post could not be found.</p>
              <Link
                to="/blogs"
                className="text-violet-400 hover:text-violet-300 text-sm font-medium"
              >
                Back to blog
              </Link>
            </motion.div>
          ) : (
            <>
              <header className="mb-10">
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 mb-4">
                  <time dateTime={post.published_at ?? post.created_at}>
                    {formatDate(post.published_at ?? post.created_at)}
                  </time>
                  {post.reading_time != null && post.reading_time > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.reading_time} min read
                    </span>
                  ) : null}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                  {post.title}
                </h1>
                {post.tags?.length ? (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-md
                          bg-white/[0.06] text-white/55 border border-white/[0.08]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </header>

              {post.cover_image ? (
                <div className="mb-12 rounded-2xl overflow-hidden border border-white/[0.08]">
                  <img
                    src={post.cover_image}
                    alt=""
                    className="w-full aspect-[21/9] object-cover"
                  />
                </div>
              ) : null}

              <BlogMarkdownBody markdown={post.content} />
            </>
          )}
        </div>
      </article>

      <FooterSection />
    </div>
  );
};
