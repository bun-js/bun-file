import { expect, mock, test } from "bun:test"
import { cli } from "./cli"

test("handles help and version exits", async () => {
  const exit = process.exit
  process.exit = mock(() => {
    throw new Error("exit")
  }) as never
  const log = mock(() => {})
  const original = console.log
  console.log = log as typeof console.log
  try {
    Object.defineProperty(process.stdin, "isTTY", {
      value: false,
      configurable: true,
    })
    await expect(cli(["--help"])).rejects.toThrow("exit")
    await expect(cli(["--version"])).rejects.toThrow("exit")
    expect(log).toHaveBeenCalledTimes(2)
  } finally {
    process.exit = exit
    console.log = original
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
