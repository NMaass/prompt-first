export type Severity = "critical" | "major" | "minor"
export type EvidenceSource = "agent" | "host"

export type HiddenCheck =
  | { id: string; description: string; severity: Severity; type: "tool-used"; tool: string }
  | { id: string; description: string; severity: Severity; type: "browser-check"; kind: string }
  | { id: string; description: string; severity: Severity; type: "evidence-passed"; requirementId: string; source?: EvidenceSource }
  | { id: string; description: string; severity: Severity; type: "no-live-effects" }

export type EvalMission = {
  id: string
  title: string
  category: string
  starter: string
  user: string
  problem: string
  outcome: string
  acceptance: string[]
  quality: string[]
  consequences: string[]
  learning: string[]
  hiddenChecks: HiddenCheck[]
}

export type ToolTrace = {
  tool: string
  status: string
  input: Record<string, unknown>
  output?: string
}

export type RunReport = {
  id: string
  missionId: string
  providerID: string
  modelID: string
  startedAt: string
  finishedAt: string
  durationMs: number
  firstActionMs: number | null
  firstPreviewMs: number | null
  cost: number
  tokens: { input: number; output: number; reasoning: number }
  tools: ToolTrace[]
  evidence: Array<{ requirementId: string; status: string; source: EvidenceSource; method: string }>
  diff: Array<{ file: string; additions: number; deletions: number }>
  errors: string[]
}

export type CheckResult = HiddenCheck & { passed: boolean }

export type Score = {
  total: number
  earned: number
  possible: number
  checks: CheckResult[]
  criticalFailures: string[]
}
