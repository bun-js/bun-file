import { expect, test } from "bun:test"
import { cliArgs } from "./cliArgs"
import { parseInput } from "./parseInput"

test("reads files and stdin, including errors", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  await Bun.write("/tmp/bun-file-test.json", '{"ok":true}')
  const [file, ext] = await parseInput(cliArgs(["/tmp/bun-file-test.json"]))
  expect(ext).toBe("json")
  expect(await file.text()).toBe('{"ok":true}')
  expect(
    (await parseInput(cliArgs(["-t", "json", "/tmp/bun-file-test.json"])))[1],
  ).toBe("json")
  Object.defineProperty(process.stdin, "isTTY", {
    value: false,
    configurable: true,
  })
  expect((await parseInput(cliArgs(["--type", "json"])))[1]).toBe("json")
  expect(() => parseInput(cliArgs([]))).toThrow("Missing --type")
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  expect(() => parseInput(cliArgs([]))).toThrow("Missing input file")
})

test("reads URLs", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })

  await Bun.write("/tmp/bun-file-url-test.json", '{"ok":true}')
  const [file, ext] = await parseInput(
    cliArgs(["file:///tmp/bun-file-url-test.json"]),
  )

  expect(ext).toBe("json")
  expect(await file.text()).toBe('{"ok":true}')
})

test("infers a URL extension from its pathname", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })

  await Bun.write("/tmp/bun-file-url-test.json", "{}")
  const [, ext] = await parseInput(
    cliArgs(["file:///tmp/bun-file-url-test.json?raw=1"]),
  )

  expect(ext).toBe("json")
})

test("reads HTTP URLs", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () =>
    new Response('{"ok":true}')) as unknown as typeof fetch

  try {
    const [file, ext] = await parseInput(
      cliArgs(["https://example.com/config.json"]),
    )
    expect(ext).toBe("json")
    expect(await file.text()).toBe('{"ok":true}')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("defaults URL inputs without an extension to JSON", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () =>
    new Response('{"ok":true}')) as unknown as typeof fetch

  try {
    const [, ext] = await parseInput(cliArgs(["https://example.com/api/info"]))
    expect(ext).toBe("json")
  } finally {
    globalThis.fetch = originalFetch
  }
})
