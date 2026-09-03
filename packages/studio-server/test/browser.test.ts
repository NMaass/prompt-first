import { expect, test } from "bun:test"
import { BrowserVerifier } from "../src/browser"

test("browser verification rejects non-allowlisted origins before launching a browser", async () => {
  const verifier = new BrowserVerifier()
  await expect(verifier.check("https://example.com", "smoke")).rejects.toThrow("allowlisted")
})
