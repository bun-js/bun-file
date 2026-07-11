import { cliArgs } from "./cliArgs"
import { helpCmd } from "./helpCmd"
import { parseInput } from "./parseInput"
import { runParser } from "./runParser"
import { versionCmd } from "./versionCmd"
import { writeOutput } from "./writeOutput"

export async function cli(argv = Bun.argv.slice(2)) {
  try {
    const args = cliArgs(argv)

    if (args.help || argv.length === 0) {
      console.log(helpCmd())
      return 0
    }
    if (args.version) {
      console.log(versionCmd())
      return 0
    }

    const [input, ext] = await parseInput(args)

    const data = await runParser(input, ext)

    await writeOutput(data, args)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    return 1
  }

  return 0
}
