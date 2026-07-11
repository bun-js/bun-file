import { expect, test } from "bun:test"
import { cliOptions } from "./cliOptions"

test("describes the help option", () =>
  expect(cliOptions.help.description).toContain("help"))
