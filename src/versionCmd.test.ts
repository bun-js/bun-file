import { expect, test } from "bun:test"
import { name, version } from "../package.json"
import { versionCmd } from "./versionCmd"

test("renders the package version", () =>
  expect(versionCmd()).toBe(`${name} version: ${version}`))
