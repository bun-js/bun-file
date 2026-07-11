import { expect, mock, test } from "bun:test"
import { cli } from "./cli"

test("handles help and version exits", async () => {
  const exit = process.exit
  process.exit = mock(() => {
    throw new Error("exit")
  }) as never
  const log = mock(() => {})
  const errorLog = mock(() => {})
  const original = console.log
  const originalError = console.error
  console.log = log as typeof console.log
  console.error = errorLog as typeof console.error
  try {
    Object.defineProperty(process.stdin, "isTTY", {
      value: false,
      configurable: true,
    })
    await cli(["--help"])
    await cli(["--version"])
    expect(log).toHaveBeenCalledTimes(2)
    expect(errorLog).toHaveBeenCalledTimes(2)
  } finally {
    process.exit = exit
    console.log = original
    console.error = originalError
  }
})

test("prints only the error message when a command fails", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  await Bun.write("/tmp/bun-file-cli-error.json", '{"ok":true}')
  const error = mock(() => {})
  const original = console.error
  console.error = error as typeof console.error
  try {
    await cli(["/tmp/bun-file-cli-error.json", "--format", "toml"])
    expect(error).toHaveBeenCalledWith("TOML output is not supported by Bun")
  } finally {
    console.error = original
  }
})

test("runs the complete file-to-file CLI path", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  await Bun.write("/tmp/bun-file-cli.json", '{"ok":true}')
  await cli(["/tmp/bun-file-cli.json", "--output", "/tmp/bun-file-cli.yaml"])
  expect(await Bun.file("/tmp/bun-file-cli.yaml").text()).toContain("ok: true")
})
