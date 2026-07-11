import { expect, test } from "bun:test"
import { cliArgs } from "./cliArgs"

test("parses options and positionals", () => {
  expect(cliArgs(["-t", "yaml", "input.json", "-o", "out.yaml"])).toEqual({
    type: "yaml",
    output: "out.yaml",
    positionals: ["input.json"],
  })
})
