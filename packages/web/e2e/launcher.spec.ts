import { expect, test } from "@playwright/test"
import { expectStableGeometry } from "./helpers/expect-stable-geometry"

test("freeform drafting preserves launcher geometry and focus", async ({ page }) => {
  await page.goto("/")
  const heading = page.getByRole("heading", { level: 1 })
  const guided = page.getByRole("heading", { name: "Guided missions" })
  const custom = page.getByRole("heading", { name: "Build your own" })
  const draft = page.getByLabel(/Describe the product you want/)
  const start = page.getByRole("button", { name: "Start building" })

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
