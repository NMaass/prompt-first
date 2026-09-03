import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { createOpencodeClient, type Event, type Part, type ToolPart } from "@opencode-ai/sdk"
import { catalog, findMission } from "./catalog"
import { score } from "./score"
import type { EvalMission, RunReport, ToolTrace } from "./types"

const args = parse(Bun.argv.slice(2))
const selected = args.mission ? [findMission(args.mission)].filter((item): item is EvalMission => Boolean(item)) : catalog
if (!selected.length) throw new Error(`Unknown mission: ${args.mission}`)

const ownedServer = await ensureServer()
try {
  for (const mission of selected) {
    for (let repetition = 0; repetition < args.repetitions; repetition++) {
      const report = await run(mission, args.model)
      const result = score(report, mission.hiddenChecks)
      const out = { mission, report, score: result }
      await mkdir(path.join(import.meta.dir, "runs"), { recursive: true })
      const file = path.join(import.meta.dir, "runs", `${report.id}.json`)
      await writeFile(file, JSON.stringify(out, null, 2))
      console.log(`${mission.id} run ${repetition + 1}: ${result.total}% · ${file}`)
    }
  }
} finally {
  ownedServer?.kill()
}

async function run(mission: EvalMission, configuredModel: string): Promise<RunReport> {
  const started = Date.now()
  const startedAt = new Date(started).toISOString()
  const errors: string[] = []
  const workspace = await createWorkspace(mission)
  const client = createOpencodeClient({ baseUrl: "http://127.0.0.1:4096" })
  const controller = new AbortController()
  let firstActionMs: number | null = null
  let firstPreviewMs: number | null = null
  let sessionID = ""

  try {
    const events = await client.event.subscribe({ query: { directory: workspace.directory }, signal: controller.signal })
    const created = await client.session.create({
      query: { directory: workspace.directory },
      body: { title: `[eval] ${mission.title}` },
    })
    if (!created.data) throw new Error("OpenCode did not create an evaluation session")
    sessionID = created.data.id

    const finished = waitForFinish(events.stream, sessionID, started, (milestone) => {
      if (milestone === "action" && firstActionMs === null) firstActionMs = Date.now() - started
      if (milestone === "preview" && firstPreviewMs === null) firstPreviewMs = Date.now() - started
    })

    await client.session.promptAsync({
      path: { id: sessionID },
      query: { directory: workspace.directory },
      body: {
        agent: "studio-builder",
        model: splitModel(configuredModel),
        parts: [{ type: "text", text: prompt(mission) }],
      },
    })

    await Promise.race([
      finished,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Evaluation timed out after 8 minutes")), 8 * 60_000)),
    ])

    const messages = await client.session.messages({ path: { id: sessionID }, query: { directory: workspace.directory } })
    const diff = await client.session.diff({ path: { id: sessionID }, query: { directory: workspace.directory } })
    const entries = messages.data ?? []
    const parts = entries.flatMap((entry) => entry.parts)
    const tools = traces(parts)
    const evidence = evidenceFrom(tools)
    const usage = entries.reduce(
      (total, entry) => {
        if (entry.info.role !== "assistant") return total
        total.cost += entry.info.cost
        total.input += entry.info.tokens.input
        total.output += entry.info.tokens.output
        total.reasoning += entry.info.tokens.reasoning
        return total
      },
      { cost: 0, input: 0, output: 0, reasoning: 0 },
    )
    const finishedAt = new Date().toISOString()
    return {
      id: `${mission.id}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      missionId: mission.id,
      ...splitModel(configuredModel),
      startedAt,
      finishedAt,
      durationMs: Date.now() - started,
      firstActionMs,
      firstPreviewMs,
      cost: usage.cost,
      tokens: { input: usage.input, output: usage.output, reasoning: usage.reasoning },
      tools,
      evidence,
      diff: (diff.data ?? []).map((item) => ({
        file: item.file,
        additions: item.additions,
        deletions: item.deletions,
      })),
      errors,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Evaluation failed")
    return {
      id: `${mission.id}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      missionId: mission.id,
      ...splitModel(configuredModel),
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      firstActionMs,
      firstPreviewMs,
      cost: 0,
      tokens: { input: 0, output: 0, reasoning: 0 },
      tools: [],
      evidence: [],
      diff: [],
      errors,
    }
  } finally {
    controller.abort()
    await fetch(`http://127.0.0.1:4100/studio/workspaces/${workspace.id}`, { method: "DELETE" }).catch(() => undefined)
  }
}

