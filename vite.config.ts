import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          (async () => {
            const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal");
            return runtimeErrorOverlay.default();
          })(),
          (async () => {
            const cartographer = await import("@replit/vite-plugin-cartographer");
            return cartographer.cartographer();
          })(),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 5000,
    host: true, // Permite acceso desde cualquier IP
    open: true, // Abre automáticamente el navegador
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
