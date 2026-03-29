import { lazy, Suspense } from "react";

const MDEditor = lazy(async () => {
  await import("@uiw/react-md-editor/markdown-editor.css");
  await import("@uiw/react-markdown-preview/markdown.css");
  const { default: Editor } = await import("@uiw/react-md-editor");
  return { default: Editor };
});

type BlogMarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  height?: number;
};

function EditorFallback(): JSX.Element {
  return (
    <div className="flex h-[420px] items-center justify-center rounded-lg border border-white/10 bg-[#1a1a1a] text-sm text-white/45">
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
    <Suspense fallback={<EditorFallback />}>
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        height={height}
        preview="edit"
      />
    </Suspense>
  );
}
