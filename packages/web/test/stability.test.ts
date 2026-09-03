import { expect, test } from "bun:test"
import path from "node:path"

const source = path.resolve(import.meta.dir, "../src/components")

test("workspace components avoid broad transition declarations", async () => {
  const glob = new Bun.Glob("**/*.tsx")
  for await (const file of glob.scan(source)) {
    const content = await Bun.file(path.join(source, file)).text()
    expect(content).not.toContain(["transition", "all"].join("-"))
    expect(content).not.toContain("transition: all")
  }
})
