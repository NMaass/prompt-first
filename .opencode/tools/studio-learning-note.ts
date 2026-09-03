import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Publish one just-in-time learning note tied to the learner's current product or evidence gap",
  args: {
    concept: tool.schema.enum(["requirements", "responsive", "accessibility", "consequences", "performance", "evidence"]),
    title: tool.schema.string(),
    explanation: tool.schema.string(),
    whyNow: tool.schema.string(),
    videoKey: tool.schema.enum(["requirements", "responsive", "accessibility", "consequences", "performance", "evidence"]).optional(),
  },
  async execute(args) {
    return JSON.stringify({ type: "learning-note", ...args })
  },
})
