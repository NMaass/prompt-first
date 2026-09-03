import type { BrowserVerifier } from "./browser"
import type { EffectGateway } from "./effects"
import type { EffectDraft, MissionSeed, WorkspaceProvider } from "./types"

export function createControlServer(input: {
  port: number
  workspaces: WorkspaceProvider
  effects: EffectGateway
  browser: BrowserVerifier
  opencodeUrl: string
}) {
  return Bun.serve({
    hostname: "127.0.0.1",
    port: input.port,
    async fetch(request) {
      try {
        const url = new URL(request.url)
        if (request.method === "OPTIONS") return new Response(null, { headers: cors() })
        if (request.method === "GET" && url.pathname === "/studio/health") {
          return json({
            ok: true,
            opencodeUrl: input.opencodeUrl,
            model: process.env.STUDIO_MODEL || "openrouter/z-ai/glm-5.3-flash",
            modelCredentialConfigured: Boolean(process.env.OPENROUTER_API_KEY),
            workspaceIsolation: "development-only",
            liveEffectsConfigured: Boolean(process.env.STUDIO_LIVE_EFFECT_URL),
          })
        }

        if (request.method === "POST" && url.pathname === "/studio/workspaces") {
          const body = mission(await request.json())
          return json(await input.workspaces.create(body), 201)
        }

        const workspace = url.pathname.match(/^\/studio\/workspaces\/([^/]+)$/)
        if (request.method === "DELETE" && workspace) {
          return json({ removed: await input.workspaces.destroy(workspace[1]!) })
        }

        if (request.method === "POST" && url.pathname === "/studio/preview/register") {
          const body = preview(await request.json())
          return json({ origin: input.workspaces.registerPreview(body.directory, body.url) }, 201)
        }

        if (request.method === "POST" && url.pathname === "/studio/effects") {
          const body = effect(await request.json())
          if (!input.workspaces.get(body.workspaceId)) throw new Error("Unknown workspace")
          return json(input.effects.request(body), 201)
        }

        const approval = url.pathname.match(/^\/studio\/effects\/([^/]+)\/approve$/)
        if (request.method === "POST" && approval) {
          return json(input.effects.approve(approval[1]!))
        }

        const execution = url.pathname.match(/^\/studio\/effects\/([^/]+)\/execute$/)
        if (request.method === "POST" && execution) {
          const body = execute(await request.json())
          return json(
            await input.effects.execute({
              effectId: execution[1]!,
              idempotencyKey: body.idempotencyKey,
              approvalToken: body.approvalToken,
            }),
          )
        }

        if (request.method === "POST" && url.pathname === "/studio/browser/check") {
          const body = browserCheck(await request.json())
          if (!input.workspaces.allowsPreview(body.directory, body.url)) {
            throw new Error("Browser check must target the registered preview for this workspace")
          }
          return json(await input.browser.check(body.url, body.kind))
        }

        return json({ error: "Not found" }, 404)
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : "Request failed" }, 400)
      }
    },
  })
}

function mission(value: unknown): MissionSeed {
  const item = record(value)
  return {
    id: text(item.id, "id"),
    title: text(item.title, "title"),
    starter: text(item.starter, "starter"),
    user: text(item.user, "user"),
    problem: text(item.problem, "problem"),
    outcome: text(item.outcome, "outcome"),
    acceptance: texts(item.acceptance, "acceptance"),
    quality: texts(item.quality, "quality"),
    consequences: texts(item.consequences, "consequences"),
    learning: texts(item.learning, "learning"),
  }
}

function effect(value: unknown): EffectDraft {
  const item = record(value)
  const kind = text(item.kind, "kind")
  const mode = text(item.mode, "mode")
  if (!["email", "payment", "webhook", "identity"].includes(kind)) throw new Error("Invalid effect kind")
  if (!["mock", "live"].includes(mode)) throw new Error("Invalid effect mode")
  return {
    workspaceId: text(item.workspaceId, "workspaceId"),
    kind: kind as EffectDraft["kind"],
    mode: mode as EffectDraft["mode"],
    operation: text(item.operation, "operation"),
    destination: text(item.destination, "destination"),
    summary: text(item.summary, "summary"),
    payload: item.payload === undefined ? undefined : record(item.payload),
  }
}

function execute(value: unknown) {
  const item = record(value)
  return {
    idempotencyKey: text(item.idempotencyKey, "idempotencyKey"),
    approvalToken: item.approvalToken === undefined ? undefined : text(item.approvalToken, "approvalToken"),
  }
}

function preview(value: unknown) {
  const item = record(value)
  return {
    directory: text(item.directory, "directory"),
    url: text(item.url, "url"),
  }
}

function browserCheck(value: unknown) {
  const item = record(value)
  const kind = text(item.kind, "kind")
  if (!["smoke", "responsive", "keyboard", "accessibility", "performance"].includes(kind)) {
    throw new Error("Invalid browser check kind")
  }
  return {
    directory: text(item.directory, "directory"),
    url: text(item.url, "url"),
    kind: kind as "smoke" | "responsive" | "keyboard" | "accessibility" | "performance",
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object")
  return value as Record<string, unknown>
}

function text(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string`)
  return value
}

function texts(value: unknown, field: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw new Error(`${field} must be a string array`)
  return value as string[]
}

function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: cors() })
}

function cors() {
  return {
    "access-control-allow-origin": "http://localhost:3000",
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type",
  }
}
