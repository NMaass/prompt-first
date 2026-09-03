import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Publish the learner-visible Product Map",
  args: {
    actors: tool.schema.array(tool.schema.string()),
    surfaces: tool.schema.array(tool.schema.string()),
    data: tool.schema.array(tool.schema.string()),
    integrations: tool.schema.array(tool.schema.string()),
    flows: tool.schema.array(tool.schema.string()),
    permissions: tool.schema.array(tool.schema.string()),
  },
  async execute(args) {
    return JSON.stringify({ type: "product-map", ...args })
  },
})
