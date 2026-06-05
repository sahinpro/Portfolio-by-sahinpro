import react from "@vitejs/plugin-react";
import { resolve } from "path";
import type { RollupLog } from "rollup";
import type { IncomingMessage } from "http";
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";

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

function readJsonBody(req: IncomingMessage): Promise<Record<string, string | undefined>> {
  return new Promise((resolvePromise, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        resolvePromise(
          JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<
            string,
            string | undefined
          >,
        );
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function contactApiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: "contact-api-dev",
    configureServer(server: ViteDevServer) {
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/api/contact") {
          next();
          return;
        }

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        void (async () => {
          try {
            const body = await readJsonBody(req);
            const mod = (await server.ssrLoadModule(
              "/api/lib/contactHandler.ts",
            )) as {
              handleContactSubmission: (
                input: Record<string, string | undefined>,
              ) => Promise<
                | { ok: true }
                | { ok: false; status: number; error: string }
              >;
            };
            const result = await mod.handleContactSubmission(body, {
              clientIp: req.socket.remoteAddress ?? "127.0.0.1",
              idempotencyKey: "",
            });
            res.setHeader("Content-Type", "application/json");
            res.statusCode = result.ok ? 200 : result.status;
            if (!result.ok && result.retryAfter) {
              res.setHeader("Retry-After", String(result.retryAfter));
            }
            res.end(
              JSON.stringify(result.ok ? { ok: true } : { error: result.error }),
            );
          } catch {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Server error" }));
          }
        })();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
  plugins: [react(), contactApiDevPlugin(env)],
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
};
});
