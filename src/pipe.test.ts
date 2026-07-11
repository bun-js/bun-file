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

test("requires a type for explicit stdin", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  await expect(parseInput(cliArgs(["-"]))).rejects.toThrow("Missing --type")
})

test("reads explicit stdin when the terminal is not interactive", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: false,
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

test("POSTs JSON for a positional URL output", async () => {
  const fetchMock = mock(async () => new Response(null, { status: 201 }))
  const originalFetch = globalThis.fetch
  globalThis.fetch = fetchMock as unknown as typeof fetch
  try {
    await writeOutput(
      { ok: true },
      cliArgs(["input.json", "https://example.test/results"]),
    )
    expect(fetchMock).toHaveBeenCalledWith("https://example.test/results", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{"ok":true}',
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("logs non-JSON verbose URL responses as text", async () => {
  const response = new Response("accepted", { status: 200 })
  const fetchMock = mock(async () => response)
  const error = mock(() => {})
  const originalFetch = globalThis.fetch
  const originalError = console.error
  globalThis.fetch = fetchMock as unknown as typeof fetch
  console.error = error as typeof console.error
  try {
    await writeOutput(
      { ok: true },
      cliArgs(["input.json", "--verbose", "https://example.test/results"]),
    )
    expect(error).toHaveBeenCalledWith(response, "accepted")
  } finally {
    globalThis.fetch = originalFetch
    console.error = originalError
  }
})

test("prints JSC output as base64 on an interactive terminal", async () => {
  Object.defineProperty(process.stdout, "isTTY", {
    value: true,
    configurable: true,
  })
  const log = mock(() => {})
  const original = console.log
  console.log = log as typeof console.log
  try {
    await writeOutput(
      { ok: true },
      cliArgs(["input.json", "--format", "jsc", "-"]),
    )
    expect(log).toHaveBeenCalledWith("DQAAAAICAACAb2sJ/////w==")
  } finally {
    console.log = original
  }
})

test("writes binary JSC output when stdout is piped", async () => {
  Object.defineProperty(process.stdout, "isTTY", {
    value: false,
    configurable: true,
  })
  const write = mock(() => true)
  const original = process.stdout.write
  process.stdout.write = write as typeof process.stdout.write
  try {
    await writeOutput(
      { ok: true },
      cliArgs(["input.json", "--format", "jsc", "-"]),
    )
    expect(write).toHaveBeenCalledWith(
      new Uint8Array([
        13, 0, 0, 0, 2, 2, 0, 0, 128, 111, 107, 9, 255, 255, 255, 255,
      ]),
    )
  } finally {
    process.stdout.write = original
  }
})
