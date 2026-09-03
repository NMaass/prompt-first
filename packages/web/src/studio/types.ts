export type Mission = {
  id: string
  title: string
  summary: string
  starter: string
  user: string
  problem: string
  outcome: string
  acceptance: string[]
  quality: string[]
  consequences: string[]
  learning: string[]
  level: 1 | 2 | 3 | "custom"
}

export type Workspace = {
  id: string
  directory: string
  runtime: "web-react"
  isolation: "development-only"
  createdAt: string
  mission: Mission
}

export type MissionContract = {
  title: string
  user: string
  problem: string
  outcome: string
  acceptance: string[]
  quality: string[]
  constraints: string[]
  consequences: string[]
  assumptions: string[]
  unresolved: string[]
}

export type ProductMap = {
  actors: string[]
  surfaces: string[]
  data: string[]
  integrations: string[]
  flows: string[]
  permissions: string[]
}

export type EvidenceStatus = "unverified" | "testing" | "passed" | "failed"

export type Evidence = {
  requirementId: string
  requirement: string
  status: EvidenceStatus
  method: string
  detail: string
  receipt?: string
  recordedAt?: string
}

export type LearningNote = {
  concept: "requirements" | "responsive" | "accessibility" | "consequences" | "performance" | "evidence"
  title: string
  explanation: string
  whyNow: string
  videoKey?: string
}

export type EffectDraft = {
  callId: string
  kind: "email" | "payment" | "webhook" | "identity"
  mode: "mock" | "live"
  operation: string
  destination: string
  summary: string
}

export type HostEffect = EffectDraft & {
  id: string
  workspaceId: string
  createdAt: string
}

export type EffectReceipt = {
  id: string
  effectId: string
  mode: "mock" | "live"
  kind: "email" | "payment" | "webhook" | "identity"
  status: "succeeded" | "failed"
  summary: string
  externalId?: string
  createdAt: string
  replayed: boolean
}
