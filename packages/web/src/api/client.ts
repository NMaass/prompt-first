import { createOpencodeClient } from "@opencode-ai/sdk"

const baseUrl = import.meta.env.VITE_OPENCODE_URL || window.location.origin

export const client = createOpencodeClient({ baseUrl })

export function model() {
  const configured = import.meta.env.VITE_STUDIO_MODEL || "openrouter/z-ai/glm-5.3-flash"
  const split = configured.indexOf("/")
  if (split < 1) return { providerID: "openrouter", modelID: "z-ai/glm-5.3-flash" }
  return { providerID: configured.slice(0, split), modelID: configured.slice(split + 1) }
}
