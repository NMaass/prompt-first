import { describe, expect, test } from "bun:test"
import { EffectGateway, type LiveEffectExecutor } from "../src/effects"

const draft = {
  workspaceId: "workspace",
  kind: "payment" as const,
  mode: "mock" as const,
  operation: "charge",
  destination: "test customer",
  summary: "Charge $10 in the simulator",
}

describe("EffectGateway", () => {
  test("mock effects execute without approval and replay idempotently", async () => {
    const gateway = new EffectGateway()
    const effect = gateway.request(draft)
    const first = await gateway.execute({ effectId: effect.id, idempotencyKey: "same" })
    const replay = await gateway.execute({ effectId: effect.id, idempotencyKey: "same" })
    expect(first.status).toBe("succeeded")
    expect(first.mode).toBe("mock")
    expect(replay.id).toBe(first.id)
    expect(replay.replayed).toBe(true)
  })

  test("live effects are denied without exact approval", async () => {
    const gateway = new EffectGateway(new FakeLive())
    const effect = gateway.request({ ...draft, mode: "live" })
    const receipt = await gateway.execute({ effectId: effect.id, idempotencyKey: "one" })
    expect(receipt.status).toBe("failed")
    expect(receipt.summary).toContain("approval")
  })

  test("approval is one-time and bound to the effect", async () => {
    const gateway = new EffectGateway(new FakeLive())
    const first = gateway.request({ ...draft, mode: "live" })
    const second = gateway.request({ ...draft, mode: "live", summary: "Different charge" })
    const approval = gateway.approve(first.id)

    const wrong = await gateway.execute({
      effectId: second.id,
      idempotencyKey: "wrong",
      approvalToken: approval.token,
    })
    expect(wrong.status).toBe("failed")

    const ok = await gateway.execute({
      effectId: first.id,
      idempotencyKey: "ok",
      approvalToken: approval.token,
    })
    expect(ok.status).toBe("succeeded")

    const reused = await gateway.execute({
      effectId: first.id,
      idempotencyKey: "different-key",
      approvalToken: approval.token,
    })
    expect(reused.status).toBe("failed")
  })
})

class FakeLive implements LiveEffectExecutor {
  async execute() {
    return { externalId: "live_test", summary: "Executed live effect" }
  }
}
