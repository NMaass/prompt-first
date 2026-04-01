import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/session": "http://localhost:4096",
      "/event": "http://localhost:4096",
      "/config": "http://localhost:4096",
      "/tool": "http://localhost:4096",
      "/provider": "http://localhost:4096",
    },
  },
})
