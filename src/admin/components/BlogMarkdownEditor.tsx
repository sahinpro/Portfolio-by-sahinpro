import { lazy, Suspense } from "react";

const BlogMarkdownEditorImpl = lazy(async () => {
  const { BlogMarkdownEditorImpl } = await import("@/admin/components/BlogMarkdownEditorImpl");
  return { default: BlogMarkdownEditorImpl };
});

type BlogMarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  height?: number;
};

function EditorFallback({ height = 420 }: { height?: number }): JSX.Element {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-white/10 bg-[#1a1a1a] text-sm text-white/45"
      style={{ minHeight: height }}
    >
      Loading editor…
    </div>
  );
}

export function BlogMarkdownEditor({
  value,
  onChange,
  height = 420,
}: BlogMarkdownEditorProps): JSX.Element {
  return (
    <Suspense fallback={<EditorFallback height={height} />}>
      <BlogMarkdownEditorImpl value={value} onChange={onChange} height={height} />
    </Suspense>
  );
}
