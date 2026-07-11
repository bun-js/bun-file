import type { CliArgs } from "./cliArgs"
import { extractExtension } from "./utils/extractExtension"
import { fail } from "./utils/fail"
import { getInputFile, type InputFile } from "./utils/getInputFile"

export async function parseInput(args: CliArgs): Promise<[InputFile, string]> {
  if (process.stdin.isTTY) {
    const file = args.positionals.at(0) ?? fail("Missing input file")
    const url = URL.canParse(file) ? new URL(file) : undefined
    const source = url?.pathname ?? file
    const ext = args.type ?? extractExtension(source)
    const input = await getInputFile(url ?? file)
    return [input, ext]
  } else {
    const ext = args.type ?? fail("Missing --type")
    const input = await Bun.stdin
    return [input, ext]
  }
}
