import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => {
          // 1. Jika request ke auth, hapus awalan /api agar menjadi /auth/...
          if (path.startsWith("/api/auth")) {
            return path.replace(/^\/api/, "");
          }
          // 2. Jika request ke tasks, sisipkan /v1 agar menjadi /api/v1/tasks/...
          if (path.startsWith("/api/tasks")) {
            return path.replace(/^\/api/, "/api/v1");
          }
          // 3. (Opsional) Jika ada request ke profil/users, sesuaikan juga
          if (path.startsWith("/api/users")) {
            return path.replace(/^\/api/, "/api/v1");
          }
          
          return path;
        },
      },
    },
  },
});