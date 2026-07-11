import { bin, description, version } from "../package.json"
import { cliOptions } from "./cliOptions"
import { args2markdown } from "./utils/args2markdown"

const cmd = String(Object.keys(bin).at(0))

export function helpCmd(): string {
  const markdown = `# ${cmd} (${version})
> ${description}

## Usage:
> [${cmd}]() [flags...] <input> [output]

- [${cmd}]() wrangler.toml wrangler.jsonc
- [${cmd}]() \`-v\` https://httpbun.com/ip https://httpbun.com/post

#### Supported Formats:

| Format | Read | Write |
| ------ | :--: | :---: |
| TOML   | ✓ |   |
| YAML   | ✓ | ✓ |
| JSON   | ✓ | ✓ |
| JSONC  | ✓ |   |
| JSON5  | ✓ |   |
| JSONL  | ✓ | ✓ |
| JSC    | ✓ | ✓ |

### Flags:
${args2markdown(cliOptions)}`
  return process.stdout.isTTY
    ? Bun.markdown.ansi(markdown, { hyperlinks: true })
    : markdown
}
