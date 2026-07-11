import { expect, test } from "bun:test"
import { cliOptions } from "./cliOptions"

test("describes the help option", () =>
  expect(cliOptions.help.description).toContain("help"))

test("uses separate flags for verbosity and version", () => {
  expect(cliOptions.verbose.short).toBe("v")
  expect(cliOptions.version.short).toBe("V")
  expect(cliOptions.verbose.description).toContain("verbosity")
})
