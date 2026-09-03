import path from "node:path"

export class PreviewRegistry {
  #origins = new Map<string, string>()
  #hosts: Set<string>
  #ports: Set<string>

  constructor(input?: { hosts?: string[]; ports?: string[] }) {
    this.#hosts = new Set(input?.hosts ?? values(process.env.STUDIO_ALLOWED_PREVIEW_HOSTS || "localhost,127.0.0.1"))
    this.#ports = new Set(input?.ports ?? values(process.env.STUDIO_ALLOWED_PREVIEW_PORTS || "5173"))
  }

  register(directory: string, url: string) {
    const target = this.#validate(url)
    this.#origins.set(path.resolve(directory), target.origin)
    return target.origin
  }

  allows(directory: string, url: string) {
    const registered = this.#origins.get(path.resolve(directory))
    if (!registered) return false
    try {
      return this.#validate(url).origin === registered
    } catch {
      return false
    }
  }

  remove(directory: string) {
    this.#origins.delete(path.resolve(directory))
  }

  #validate(url: string) {
    const target = new URL(url)
    if (!["http:", "https:"].includes(target.protocol)) throw new Error("Preview URL must use HTTP or HTTPS")
    if (target.username || target.password) throw new Error("Preview URL must not contain credentials")
    if (!this.#hosts.has(target.hostname)) throw new Error("Preview host is not allowlisted")
    if (!this.#ports.has(port(target))) throw new Error("Preview port is not allowlisted")
    return target
  }
}

function port(url: URL) {
  if (url.port) return url.port
  return url.protocol === "https:" ? "443" : "80"
}

function values(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}
