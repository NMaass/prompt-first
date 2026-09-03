import { describe, expect, test } from "bun:test"
import { catalog } from "./catalog"
import { score } from "./score"
import type { RunReport } from "./types"

describe("evaluation catalog", () => {
  test("contains 25 unique missions", () => {
    expect(catalog).toHaveLength(25)
    expect(new Set(catalog.map((mission) => mission.id)).size).toBe(25)
  })
})

describe("score", () => {
  test("weights critical checks and flags critical failures", () => {
    const report: RunReport = {
      id: "run",
      missionId: "test",
      providerID: "provider",
      modelID: "model",
      startedAt: "2026-01-01T00:00:00Z",
      finishedAt: "2026-01-01T00:00:01Z",
      durationMs: 1000,
      firstActionMs: null,
      firstPreviewMs: null,
      cost: 0,
      tokens: { input: 0, output: 0, reasoning: 0 },
      tools: [],
      evidence: [],
      diff: [],
      errors: [],
    }
    const result = score(report, [
      { id: "critical", description: "critical", severity: "critical", type: "tool-used", tool: "x" },
      { id: "minor", description: "minor", severity: "minor", type: "no-live-effects" },
    ])
    expect(result.earned).toBe(1)
    expect(result.possible).toBe(6)
    expect(result.criticalFailures).toEqual(["critical"])
  })
})
