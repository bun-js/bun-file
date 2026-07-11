import { expect, test } from "bun:test"
import { helpCmd } from "./helpCmd"

test("renders help", () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: false,
    configurable: true,
  })
  expect(helpCmd()).toContain("--help")
})
