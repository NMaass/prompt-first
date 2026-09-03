export type MissionSeed = {
  id: string
  title: string
  starter: string
  user: string
  problem: string
  outcome: string
  acceptance: string[]
  quality: string[]
  consequences: string[]
  learning: string[]
}

export type WorkspaceRecord = {
  id: string
  directory: string
  runtime: "web-react"
  isolation: "development-only"
  createdAt: string
  mission: MissionSeed
}

export interface WorkspaceProvider {
  create(mission: MissionSeed): Promise<WorkspaceRecord>
  destroy(id: string): Promise<boolean>
  get(id: string): WorkspaceRecord | undefined
  findByDirectory(directory: string): WorkspaceRecord | undefined
}

export type EffectKind = "email" | "payment" | "webhook" | "identity"
export type EffectMode = "mock" | "live"

export type EffectDraft = {
  workspaceId: string
  kind: EffectKind
  mode: EffectMode
  operation: string
  destination: string
  summary: string
  payload?: Record<string, unknown>
}

export type EffectRequest = EffectDraft & {
  id: string
  createdAt: string
}

export type EffectReceipt = {
  id: string
  effectId: string
  mode: EffectMode
  kind: EffectKind
  status: "succeeded" | "failed"
  summary: string
  externalId?: string
  createdAt: string
  replayed: boolean
}

export type BrowserCheckKind = "smoke" | "responsive" | "keyboard" | "accessibility" | "performance"

export type BrowserCheckRequest = {
  directory: string
  url: string
  kind: BrowserCheckKind
}

export type BrowserCheckReceipt = {
  id: string
  kind: BrowserCheckKind
  status: "passed" | "failed"
  summary: string
  detail: Record<string, unknown>
  createdAt: string
}
