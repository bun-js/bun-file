#!/usr/bin/env bun

import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

const root = dirname(import.meta.dir)
const tempDir = await mkdtemp(join(tmpdir(), "bun-file-package-smoke-"))

async function run(command: string[], cwd: string) {
  const proc = Bun.spawn(command, { cwd, stdout: "pipe", stderr: "pipe" })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])

  if (exitCode !== 0) throw new Error(`${command.join(" ")} failed:\n${stderr}`)
  return stdout
}

try {
  const tarball = (
    await run(["bun", "pm", "pack", "--destination", tempDir, "--quiet"], root)
  ).trim()
  await run(["bun", "add", tarball], tempDir)

  const version = (
    await run(["bun", "x", "bun-file", "--version"], tempDir)
  ).trim()
  if (!version)
    throw new Error("Packed bun-file executable returned no version")

  console.log(`Package smoke test passed for @bunx/file@${version}`)
} finally {
  await rm(tempDir, { recursive: true, force: true })
}
