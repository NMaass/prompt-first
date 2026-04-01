import type { PluginModule } from "@opencode-ai/plugin"

// Lifecycle stages for the product creation process
type Stage =
  | "ideation"
  | "prompt_crafting"
  | "spec_drafting"
  | "spec_review"
  | "plan_review"
  | "building"
  | "evaluating"
  | "refining"

interface LifecycleState {
  stage: Stage
  promptCount: number
  planCount: number
  iterationCount: number
  specExists: boolean
  lastToolUsed: string
  lastUserMessage: string
  coachingHint: string
}

const sessions = new Map<string, LifecycleState>()

function getState(sessionID: string): LifecycleState {
  if (!sessions.has(sessionID)) {
    sessions.set(sessionID, {
      stage: "ideation",
      promptCount: 0,
      planCount: 0,
      iterationCount: 0,
      specExists: false,
      lastToolUsed: "",
      lastUserMessage: "",
      coachingHint: "Describe what you want to build. Be specific about who will use it and what problem it solves.",
    })
  }
  return sessions.get(sessionID)!
}

function detectStageTransition(state: LifecycleState, tool: string, args: any): void {
  const prev = state.stage

  // Detect spec creation/update
  if (tool === "write" || tool === "edit") {
    const target = args?.file_path || args?.path || ""
    if (target.includes("spec")) {
      state.specExists = true
      if (state.stage === "ideation" || state.stage === "prompt_crafting") {
        state.stage = "spec_drafting"
        state.coachingHint =
          "The builder is drafting a product specification. Review it carefully when it's ready — does it capture your vision?"
      }
    }
    if (target.includes("blocks") || target.includes("block")) {
      if (state.stage !== "building" && state.stage !== "refining") {
        state.stage = "building"
        state.coachingHint =
          "The builder is creating your app. Watch the preview to see it take shape. Does each change match what you expected?"
      }
    }
  }

  // Detect plan mode
  if (tool === "plan_enter") {
    state.planCount++
    state.stage = "plan_review"
    state.coachingHint =
      "Read the plan carefully. Does each step make sense? Is anything missing from your spec? Ask questions before approving."
  }

  if (tool === "plan_exit") {
    state.stage = "building"
    state.coachingHint = "Building is underway. Watch the preview for changes."
  }

  // Detect evaluation
  if (tool === "read" && (args?.file_path || "").includes("spec")) {
    if (state.stage === "building") {
      state.stage = "evaluating"
      state.coachingHint =
        "Time to check the product against the spec. Go through each acceptance criterion. Try the app in the preview."
    }
  }

  state.lastToolUsed = tool

  if (prev !== state.stage) {
    console.log(`[lifecycle] Stage transition: ${prev} → ${state.stage} (trigger: ${tool})`)
  }
}

function detectStageFromMessage(state: LifecycleState, message: string): void {
  const lower = message.toLowerCase()
  const prev = state.stage

  state.promptCount++
  state.lastUserMessage = message

  // First message is ideation
  if (state.promptCount === 1) {
    state.stage = "ideation"
    // Check if it's a vague prompt
    if (message.length < 30 || !lower.includes("for") || lower.split(" ").length < 8) {
      state.coachingHint =
        "Good start! Can you add more detail? Who will use this, what should they be able to do, and how should it feel?"
    } else {
      state.coachingHint = "Great description! The builder will draft a product spec based on your idea."
      state.stage = "prompt_crafting"
    }
    return
  }

  // Detect spec review feedback
  if (state.stage === "spec_drafting" || state.stage === "spec_review") {
    if (lower.includes("looks good") || lower.includes("approve") || lower.includes("let's build")) {
      state.stage = "spec_review"
      state.coachingHint =
        "Spec approved! The builder will create a plan. Review each step before it starts building."
    } else {
      state.stage = "spec_review"
      state.coachingHint =
        "Good feedback on the spec. The builder will update it based on your input. Keep refining until it matches your vision."
    }
    return
  }

  // Detect refinement feedback
  if (state.stage === "building" || state.stage === "evaluating" || state.stage === "refining") {
    if (
      lower.includes("doesn't work") ||
      lower.includes("broken") ||
      lower.includes("missing") ||
      lower.includes("change") ||
      lower.includes("fix") ||
      lower.includes("improve") ||
      lower.includes("not right") ||
      lower.includes("should be")
    ) {
      state.stage = "refining"
      state.iterationCount++
      state.coachingHint =
        "Good feedback. Describe the problem you see, not the solution. The builder will figure out the best way to fix it."
    }
  }

  if (prev !== state.stage) {
    console.log(`[lifecycle] Stage transition: ${prev} → ${state.stage} (trigger: user message)`)
  }
}

export default {
  id: "lifecycle-tracker",
  server: async (input) => {
    const { client } = input

    return {
      "chat.message": async ({ sessionID }, { message }) => {
        if (!message?.parts?.length) return
        const text = message.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join(" ")
        if (text) {
          const state = getState(sessionID)
          detectStageFromMessage(state, text)
        }
      },

      "tool.execute.before": async ({ tool, sessionID }, { args }) => {
        const state = getState(sessionID)
        detectStageTransition(state, tool, args)
      },

      "tool.execute.after": async ({ tool, sessionID }) => {
        // Track completion for metrics
        const state = getState(sessionID)
        state.lastToolUsed = tool
      },

      "experimental.chat.system.transform": async ({ sessionID }, { system }) => {
        if (!sessionID) return
        const state = getState(sessionID)

        // Inject lifecycle context into the system prompt
        system.push(`
## Current Lifecycle Context

The learner is currently in the **${state.stage}** stage of building their product.

- Prompts sent so far: ${state.promptCount}
- Plans reviewed: ${state.planCount}
- Iteration cycles: ${state.iterationCount}
- Product spec exists: ${state.specExists ? "yes" : "not yet"}

### Stage-Specific Guidance

${getStageGuidance(state)}

### Coaching Hint for Learner
When appropriate, share this guidance with the learner: "${state.coachingHint}"
`)
      },
    }
  },
} satisfies PluginModule

function getStageGuidance(state: LifecycleState): string {
  switch (state.stage) {
    case "ideation":
      return `The learner just described their idea. Help them refine it into something specific enough to build a spec from. Ask clarifying questions about the target user, key features, and desired feel.`
    case "prompt_crafting":
      return `The learner has provided a description. If it's clear enough, proceed to draft a product spec. If it's vague, ask 1-2 clarifying questions first.`
    case "spec_drafting":
      return `You are drafting the product specification. Include: overview, target user, features list, acceptance criteria (testable statements), visual design notes, and constraints. Write in plain language the learner can evaluate.`
    case "spec_review":
      return `The learner is reviewing the spec. Listen to their feedback and update the spec accordingly. Don't proceed to building until they explicitly approve.`
    case "plan_review":
      return `You've proposed a plan. Wait for the learner to review and approve before executing. Answer any questions about the plan in plain language.`
    case "building":
      return `You are actively building. Make changes in small batches and explain each batch in product terms. Update the preview frequently so the learner can see progress.`
    case "evaluating":
      return `Compare the current product against the spec. Go through each acceptance criterion and report what passes and what doesn't, in language the learner can verify by using the preview.`
    case "refining":
      return `The learner has identified issues. Address their feedback, make targeted changes, and re-evaluate against the spec after each change.`
  }
}
