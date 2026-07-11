import { parseArgs } from "node:util"
import { cliOptions } from "./cliOptions"

export function cliArgs(args: string[] = Bun.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args,
    options: cliOptions,
    allowPositionals: true,
  })
  return { ...values, positionals }
}

export type CliArgs = ReturnType<typeof cliArgs>
