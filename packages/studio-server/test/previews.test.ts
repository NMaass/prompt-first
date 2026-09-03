import { describe, expect, test } from "bun:test"
import { PreviewRegistry } from "../src/previews"

describe("preview registry", () => {
  test("binds browser access to the registered workspace origin", () => {
    const previews = new PreviewRegistry({ hosts: ["127.0.0.1"], ports: ["5173"] })
    const directory = "/tmp/workspace-a"

    expect(previews.register(directory, "http://127.0.0.1:5173/app")).toBe("http://127.0.0.1:5173")
    expect(previews.allows(directory, "http://127.0.0.1:5173/other")).toBe(true)
    expect(previews.allows("/tmp/workspace-b", "http://127.0.0.1:5173/other")).toBe(false)
    expect(previews.allows(directory, "http://127.0.0.1:4100/studio/health")).toBe(false)
  })

  test("rejects non-allowlisted hosts and ports at registration", () => {
    const previews = new PreviewRegistry({ hosts: ["localhost"], ports: ["5173"] })
    expect(() => previews.register("/tmp/workspace", "http://localhost:4100")).toThrow("port")
    expect(() => previews.register("/tmp/workspace", "https://example.com:5173")).toThrow("host")
  })
})
