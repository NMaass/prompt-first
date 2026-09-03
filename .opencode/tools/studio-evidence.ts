import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Publish a builder-reported evidence state for one product requirement. This does not create a host verification receipt.",
  args: {
    requirementId: tool.schema.string(),
    requirement: tool.schema.string(),
    status: tool.schema.enum(["unverified", "testing", "passed", "failed"]),
    method: tool.schema.string(),
    detail: tool.schema.string(),
  },
  async execute(args) {
    return JSON.stringify({ type: "evidence", source: "agent", ...args, recordedAt: new Date().toISOString() })
  },
})
