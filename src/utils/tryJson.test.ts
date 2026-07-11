import { expect, test } from "bun:test"
import { tryJson } from "./tryJson"

test("parses JSON text", () => {
  expect(tryJson('{"ok":true}')).toEqual({ ok: true })
})

test("returns the original text when it is not JSON", () => {
  expect(tryJson("accepted")).toBe("accepted")
})
