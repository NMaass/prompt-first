import type { ToolPart } from "@opencode-ai/sdk"
import type { TimelineMessage } from "@/hooks/useSession"
import type { EffectDraft, Evidence, LearningNote, Mission, MissionContract, ProductMap } from "./types"

export type StudioState = {
  contract: MissionContract
  map: ProductMap
  evidence: Evidence[]
  previewUrl: string | null
  effects: EffectDraft[]
  learning: LearningNote[]
}

export function deriveStudioState(messages: TimelineMessage[], mission: Mission): StudioState {
  let contract = initialContract(mission)
  let map: ProductMap = { actors: [], surfaces: [], data: [], integrations: [], flows: [], permissions: [] }
  let previewUrl: string | null = null
  const evidence = new Map(initialEvidence(mission).map((item) => [item.requirementId, item]))
  const effects = new Map<string, EffectDraft>()
  const learning = new Map<string, LearningNote>()

  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type !== "tool" || part.state.status !== "completed") continue
      const input = part.state.input
      if (part.tool === "studio-contract" && isContract(input)) contract = input
      if (part.tool === "studio-map" && isMap(input)) map = input
      if (part.tool === "studio-preview" && isPreview(input)) previewUrl = input.url
      if (part.tool === "studio-evidence" && isEvidence(input)) evidence.set(input.requirementId, input)
      if (part.tool === "studio-browser-check") {
        const item = browserEvidence(part)
        if (item) evidence.set(item.requirementId, item)
      }
      if (part.tool === "studio-effect-request" && isEffect(input)) {
        effects.set(part.callID, { callId: part.callID, ...input })
      }
      if (part.tool === "studio-learning-note" && isLearning(input)) learning.set(part.callID, input)
    }
  }

  return { contract, map, evidence: [...evidence.values()], previewUrl, effects: [...effects.values()], learning: [...learning.values()] }
}

function initialContract(mission: Mission): MissionContract {
  return {
    title: mission.title,
    user: mission.user,
    problem: mission.problem,
    outcome: mission.outcome,
    acceptance: mission.acceptance,
    quality: mission.quality,
    constraints: ["Initial runtime profile: responsive web application", "External effects begin in mock mode"],
    consequences: mission.consequences,
    assumptions: [],
    unresolved: [],
  }
}

function initialEvidence(mission: Mission): Evidence[] {
  return [
    ...mission.acceptance.map((requirement, index) => ({
      requirementId: `A${index + 1}`,
      requirement,
      status: "unverified" as const,
      method: "Not tested yet",
      detail: "The builder has not attached evidence for this requirement yet.",
    })),
    ...mission.quality.map((requirement, index) => ({
      requirementId: `Q${index + 1}`,
      requirement,
      status: "unverified" as const,
      method: "Not tested yet",
      detail: "The builder has not attached evidence for this quality requirement yet.",
    })),
  ]
}

function isContract(value: Record<string, unknown>): value is MissionContract {
  return (
    strings(value.acceptance) &&
    strings(value.quality) &&
    strings(value.constraints) &&
    strings(value.consequences) &&
    strings(value.assumptions) &&
    strings(value.unresolved) &&
    [value.title, value.user, value.problem, value.outcome].every((item) => typeof item === "string")
  )
}

function isMap(value: Record<string, unknown>): value is ProductMap {
  return [value.actors, value.surfaces, value.data, value.integrations, value.flows, value.permissions].every(strings)
}

function isPreview(value: Record<string, unknown>): value is Record<string, unknown> & { url: string } {
  return typeof value.url === "string"
}

function isEvidence(value: Record<string, unknown>): value is Evidence {
  return (
    typeof value.requirementId === "string" &&
    typeof value.requirement === "string" &&
    ["unverified", "testing", "passed", "failed"].includes(String(value.status)) &&
    typeof value.method === "string" &&
    typeof value.detail === "string"
  )
}

function isEffect(value: Record<string, unknown>): value is Omit<EffectDraft, "callId"> {
  return (
    ["email", "payment", "webhook", "identity"].includes(String(value.kind)) &&
    ["mock", "live"].includes(String(value.mode)) &&
    typeof value.operation === "string" &&
    typeof value.destination === "string" &&
    typeof value.summary === "string"
  )
}

function browserEvidence(part: ToolPart): Evidence | null {
  if (part.state.status !== "completed") return null
  const input = part.state.input
  if (typeof input.requirementId !== "string" || typeof input.requirement !== "string") return null
  try {
    const output = JSON.parse(part.state.output) as {
      receipt?: { status?: string; summary?: string; id?: string; kind?: string }
    }
    const receipt = output.receipt
    if (!receipt) return null
    return {
      requirementId: input.requirementId,
      requirement: input.requirement,
      status: receipt.status === "passed" ? "passed" : "failed",
      method: `Browser ${receipt.kind || "check"}`,
      detail: receipt.summary || "Browser verification completed",
      receipt: receipt.id,
      recordedAt: new Date().toISOString(),
    }
  } catch {
    return null
  }
}

function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

function isLearning(value: Record<string, unknown>): value is LearningNote {
  return (
    ["requirements", "responsive", "accessibility", "consequences", "performance", "evidence"].includes(String(value.concept)) &&
    typeof value.title === "string" &&
    typeof value.explanation === "string" &&
    typeof value.whyNow === "string" &&
    (value.videoKey === undefined || typeof value.videoKey === "string")
  )
}
