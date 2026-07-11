import type { CliArgs } from "./cliArgs"
import { convertTo } from "./convertTo"
import { extractExtension } from "./utils/extractExtension"

export async function writeOutput(data: unknown, args: CliArgs): Promise<void> {
  const outFile = args.output ?? args.positionals.at(1)
  const format = args.format ?? (outFile && extractExtension(outFile))
  if (format) {
    const output = convertTo(data, format)
    if (args.output) {
      await Bun.file(args.output).write(output)
    } else {
      console.log(output)
    }
  } else {
    console.log(process.stdout.isTTY ? data : JSON.stringify(data, null, 2))
  }
}
