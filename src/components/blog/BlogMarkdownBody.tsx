import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl sm:text-4xl font-bold text-white mt-12 mb-4 tracking-tight first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold text-white mt-10 mb-3 tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-white/95 mt-8 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-white/70 leading-relaxed mb-4 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 mb-4 space-y-2 text-white/70 marker:text-violet-400/80">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 mb-4 space-y-2 text-white/70 marker:text-violet-400/80">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="border-l-2 border-violet-500/50 pl-4 my-6 text-white/55 italic bg-white/[0.02] py-3 rounded-r-lg"
    >
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const inline = !className;
    if (inline) {
      return (
        <code
          className="rounded-md bg-white/10 px-1.5 py-0.5 text-sm text-violet-200/90 font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={`${className ?? ""} font-mono text-sm`} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre
      className="mb-6 overflow-x-auto rounded-xl border border-white/[0.1] bg-black/50 p-4 text-sm
        text-white/85"
    >
      {children}
    </pre>
  ),
  hr: () => <hr className="my-10 border-white/[0.08]" />,
  strong: ({ children }) => <strong className="font-semibold text-white/90">{children}</strong>,
  table: ({ children }) => (
    <div className="mb-6 overflow-x-auto rounded-lg border border-white/[0.08]">
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-white/[0.04] text-white/80">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3 py-2 font-semibold border-b border-white/[0.08]">{children}</th>
  ),
  td: ({ children }) => <td className="px-3 py-2 border-b border-white/[0.05] text-white/65">{children}</td>,
};

type Props = {
  markdown: string;
};

export function BlogMarkdownBody({ markdown }: Props): JSX.Element {
  return (
    <div className="blog-md max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
