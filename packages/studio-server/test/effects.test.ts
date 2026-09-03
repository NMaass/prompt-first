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
    await expect(gateway.execute({ effectId: effect.id, idempotencyKey: "one" })).rejects.toThrow(
      "Live effects require approval",
    )
  })

  test("approval is one-time and bound to the effect", async () => {
    const gateway = new EffectGateway(new FakeLive())
    const first = gateway.request({ ...draft, mode: "live" })
    const second = gateway.request({ ...draft, mode: "live", summary: "Different charge" })
    const approval = gateway.approve(first.id)

    await expect(
      gateway.execute({
        effectId: second.id,
        idempotencyKey: "wrong",
        approvalToken: approval.token,
      }),
    ).rejects.toThrow("Approval does not match this effect")

    const ok = await gateway.execute({
      effectId: first.id,
      idempotencyKey: "ok",
      approvalToken: approval.token,
    })
    expect(ok.status).toBe("succeeded")

    await expect(
      gateway.execute({
        effectId: first.id,
        idempotencyKey: "different-key",
        approvalToken: approval.token,
      }),
    ).rejects.toThrow("Approval is invalid or already used")
  })
})

class FakeLive implements LiveEffectExecutor {
  async execute() {
    return { externalId: "live_test", summary: "Executed live effect" }
  }
}
