import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Publish the current product preview URL to the learner workspace",
  args: {
    url: tool.schema.string().url(),
  },
  async execute(args) {
    return JSON.stringify({ type: "preview", url: args.url })
  },
})
