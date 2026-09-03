import type { EffectDraft, EffectReceipt, EffectRequest } from "./types"

type Approval = {
  token: string
  effectId: string
  fingerprint: string
  used: boolean
  expiresAt: number
}

type ExecuteInput = {
  effectId: string
  idempotencyKey: string
  approvalToken?: string
}

export interface LiveEffectExecutor {
  execute(effect: EffectRequest, idempotencyKey: string): Promise<{ externalId?: string; summary: string }>
}

export class WebhookLiveExecutor implements LiveEffectExecutor {
  constructor(
    private readonly url: string,
    private readonly token?: string,
  ) {}

  async execute(effect: EffectRequest, idempotencyKey: string) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify(effect),
    })
    if (!response.ok) throw new Error(`Live effect executor returned ${response.status}`)
    const body = (await response.json().catch(() => ({}))) as { id?: string; summary?: string }
    return {
      externalId: body.id,
      summary: body.summary || `Live ${effect.kind} effect completed`,
    }
  }
}

export class EffectGateway {
  #effects = new Map<string, EffectRequest>()
  #approvals = new Map<string, Approval>()
  #receipts = new Map<string, EffectReceipt>()

  constructor(private readonly live?: LiveEffectExecutor) {}

  request(draft: EffectDraft) {
    const effect: EffectRequest = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    this.#effects.set(effect.id, effect)
    return effect
  }

  approve(effectId: string) {
    const effect = this.#require(effectId)
    if (effect.mode !== "live") throw new Error("Mock effects do not require approval")
    const approval: Approval = {
      token: crypto.randomUUID(),
      effectId,
      fingerprint: fingerprint(effect),
      used: false,
      expiresAt: Date.now() + 5 * 60_000,
    }
    this.#approvals.set(approval.token, approval)
    return { token: approval.token, expiresAt: new Date(approval.expiresAt).toISOString() }
  }

  async execute(input: ExecuteInput) {
    const effect = this.#require(input.effectId)
    const key = `${effect.id}:${input.idempotencyKey}`
    const existing = this.#receipts.get(key)
    if (existing) return { ...existing, replayed: true }

    if (effect.mode === "live") this.#consumeApproval(effect, input.approvalToken)

    try {
      const result = effect.mode === "mock" ? mock(effect) : await this.#executeLive(effect, input.idempotencyKey)
      const receipt: EffectReceipt = {
        id: crypto.randomUUID(),
        effectId: effect.id,
        mode: effect.mode,
        kind: effect.kind,
        status: "succeeded",
        summary: result.summary,
        externalId: result.externalId,
        createdAt: new Date().toISOString(),
        replayed: false,
      }
      this.#receipts.set(key, receipt)
      return receipt
    } catch (error) {
      const receipt: EffectReceipt = {
        id: crypto.randomUUID(),
        effectId: effect.id,
        mode: effect.mode,
        kind: effect.kind,
        status: "failed",
        summary: error instanceof Error ? error.message : "Effect failed",
        createdAt: new Date().toISOString(),
        replayed: false,
      }
      this.#receipts.set(key, receipt)
      return receipt
    }
  }

  #require(id: string) {
    const effect = this.#effects.get(id)
    if (!effect) throw new Error("Unknown effect request")
    return effect
  }

  #consumeApproval(effect: EffectRequest, token?: string) {
    if (!token) throw new Error("Live effects require approval")
    const approval = this.#approvals.get(token)
    if (!approval || approval.used) throw new Error("Approval is invalid or already used")
    if (approval.expiresAt < Date.now()) throw new Error("Approval has expired")
    if (approval.effectId !== effect.id || approval.fingerprint !== fingerprint(effect)) {
      throw new Error("Approval does not match this effect")
    }
    approval.used = true
  }

  async #executeLive(effect: EffectRequest, idempotencyKey: string) {
    if (!this.live) throw new Error("No live effect executor is configured")
    return this.live.execute(effect, idempotencyKey)
  }
}

function fingerprint(effect: EffectRequest) {
  return JSON.stringify({
    id: effect.id,
    workspaceId: effect.workspaceId,
    kind: effect.kind,
    operation: effect.operation,
    destination: effect.destination,
    summary: effect.summary,
    payload: effect.payload ?? {},
  })
}

function mock(effect: EffectRequest) {
  return {
    externalId: `mock_${effect.kind}_${effect.id.slice(0, 8)}`,
    summary: `Simulated ${effect.kind}: ${effect.summary}`,
  }
}
