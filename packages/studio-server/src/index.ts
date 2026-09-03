if (process.env.NODE_ENV === "production") {
  throw new Error("LocalWorkspaceProvider is development-only. Configure a remote sandbox provider before production deployment.")
}

import { createOpencode } from "@opencode-ai/sdk"
import { BrowserVerifier } from "./browser"
import { EffectGateway, WebhookLiveExecutor } from "./effects"
import { createControlServer } from "./http"
import { LocalWorkspaceProvider } from "./workspaces"

const opencodePort = Number(process.env.STUDIO_OPENCODE_PORT || 4096)
const controlPort = Number(process.env.STUDIO_CONTROL_PORT || 4100)
const model = process.env.STUDIO_MODEL || "openrouter/z-ai/glm-5.3-flash"

const controller = new AbortController()
const opencode = await createOpencode({
  hostname: "127.0.0.1",
  port: opencodePort,
  timeout: 15_000,
  signal: controller.signal,
  config: { model },
})

const liveUrl = process.env.STUDIO_LIVE_EFFECT_URL
const live = liveUrl ? new WebhookLiveExecutor(liveUrl, process.env.STUDIO_LIVE_EFFECT_TOKEN) : undefined
const server = createControlServer({
  port: controlPort,
  workspaces: new LocalWorkspaceProvider(),
  effects: new EffectGateway(live),
  browser: new BrowserVerifier(),
  opencodeUrl: opencode.server.url,
})

console.log(`Prompt First control plane listening on ${server.url}`)
console.log(`OpenCode listening on ${opencode.server.url}`)
console.log(`Builder model: ${model}`)

const stop = () => {
  server.stop(true)
  controller.abort()
  opencode.server.close()
}

process.on("SIGINT", stop)
process.on("SIGTERM", stop)
