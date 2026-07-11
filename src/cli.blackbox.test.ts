import { expect, test } from "bun:test"
import { dirname, join } from "node:path"

const root = dirname(import.meta.dir)
const executable = join(root, "bin", "bun-file")

async function runCli(args: string[], input?: string) {
  const proc = Bun.spawn(["bun", executable, ...args], {
    cwd: root,
    stdin: input === undefined ? undefined : "pipe",
    stdout: "pipe",
    stderr: "pipe",
  })

  if (input !== undefined) {
    proc.stdin.write(input)
    proc.stdin.end()
  }

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])

  return { stdout, stderr, exitCode }
}

test("converts piped YAML to JSON through the executable", async () => {
  const result = await runCli(
    ["--type", "yaml", "--format", "json"],
    "answer: 42\n",
  )

  expect(result.exitCode).toBe(0)
  expect(JSON.parse(result.stdout)).toEqual({ answer: 42 })
  expect(result.stderr).toBe("")
})

test("returns a non-zero exit code and message for invalid input", async () => {
  const result = await runCli(["--type", "json"], "not json")

  expect(result.exitCode).toBe(1)
  expect(result.stdout).toBe("")
  expect(result.stderr).toContain("Unexpected token")
})

test("exposes help through the executable", async () => {
  const result = await runCli(["--help"])

  expect(result.exitCode).toBe(0)
  expect(result.stdout).toContain("<input> [output]")
})
