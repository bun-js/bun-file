import { expect, mock, test } from "bun:test"
import { cliArgs } from "./cliArgs"
import { parseInput } from "./parseInput"
import { writeOutput } from "./writeOutput"

test("reads stdin when the input is explicitly '-'", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  const input = await parseInput(cliArgs(["-", "--type", "json"]))
  expect(input[1]).toBe("json")
  expect(input[0]).toBe(Bun.stdin)
})

test("writes formatted output to stdout when the output is explicitly '-'", async () => {
  const log = mock(() => {})
  const original = console.log
  console.log = log as typeof console.log
  try {
    await writeOutput(
      { ok: true },
      cliArgs(["input.json", "--format", "json", "-"]),
    )
    expect(log).toHaveBeenCalledWith('{\n  "ok": true\n}')
  } finally {
    console.log = original
  }
})

test("writes output to stdout when '--output -' is used", async () => {
  const log = mock(() => {})
  const original = console.log
  console.log = log as typeof console.log
  try {
    await writeOutput({ ok: true }, cliArgs(["input.json", "--output", "-"]))
    expect(log).toHaveBeenCalledWith('{\n  "ok": true\n}')
  } finally {
    console.log = original
  }
})
