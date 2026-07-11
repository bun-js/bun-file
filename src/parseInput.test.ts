import { expect, test } from "bun:test"
import { cliArgs } from "./cliArgs"
import { parseInput } from "./parseInput"

test("reads files and stdin, including errors", async () => {
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  await Bun.write("/tmp/bun-file-test.json", '{"ok":true}')
  const [file, ext] = await parseInput(cliArgs(["/tmp/bun-file-test.json"]))
  expect(ext).toBe("json")
  expect(await file.text()).toBe('{"ok":true}')
  expect(
    (await parseInput(cliArgs(["-t", "json", "/tmp/bun-file-test.json"])))[1],
  ).toBe("json")
  Object.defineProperty(process.stdin, "isTTY", {
    value: false,
    configurable: true,
  })
  expect((await parseInput(cliArgs(["--type", "json"])))[1]).toBe("json")
  expect(() => parseInput(cliArgs([]))).toThrow("Missing --type")
  Object.defineProperty(process.stdin, "isTTY", {
    value: true,
    configurable: true,
  })
  expect(() => parseInput(cliArgs([]))).toThrow("Missing input file")
})
