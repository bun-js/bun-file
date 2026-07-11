import { expect, mock, test } from "bun:test"
import { cliArgs } from "./cliArgs"
import { writeOutput } from "./writeOutput"

test("writes files, prints formatted output, and prints raw data", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  const log = mock(() => {})
  const original = console.log
  console.log = log as typeof console.log
  try {
    await writeOutput(
      { ok: true },
      cliArgs(["input.json", "-o", "/tmp/bun-file-out.json"]),
    )
    expect(await Bun.file("/tmp/bun-file-out.json").json()).toEqual({
      ok: true,
    })
    await writeOutput(
      { ok: true },
      cliArgs(["input.json", "/tmp/bun-file-out.yaml"]),
    )
    await writeOutput({ ok: true }, cliArgs(["input.json"]))
    expect(log).toHaveBeenCalledTimes(2)
  } finally {
    console.log = original
  }
})
