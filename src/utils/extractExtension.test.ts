import { expect, test } from "bun:test"
import { extractExtension } from "./extractExtension"

test("extracts file extensions", () => {
  expect(extractExtension("file.jsonc")).toBe("jsonc")
  expect(extractExtension(".env")).toBe("json")
  expect(extractExtension("/api/info")).toBe("json")
})
