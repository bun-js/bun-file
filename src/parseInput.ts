import type { CliArgs } from "./cliArgs"
import { extractExtension } from "./utils/extractExtension"
import { fail } from "./utils/fail"
import { getInputFile, type InputFile } from "./utils/getInputFile"

export async function parseInput(args: CliArgs): Promise<[InputFile, string]> {
  const file = args.positionals.at(0)
  if (file === "-" || !process.stdin.isTTY) {
    const ext = args.type ?? fail("Missing --type")
    const input = await Bun.stdin
    return [input, ext]
  }

  const inputFile = file ?? fail("Missing input file")
  const url = URL.canParse(inputFile) ? new URL(inputFile) : undefined
  const source = url?.pathname ?? inputFile
  const ext = args.type ?? extractExtension(source)
  const input = await getInputFile(url ?? inputFile)
  return [input, ext]
}
