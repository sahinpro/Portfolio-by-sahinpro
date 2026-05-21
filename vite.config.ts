import react from "@vitejs/plugin-react";
import { resolve } from "path";
import type { RollupLog } from "rollup";
import { defineConfig } from "vite";

function suppressLottieEvalWarning(warning: RollupLog, handler: (w: RollupLog) => void) {
  if (
    warning.code === "EVAL" &&
    typeof warning.id === "string" &&
    warning.id.includes("lottie-web")
  ) {
    return;
  }
  handler(warning);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      "@": resolve("./src"),
      "@/admin": resolve("./src/admin"),
      "@/components": resolve("./src/components"),
      "@/pages": resolve("./src/pages"),
      "@/hooks": resolve("./src/hooks"),
      "@/lib": resolve("./src/lib"),
      "@/constants": resolve("./src/constants"),
      "@/utils": resolve("./src/utils"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug']
      }
    },
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        suppressLottieEvalWarning(warning, defaultHandler);
      },
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          framer: ["framer-motion"],
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-separator",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-popover",
            "@radix-ui/react-slot",
          ],
          icons: ["lucide-react", "react-icons"],
          supabase: ["@supabase/supabase-js"],
          lottie: ["lottie-react", "lottie-web"],
          three: ["three"],
        },
      },
    },
    // @uiw/react-md-editor (CodeMirror) is ~1 MiB; it loads only via BlogMarkdownEditor on the admin blog form.
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 3000,
    open: true
  }
});
