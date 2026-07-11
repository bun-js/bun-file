import { expect, test } from "bun:test"
import { fail } from "./fail"

test("throws strings as errors and preserves errors", () => {
  expect(() => fail("bad")).toThrow("bad")
  expect(() => fail(new Error("worse"))).toThrow("worse")
})
