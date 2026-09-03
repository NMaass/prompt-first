import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Publish the current learner-visible Mission Contract",
  args: {
    title: tool.schema.string(),
    user: tool.schema.string(),
    problem: tool.schema.string(),
    outcome: tool.schema.string(),
    acceptance: tool.schema.array(tool.schema.string()),
    quality: tool.schema.array(tool.schema.string()),
    constraints: tool.schema.array(tool.schema.string()),
    consequences: tool.schema.array(tool.schema.string()),
    assumptions: tool.schema.array(tool.schema.string()),
    unresolved: tool.schema.array(tool.schema.string()),
  },
  async execute(args) {
    return JSON.stringify({ type: "mission-contract", ...args })
  },
})
