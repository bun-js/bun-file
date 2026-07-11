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

test("prints JSON for raw output when stdout is redirected", async () => {
  Object.defineProperty(process.stdout, "isTTY", {
    value: false,
    configurable: true,
  })
  const log = mock(() => {})
  const original = console.log
  console.log = log as typeof console.log
  try {
    await writeOutput({ ok: true }, cliArgs(["input.json"]))
    expect(log).toHaveBeenCalledWith('{\n  "ok": true\n}')
  } finally {
    console.log = original
  }
})

test("POSTs JSON when the output is an HTTP URL", async () => {
  const fetchMock = mock(async () => new Response(null, { status: 201 }))
  const originalFetch = globalThis.fetch
  globalThis.fetch = fetchMock as unknown as typeof fetch
  try {
    await writeOutput(
      { ok: true },
      cliArgs(["input.json", "--output", "https://example.test/results"]),
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

test("throws when the URL rejects the output", async () => {
  const fetchMock = mock(async () => new Response(null, { status: 400 }))
  const originalFetch = globalThis.fetch
  globalThis.fetch = fetchMock as unknown as typeof fetch
  try {
    await expect(
      writeOutput(
        { ok: true },
        cliArgs(["input.json", "https://example.test/results"]),
      ),
    ).rejects.toBe("Failed to POST output to https://example.test/results: 400 ")
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("logs the URL response when verbose output is enabled", async () => {
  const response = new Response('{"accepted":true}', { status: 200 })
  const fetchMock = mock(async () => response)
  const error = mock(() => {})
  const originalFetch = globalThis.fetch
  const originalError = console.error
  globalThis.fetch = fetchMock as unknown as typeof fetch
  console.error = error as typeof console.error
  try {
    await writeOutput(
      { ok: true },
      cliArgs([
        "input.json",
        "--verbose",
        "https://example.test/results",
      ]),
    )
    expect(error).toHaveBeenCalledWith(response, { accepted: true })
  } finally {
    globalThis.fetch = originalFetch
    console.error = originalError
  }
})
