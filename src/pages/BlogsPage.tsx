import Header from "@/components/Header";
import { PublicSeo } from "@/components/public/PublicSeo";
import { FooterSection } from "@/screens/sections/FooterSection";
import { usePublishedBlogPosts } from "@/hooks/usePublishedBlogPosts";
import { motion, useInView } from "framer-motion";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const BlogsPage = (): JSX.Element => {
  const { posts, loading, error } = usePublishedBlogPosts();
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const headerInV = useInView(headerRef, { once: true, margin: "-10%" });
  const listInV = useInView(listRef, { once: true, margin: "-8%" });

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <PublicSeo />
      <Header />

      <section className="w-full pt-28 sm:pt-36 lg:pt-40 pb-10 sm:pb-14 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-20 right-1/4 w-[600px] h-[400px]
          bg-gradient-to-b from-violet-600/10 to-transparent rounded-full blur-3xl"
        />
        <div
          ref={headerRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl"
        >
          <motion.div
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
              tracking-widest uppercase bg-white/5 border border-white/10 text-white/50 mb-4"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Writing
            </span>
          </motion.div>
          <motion.h1
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.06)}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4"
          >
            <span className="bg-gradient-to-r from-violet-300 to-blue-400 bg-clip-text text-transparent">
              Blog
            </span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.12)}
            className="text-base sm:text-lg text-white/50 max-w-xl mx-auto"
          >
            Notes on shipping web projects, tooling, and working with clients.
          </motion.p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 w-full max-w-4xl">
        <motion.div
          ref={listRef}
          initial="hidden"
          animate={listInV ? "visible" : "hidden"}
          variants={fadeUp(0)}
          className="flex flex-col gap-5"
        >
          {loading ? (
            <p className="text-center text-white/45 py-16 text-sm">Loading posts…</p>
          ) : error ? (
            <p className="text-center text-red-300/80 py-16 text-sm">
              Could not load posts. Check your connection and Supabase setup.
            </p>
          ) : posts.length === 0 ? (
            <p className="text-center text-white/45 py-16 text-sm">No posts published yet.</p>
          ) : (
            posts.map((post, i) => (
              <motion.article
                key={post.id}
                variants={fadeUp(0.04 + i * 0.03)}
                className="group rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04]
                  to-transparent p-6 sm:p-8 hover:border-white/[0.14] transition-colors duration-300"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 mb-3">
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
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2 tracking-tight">
                  <Link
                    to={`/blogs/${post.slug}`}
                    className="hover:text-violet-300 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt ? (
                  <p className="text-white/55 text-sm sm:text-base leading-relaxed mb-5 line-clamp-3">
                    {post.excerpt}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  {post.tags?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-md
                            bg-violet-500/15 text-violet-300/90 border border-violet-500/25"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <Link
                    to={`/blogs/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400
                      group-hover:text-violet-300 ml-auto"
                  >
                    Read
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            ))
          )}
        </motion.div>
      </section>

      <FooterSection />
    </div>
  );
};
