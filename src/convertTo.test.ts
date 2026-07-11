import { expect, test } from "bun:test"
import { convertTo } from "./convertTo"

test("converts supported formats and defaults to JSON", () => {
  const value = { answer: 42 }
  expect(convertTo(value, "yaml")).toContain("answer: 42")
  expect(convertTo(value, "json")).toBe('{\n  "answer": 42\n}')
  expect(convertTo(value, "jsc")).toBeInstanceOf(SharedArrayBuffer)
})
