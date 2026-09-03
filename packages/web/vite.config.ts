import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: {
    port: 3000,
    proxy: {
      "/studio": "http://127.0.0.1:4100",
      "/session": "http://127.0.0.1:4096",
      "/event": "http://127.0.0.1:4096",
      "/global": "http://127.0.0.1:4096",
      "/project": "http://127.0.0.1:4096",
      "/config": "http://127.0.0.1:4096",
      "/provider": "http://127.0.0.1:4096",
      "/experimental": "http://127.0.0.1:4096",
    },
  },
})
