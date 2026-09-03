import type { ToolPart } from "@opencode-ai/sdk"
import { describe, expect, test } from "bun:test"
import type { TimelineMessage } from "../src/hooks/useSession"
import { missions } from "../src/studio/missions"
import { deriveStudioState } from "../src/studio/state"

describe("deriveStudioState", () => {
  test("starts with explicit unverified evidence", () => {
    const state = deriveStudioState([], missions[0]!)
    expect(state.evidence.length).toBe(missions[0]!.acceptance.length + missions[0]!.quality.length)
    expect(state.evidence.every((item) => item.status === "unverified")).toBe(true)
  })

  test("uses completed artifact tool input", () => {
    const part: ToolPart = {
      id: "part",
      sessionID: "session",
      messageID: "message",
      type: "tool",
      callID: "call",
      tool: "studio-preview",
      state: {
        status: "completed",
        input: { url: "http://localhost:5173" },
        output: "ok",
        title: "preview",
        metadata: {},
        time: { start: 1, end: 2 },
      },
    }
    const messages: TimelineMessage[] = [{ id: "message", role: "assistant", createdAt: 1, parts: [part] }]
    expect(deriveStudioState(messages, missions[0]!).previewUrl).toBe("http://localhost:5173")
  })
})
