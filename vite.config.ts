import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          swiper: ["swiper"],
          masonry: ["react-masonry-css"],
        },
        // Add hash to filenames for cache busting
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
    // Enable compression
    minify: "esbuild",
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Add timestamp to prevent caching issues
    sourcemap: false,
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false,
    },
  },
});
