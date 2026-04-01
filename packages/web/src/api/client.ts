import { createOpencodeClient } from "@opencode-ai/sdk/client"

const BASE_URL = import.meta.env.VITE_OPENCODE_URL || "http://localhost:4096"

export const client = createOpencodeClient({
  baseUrl: BASE_URL,
})

export type { OpencodeClient } from "@opencode-ai/sdk/client"
