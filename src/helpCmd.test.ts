import { expect, test } from "bun:test"
import { helpCmd } from "./helpCmd"

test("renders help", () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: false,
    configurable: true,
  })
  expect(helpCmd()).toContain("--help")
})

test("renders plain markdown when stdout is redirected", () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  Object.defineProperty(process.stdout, "isTTY", {
    value: false,
    configurable: true,
  })

  expect(helpCmd()).not.toContain("\u001b[")
})

test("includes URL output examples", () => {
  Object.defineProperty(process.stdout, "isTTY", {
    value: false,
    configurable: true,
  })
  expect(helpCmd()).toContain("https://httpbun.com/ip")
})
