import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Publish the current product preview URL after registering it with the trusted studio host",
  args: {
    url: tool.schema.string().url(),
  },
  async execute(args, context) {
    const base = process.env.STUDIO_CONTROL_URL || "http://127.0.0.1:4100"
    const response = await fetch(`${base}/studio/preview/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ directory: context.directory, url: args.url }),
    })
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error || `Preview registration failed with ${response.status}`)
    }
    return JSON.stringify({ type: "preview", url: args.url })
  },
})
