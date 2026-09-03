import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Request a simulated or live external effect through the trusted host boundary",
  args: {
    kind: tool.schema.enum(["email", "payment", "webhook", "identity"]),
    mode: tool.schema.enum(["mock", "live"]),
    operation: tool.schema.string(),
    destination: tool.schema.string(),
    summary: tool.schema.string(),
  },
  async execute(args) {
    return JSON.stringify({ type: "effect-request", ...args })
  },
})
