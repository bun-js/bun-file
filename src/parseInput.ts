import type { BunFile } from "bun"
import type { CliArgs } from "./cliArgs"
import { extractExtension } from "./utils/extractExtension"
import { fail } from "./utils/fail"

export async function parseInput(args: CliArgs): Promise<[BunFile, string]> {
  if (process.stdin.isTTY) {
    const file = args.positionals.at(0) ?? fail("Missing input file")
    const ext = args.type ?? extractExtension(file)
    const input = await Bun.file(file)
    return [input, ext]
  } else {
    const ext = args.type ?? fail("Missing --type")
    const input = await Bun.stdin
    return [input, ext]
  }
}
