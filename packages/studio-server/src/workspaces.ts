import { cp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import type { MissionSeed, WorkspaceProvider, WorkspaceRecord } from "./types"

const root = path.resolve(import.meta.dir, "../../..")

export class LocalWorkspaceProvider implements WorkspaceProvider {
  #records = new Map<string, WorkspaceRecord>()
  #base = process.env.STUDIO_WORKSPACE_ROOT || path.join(os.tmpdir(), "prompt-first-workspaces")

  async create(mission: MissionSeed) {
    await mkdir(this.#base, { recursive: true })
    const id = crypto.randomUUID()
    const directory = path.join(this.#base, id)
    await mkdir(directory, { recursive: true })
    await cp(path.join(root, "templates/web-react"), directory, { recursive: true })
    await cp(path.join(root, ".opencode"), path.join(directory, ".opencode"), { recursive: true })
    await writeFile(path.join(directory, "mission.json"), JSON.stringify(mission, null, 2))
    await writeFile(
      path.join(directory, "opencode.json"),
      JSON.stringify(
        {
          $schema: "https://opencode.ai/config.json",
          model: process.env.STUDIO_MODEL || "openrouter/z-ai/glm-5.3-flash",
          default_agent: "studio-builder",
          share: "disabled",
          permission: {
            external_directory: "deny",
            question: "deny",
            webfetch: "ask",
            websearch: "ask",
            "studio-*": "allow",
          },
        },
        null,
        2,
      ),
    )

    const git = Bun.spawn(["git", "init", "-q"], { cwd: directory, stdout: "ignore", stderr: "ignore" })
    await git.exited

    const record: WorkspaceRecord = {
      id,
      directory,
      runtime: "web-react",
      isolation: "development-only",
      createdAt: new Date().toISOString(),
      mission,
    }
    this.#records.set(id, record)
    return record
  }

  async destroy(id: string) {
    const record = this.#records.get(id)
    if (!record) return false
    this.#records.delete(id)
    await rm(record.directory, { recursive: true, force: true })
    return true
  }

  get(id: string) {
    return this.#records.get(id)
  }

  findByDirectory(directory: string) {
    const target = path.resolve(directory)
    return [...this.#records.values()].find((record) => path.resolve(record.directory) === target)
  }
}
