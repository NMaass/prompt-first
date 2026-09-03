import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Run a host-side browser verification check against the current preview and return a receipt",
  args: {
    url: tool.schema.string().url(),
    kind: tool.schema.enum(["smoke", "responsive", "keyboard", "accessibility", "performance"]),
    requirementId: tool.schema.string(),
    requirement: tool.schema.string(),
  },
  async execute(args, context) {
    const base = process.env.STUDIO_CONTROL_URL || "http://127.0.0.1:4100"
    const response = await fetch(`${base}/studio/browser/check`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ directory: context.directory, url: args.url, kind: args.kind }),
    })
    if (!response.ok) throw new Error(`Browser verification failed with ${response.status}`)
    const receipt = await response.json()
    return JSON.stringify({
      type: "browser-evidence",
      requirementId: args.requirementId,
      requirement: args.requirement,
      receipt,
    })
  },
})
