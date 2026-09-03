import { expect, type Locator, type Page } from "@playwright/test"

type StableGeometryOptions = {
  page: Page
  anchors: Locator[]
  action: () => Promise<void>
  settle?: () => Promise<void>
  expectedFocus?: Locator
  tolerance?: number
}

export async function expectStableGeometry({
  page,
  anchors,
  action,
  settle,
  expectedFocus,
  tolerance = 0.5,
}: StableGeometryOptions) {
  const beforeBoxes = await Promise.all(anchors.map((anchor) => anchor.boundingBox()))
  const beforeScroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }))

  await action()
  await settle?.()

  const afterBoxes = await Promise.all(anchors.map((anchor) => anchor.boundingBox()))
  const afterScroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }))

  for (let index = 0; index < beforeBoxes.length; index += 1) {
    const before = beforeBoxes[index]
    const after = afterBoxes[index]
    expect(before, `anchor ${index} existed before action`).not.toBeNull()
    expect(after, `anchor ${index} existed after action`).not.toBeNull()
    if (!before || !after) continue
    for (const key of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(before[key] - after[key]), `anchor ${index} ${key}`).toBeLessThanOrEqual(tolerance)
    }
  }

  expect(afterScroll).toEqual(beforeScroll)
  if (expectedFocus) await expect(expectedFocus).toBeFocused()
}