async function waitForFinish(stream: AsyncIterable<Event>, sessionID: string, started: number, milestone: (kind: "action" | "preview") => void) {
  for await (const event of stream) {
    if (event.type === "message.part.updated") {
      const part = event.properties.part
      if (part.sessionID !== sessionID || part.type !== "tool") continue
      milestone("action")
      if (part.tool === "studio-preview") milestone("preview")
    }
    if (event.type === "session.error" && (!event.properties.sessionID || event.properties.sessionID === sessionID)) {
      throw new Error(event.properties.error?.data.message || `Evaluation session failed after ${Date.now() - started}ms`)
    }
    if (event.type === "session.idle" && event.properties.sessionID === sessionID) return
  }
  throw new Error("Event stream ended before the session became idle")
}

function traces(parts: Part[]): ToolTrace[] {
  return parts.filter(isTool).map((part) => ({
    tool: part.tool,
    status: part.state.status,
    input: part.state.input,
    output: part.state.status === "completed" ? part.state.output : undefined,
  }))
}

function evidenceFrom(tools: ToolTrace[]) {
  const evidence = new Map<string, { requirementId: string; status: string; method: string }>()
  for (const trace of tools) {
    if (trace.tool === "studio-evidence" && typeof trace.input.requirementId === "string") {
      evidence.set(trace.input.requirementId, {
        requirementId: trace.input.requirementId,
        status: String(trace.input.status),
        method: String(trace.input.method || "agent evidence"),
      })
    }
    if (trace.tool === "studio-browser-check" && trace.status === "completed" && trace.output) {
      try {
        const parsed = JSON.parse(trace.output) as { requirementId?: string; receipt?: { status?: string; kind?: string } }
        if (!parsed.requirementId || !parsed.receipt) continue
        evidence.set(parsed.requirementId, {
          requirementId: parsed.requirementId,
          status: parsed.receipt.status === "passed" ? "passed" : "failed",
          method: `browser ${parsed.receipt.kind || "check"}`,
        })
      } catch {
        continue
      }
    }
  }
  return [...evidence.values()]
}

async function createWorkspace(mission: EvalMission) {
  const response = await fetch("http://127.0.0.1:4100/studio/workspaces", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...mission, learning: mission.learning }),
  })
  if (!response.ok) throw new Error(`Workspace creation failed with ${response.status}`)
  return (await response.json()) as { id: string; directory: string }
}

async function ensureServer() {
  if (await healthy()) return null
  const child = Bun.spawn(["bun", "--cwd", "packages/studio-server", "start"], { stdout: "inherit", stderr: "inherit" })
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    if (await healthy()) return child
    await Bun.sleep(250)
  }
  child.kill()
  throw new Error("Studio server did not become healthy")
}

async function healthy() {
  try {
    const response = await fetch("http://127.0.0.1:4100/studio/health")
    return response.ok
  } catch {
    return false
  }
}

function prompt(mission: EvalMission) {
  const acceptance = mission.acceptance.map((item, index) => `A${index + 1}: ${item}`).join("\n")
  const quality = mission.quality.map((item, index) => `Q${index + 1}: ${item}`).join("\n")
  return `${mission.starter}\n\nAcceptance IDs:\n${acceptance}\n\nQuality IDs:\n${quality}\n\nStart reversible implementation immediately. Publish the Mission Contract, Product Map, and preview. Gather evidence before claiming readiness.`
}

function splitModel(value: string) {
  const index = value.indexOf("/")
  if (index < 1) throw new Error("Model must use provider/model format")
  return { providerID: value.slice(0, index), modelID: value.slice(index + 1) }
}

function parse(argv: string[]) {
  const value = (flag: string) => argv[argv.indexOf(flag) + 1]
  return {
    mission: argv.includes("--mission") ? value("--mission") : undefined,
    repetitions: argv.includes("--repetitions") ? Number(value("--repetitions")) : 1,
    model: argv.includes("--model") ? value("--model")! : process.env.STUDIO_MODEL || "openrouter/z-ai/glm-5.3-flash",
  }
}

function isTool(part: Part): part is ToolPart {
  return part.type === "tool"
}
