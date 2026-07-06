import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Semua request dari frontend ke /api/... diteruskan ke backend port 3000
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // Semua request dari frontend ke /auth/... diteruskan ke backend port 3000
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});