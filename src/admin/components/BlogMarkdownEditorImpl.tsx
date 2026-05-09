import { MediaLibraryPickerModal } from "@/admin/components/MediaLibraryPickerModal";
import {
  promptSingleDuplicateFile,
  useDuplicateUploadConfirm,
} from "@/admin/context/DuplicateUploadConfirmContext";
import { useToast } from "@/admin/context/ToastContext";
import { withRlsHint } from "@/admin/lib/formatAdminError";
import { uploadPublicFileContentAddressed } from "@/admin/lib/storageUpload";
import MDEditor, {
  type ICommand,
  type TextAreaTextApi,
  commands,
  getCommands,
  getExtraCommands,
} from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { ImagePlus, Images } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

export type BlogMarkdownEditorImplProps = {
  value: string;
  onChange: (value: string) => void;
  height?: number;
};

const BUCKET = "blog-media" as const;
const PATH_PREFIX = "blog";

function escapeMdAlt(s: string): string {
  return s.replace(/\]/g, "").replace(/\[/g, "").trim() || "Image";
}

function buildBlogCommands(
  onRequestUpload: (api: TextAreaTextApi) => void,
  onRequestLibrary: (api: TextAreaTextApi) => void,
): ICommand[] {
  const filtered = getCommands().filter((cmd) => {
    const n = cmd.name;
    if (n === "table" || n === "comment" || n === "checked-list" || n === "help") return false;
    return true;
  });

  const uploadImageCommand: ICommand = {
    name: "blog-upload-image",
    keyCommand: "blog-upload-image",
    buttonProps: {
      "aria-label": "Upload image into post",
      title: "Upload image (inserts at cursor)",
    },
    icon: <ImagePlus className="h-3.5 w-3.5" aria-hidden />,
    execute: (_state, api: TextAreaTextApi) => {
      onRequestUpload(api);
    },
  };

  const libraryImageCommand: ICommand = {
    name: "blog-library-image",
    keyCommand: "blog-library-image",
    buttonProps: {
      "aria-label": "Insert image from media library",
      title: "Media library (inserts at cursor)",
    },
    icon: <Images className="h-3.5 w-3.5" aria-hidden />,
    execute: (_state, api: TextAreaTextApi) => {
      onRequestLibrary(api);
    },
  };

  const i = filtered.findIndex((c) => c.name === "image");
  if (i === -1) {
    return [...filtered, commands.divider, uploadImageCommand, libraryImageCommand];
  }
  return [...filtered.slice(0, i + 1), uploadImageCommand, libraryImageCommand, ...filtered.slice(i + 1)];
}

export function BlogMarkdownEditorImpl({
  value,
  onChange,
  height = 420,
}: BlogMarkdownEditorImplProps): JSX.Element {
  const { showToast } = useToast();
  const { openPrompt } = useDuplicateUploadConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingApiRef = useRef<TextAreaTextApi | null>(null);
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const insertImageMarkdown = useCallback((api: TextAreaTextApi | null, publicUrl: string, alt: string) => {
    if (!api) return;
    const line = `![${escapeMdAlt(alt)}](${publicUrl})\n\n`;
    api.replaceSelection(line);
  }, []);

  const runUpload = useCallback(
    async (file: File) => {
      const api = pendingApiRef.current;
      pendingApiRef.current = null;
      setUploading(true);
      try {
        const baseTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        const { publicUrl, skippedUpload } = await uploadPublicFileContentAddressed(
          BUCKET,
          PATH_PREFIX,
          file,
          { title: baseTitle },
        );
        if (skippedUpload) {
          const useExisting = await promptSingleDuplicateFile(openPrompt, file.name);
          if (!useExisting) return;
        }
        insertImageMarkdown(api, publicUrl, baseTitle);
        showToast(skippedUpload ? "Existing image inserted" : "Image added to post");
      } catch (err) {
        showToast(withRlsHint(err instanceof Error ? err.message : "Upload failed"), "error");
      } finally {
        setUploading(false);
      }
    },
    [insertImageMarkdown, openPrompt, showToast],
  );

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) {
        pendingApiRef.current = null;
        return;
      }
      if (!file.type.startsWith("image/")) {
        showToast("Choose an image file", "error");
        pendingApiRef.current = null;
        return;
      }
      await runUpload(file);
    },
    [runUpload, showToast],
  );

  const onRequestUpload = useCallback((api: TextAreaTextApi) => {
    pendingApiRef.current = api;
    fileRef.current?.click();
  }, []);

  const onRequestLibrary = useCallback((api: TextAreaTextApi) => {
    pendingApiRef.current = api;
    setLibraryOpen(true);
  }, []);

  const blogCommands = useMemo(
    () => buildBlogCommands(onRequestUpload, onRequestLibrary),
    [onRequestUpload, onRequestLibrary],
  );

  const extraCommands = useMemo(() => getExtraCommands(), []);

  const onLibraryPick = useCallback(
    (publicUrl: string) => {
      const api = pendingApiRef.current;
      pendingApiRef.current = null;
      insertImageMarkdown(api, publicUrl, "Image");
      setLibraryOpen(false);
      showToast("Image added to post");
    },
    [insertImageMarkdown, showToast],
  );

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFileChange(e)}
        disabled={uploading}
      />
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        height={height}
        preview="live"
        visibleDragbar
        enableScroll
        commands={blogCommands}
        extraCommands={extraCommands}
      />
      <MediaLibraryPickerModal
        open={libraryOpen}
        onOpenChange={(open) => {
          setLibraryOpen(open);
          if (!open) pendingApiRef.current = null;
        }}
        uploadBucket={BUCKET}
        pathPrefix={PATH_PREFIX}
        onPick={onLibraryPick}
      />
    </>
  );
}
