import { cliOptions } from "./cliOptions"
import { args2markdown } from "./utils/args2markdown"

export function helpCmd(): string {
  const markdown = args2markdown(cliOptions)
  return process.stdin.isTTY ? Bun.markdown.ansi(markdown) : markdown
}
