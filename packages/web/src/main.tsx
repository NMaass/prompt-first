import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Shell } from "@/components/Shell"
import "./index.css"

const root = document.getElementById("root")
if (!root) throw new Error("Root element is missing")

createRoot(root).render(
  <StrictMode>
    <Shell />
  </StrictMode>,
)
