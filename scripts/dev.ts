const children = [
  Bun.spawn(["bun", "--cwd", "packages/studio-server", "dev"], { stdout: "inherit", stderr: "inherit" }),
  Bun.spawn(["bun", "--cwd", "packages/web", "dev"], { stdout: "inherit", stderr: "inherit" }),
]

const stop = () => {
  for (const child of children) child.kill()
}

process.on("SIGINT", stop)
process.on("SIGTERM", stop)

const codes = await Promise.all(children.map((child) => child.exited))
stop()
process.exit(codes.find((code) => code !== 0) ?? 0)
