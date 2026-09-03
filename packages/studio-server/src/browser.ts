import { chromium, type Page } from "playwright"
import type { BrowserCheckKind, BrowserCheckReceipt } from "./types"

export class BrowserVerifier {
  #hosts = new Set(
    (process.env.STUDIO_ALLOWED_PREVIEW_HOSTS || "localhost,127.0.0.1")
      .split(",")
      .map((host) => host.trim())
      .filter(Boolean),
  )

  async check(url: string, kind: BrowserCheckKind): Promise<BrowserCheckReceipt> {
    const target = new URL(url)
    if (!this.#hosts.has(target.hostname)) throw new Error("Preview host is not allowlisted")
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error("Preview URL must use HTTP or HTTPS")

    const browser = await chromium.launch({ headless: true })
    try {
      const page = await browser.newPage()
      const detail = await run(page, url, kind)
      const failed = Array.isArray(detail.failures) && detail.failures.length > 0
      return {
        id: crypto.randomUUID(),
        kind,
        status: failed ? "failed" : "passed",
        summary: failed ? `${kind} check found ${detail.failures.length} issue(s)` : `${kind} check passed`,
        detail,
        createdAt: new Date().toISOString(),
      }
    } finally {
      await browser.close()
    }
  }
}

async function run(page: Page, url: string, kind: BrowserCheckKind): Promise<Record<string, unknown> & { failures: string[] }> {
  if (kind === "responsive") return responsive(page, url)
  if (kind === "keyboard") return keyboard(page, url)
  if (kind === "accessibility") return accessibility(page, url)
  if (kind === "performance") return performanceCheck(page, url)
  return smoke(page, url)
}

async function smoke(page: Page, url: string) {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 })
  const title = await page.title()
  const failures = [...errors]
  if (!response?.ok()) failures.push(`Navigation returned ${response?.status() ?? "no response"}`)
  return { title, status: response?.status(), consoleErrors: errors, failures }
}

async function responsive(page: Page, url: string) {
  const viewports = [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
  ]
  const results: Array<Record<string, unknown>> = []
  const failures: string[] = []
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    results.push({ ...viewport, horizontalOverflow: overflow })
    if (overflow) failures.push(`${viewport.name} has horizontal overflow`)
  }
  return { viewports: results, failures }
}

async function keyboard(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 })
  const interactive = await page.locator("a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])").count()
  const reached = new Set<string>()
  for (let index = 0; index < Math.min(interactive + 2, 30); index++) {
    await page.keyboard.press("Tab")
    const marker = await page.evaluate(() => {
      const node = document.activeElement as HTMLElement | null
      if (!node) return ""
      return `${node.tagName}:${node.id}:${node.getAttribute("name") ?? ""}:${node.textContent?.trim().slice(0, 40) ?? ""}`
    })
    if (marker) reached.add(marker)
  }
  const failures: string[] = []
  if (interactive > 0 && reached.size === 0) failures.push("No interactive element received keyboard focus")
  return { interactive, distinctFocused: reached.size, failures }
}

async function accessibility(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 })
  return page.evaluate(() => {
    const failures: string[] = []
    if (!document.documentElement.lang) failures.push("Document language is missing")
    if (!document.title.trim()) failures.push("Document title is missing")

    const unnamedButtons = [...document.querySelectorAll("button")].filter((button) => {
      const text = button.textContent?.trim()
      return !text && !button.getAttribute("aria-label") && !button.getAttribute("aria-labelledby")
    }).length
    if (unnamedButtons) failures.push(`${unnamedButtons} button(s) have no accessible name`)

    const unlabeledInputs = [...document.querySelectorAll("input, select, textarea")].filter((input) => {
      const id = input.getAttribute("id")
      const labelled = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null
      return !labelled && !input.getAttribute("aria-label") && !input.getAttribute("aria-labelledby")
    }).length
    if (unlabeledInputs) failures.push(`${unlabeledInputs} form control(s) have no label`)

    return { unnamedButtons, unlabeledInputs, failures }
  })
}

async function performanceCheck(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 20_000 })
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
    const loadMs = nav?.loadEventEnd ?? 0
    const transferBytes = nav?.transferSize ?? 0
    const failures: string[] = []
    if (loadMs > 3000) failures.push(`Initial load took ${Math.round(loadMs)}ms`)
    return { loadMs: Math.round(loadMs), transferBytes, failures }
  })
}
