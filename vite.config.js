import { defineConfig } from "vite";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Cross-Origin-Resource-Policy": "same-origin",
};

export default defineConfig({
  // GitHub Pages работает в подпапке: https://username.github.io/repo/.
  // В GitHub Actions мы задаём BASE_PATH=/имя-репозитория/ автоматически.
  base: process.env.BASE_PATH ?? "/",
  server: { headers: securityHeaders },
  preview: { headers: securityHeaders },
  build: {
    // Three.js загружается лениво отдельным чанком (~127 KB gzip), поэтому порог предупреждения поднят.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: { three: ["three"] },
      },
    },
  },
});
