import { expect, test } from "bun:test"
import { convertTo } from "./convertTo"
import { runParser } from "./runParser"

test("parses every supported extension", async () => {
  const cases = [
    ["yaml", "answer: 42\n", { answer: 42 }],
    ["yml", "answer: 42\n", { answer: 42 }],
    ["toml", "answer = 42\n", { answer: 42 }],
    ["jsonc", '{"answer":42}', { answer: 42 }],
    ["json", '{"answer":42}', { answer: 42 }],
    ["jsonl", '{"answer":42}\n', [{ answer: 42 }]],
  ] as const
  for (const [ext, content, expected] of cases) {
    const file = Bun.file(`/tmp/bun-file-${ext}`)
    await Bun.write(file, content)
    expect(await runParser(file, ext)).toEqual(expected)
  }
  const file = Bun.file("/tmp/bun-file-jsc")
  await Bun.write(file, convertTo({ answer: 42 }, "jsc"))
  expect(await runParser(file, "jsc")).toEqual({ answer: 42 })
  expect(await runParser(file, "unknown")).toBeUndefined()
})
