import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      "@": resolve("./src"),
      "@/components": resolve("./src/components"),
      "@/pages": resolve("./src/pages"),
      "@/hooks": resolve("./src/hooks"),
      "@/lib": resolve("./src/lib"),
      "@/constants": resolve("./src/constants"),
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
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          framer: ['framer-motion'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-separator'],
          icons: ['lucide-react', 'react-icons']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    open: true
  }
});
