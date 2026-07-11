import { expect, test } from "bun:test"
import * as index from "./index"

test("exports the CLI", () => expect(index.cli).toBeDefined())
