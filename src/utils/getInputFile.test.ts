import { expect, mock, test } from "bun:test"
import { getInputFile } from "./getInputFile"

test("returns a Bun file for a local source", async () => {
  await Bun.write("/tmp/bun-file-get-input.json", '{"ok":true}')

  const file = await getInputFile("/tmp/bun-file-get-input.json")

  expect(await file.text()).toBe('{"ok":true}')
})

test("rejects unsupported URL protocols", async () => {
  await expect(
    getInputFile(new URL("ftp://example.com/input.json")),
  ).rejects.toThrow("Unsupported input URL protocol 'ftp:'")
})

test("rejects unsuccessful HTTP responses", async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mock(
    async () => new Response(null, { status: 404 }),
  ) as unknown as typeof fetch

  try {
    await expect(
      getInputFile(new URL("https://example.com/input.json")),
    ).rejects.toThrow("Failed to fetch input URL (404)")
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("returns a file for successful HTTP responses", async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mock(
    async () => new Response("ok"),
  ) as unknown as typeof fetch

  try {
    const file = await getInputFile(new URL("https://example.com/input.txt"))
    expect(await file.text()).toBe("ok")
  } finally {
    globalThis.fetch = originalFetch
  }
})
