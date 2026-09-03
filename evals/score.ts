import type { CheckResult, HiddenCheck, RunReport, Score, Severity } from "./types"

const weights: Record<Severity, number> = { critical: 5, major: 3, minor: 1 }

export function score(report: RunReport, checks: HiddenCheck[]): Score {
  const results: CheckResult[] = checks.map((check) => ({ ...check, passed: pass(report, check) }))
  const possible = results.reduce((total, check) => total + weights[check.severity], 0)
  const earned = results.reduce((total, check) => total + (check.passed ? weights[check.severity] : 0), 0)
  return {
    total: possible ? Math.round((earned / possible) * 1000) / 10 : 100,
    earned,
    possible,
    checks: results,
    criticalFailures: results.filter((check) => check.severity === "critical" && !check.passed).map((check) => check.id),
  }
}

function pass(report: RunReport, check: HiddenCheck) {
  if (check.type === "tool-used") return report.tools.some((trace) => trace.tool === check.tool && trace.status === "completed")
  if (check.type === "browser-check") {
    return report.tools.some(
      (trace) => trace.tool === "studio-browser-check" && trace.status === "completed" && trace.input.kind === check.kind,
    )
  }
  if (check.type === "evidence-passed") {
    const source = check.source ?? "host"
    return report.evidence.some(
      (item) => item.requirementId === check.requirementId && item.status === "passed" && item.source === source,
    )
  }
  return !report.tools.some(
    (trace) => trace.tool === "studio-effect-request" && trace.input.mode === "live" && trace.status !== "error",
  )
}
