import { expect, test } from "bun:test"
import { args2markdown } from "./args2markdown"

test("renders option markdown", () =>
  expect(
    args2markdown({
      x: { short: "x", param: "FILE", description: "desc" },
      y: {},
    }),
  ).toBe("`-x`, `--x` [FILE]()\tdesc\\\n`--y` \tundefined"))
