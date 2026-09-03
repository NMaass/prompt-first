import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Publish evidence or an explicit unverified state for one product requirement",
  args: {
    requirementId: tool.schema.string(),
    requirement: tool.schema.string(),
    status: tool.schema.enum(["unverified", "testing", "passed", "failed"]),
    method: tool.schema.string(),
    detail: tool.schema.string(),
    receipt: tool.schema.string().optional(),
  },
  async execute(args) {
    return JSON.stringify({ type: "evidence", ...args, recordedAt: new Date().toISOString() })
  },
})
