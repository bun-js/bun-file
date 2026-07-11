import { expect, test } from "bun:test"
import { isHttpUrl } from "./isHttpUrl"

test("recognizes HTTP and HTTPS URLs", () => {
  expect(isHttpUrl("http://example.test/path")).toBe(true)
  expect(isHttpUrl("https://example.test/path")).toBe(true)
})

test("rejects non-HTTP values", () => {
  expect(isHttpUrl("file:///tmp/output.json")).toBe(false)
  expect(isHttpUrl("output.json")).toBe(false)
  expect(isHttpUrl("not a URL")).toBe(false)
})
