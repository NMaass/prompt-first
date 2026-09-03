import { expect, test } from "@playwright/test"
import { expectStableGeometry } from "./helpers/expect-stable-geometry"

test("freeform drafting preserves launcher geometry and focus", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`)
  })

  await page.goto("/")
  const heading = page.getByRole("heading", { level: 1 })
  const guided = page.getByRole("heading", { name: "Guided missions" })
  const custom = page.getByRole("heading", { name: "Build your own" })
  const draft = page.getByLabel(/Describe the product you want/)
  const start = page.getByRole("button", { name: "Start building" })

  if ((await start.count()) === 0) {
    const body = await page.locator("body").innerText().catch(() => "<body unavailable>")
    throw new Error(`Launcher did not render.\n${errors.join("\n")}\nBody:\n${body}`)
  }

  await expect(start).toBeDisabled()
  await draft.focus()
  await expectStableGeometry({
    page,
    anchors: [heading, guided, custom, start],
    expectedFocus: draft,
    action: () => draft.fill("A shared dinner planner for friends with dietary constraints"),
  })
  await expect(start).toBeEnabled()
})
