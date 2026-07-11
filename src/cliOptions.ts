import type { ParseArgsOptionDescriptor } from "node:util"

type Option = ParseArgsOptionDescriptor & {
  description: string
}

export const cliOptions = {
  help: {
    short: "h",
    type: "boolean",
    description: "Show this help message and exit",
  },
  type: {
    short: "t",
    type: "string",
    description: "Input file type: yaml, toml, json, json5, jsonc, jsonl, jsc",
  },
  format: {
    short: "f",
    type: "string",
    description: "Output file format: yaml, json, jsonl, jsc",
  },
  output: {
    short: "o",
    type: "string",
    description: "Save output to a file or POST it to an HTTP(S) URL",
  },
  verbose: {
    short: "v",
    type: "boolean",
    description: "Increase verbosity output",
  },
  version: {
    short: "V",
    type: "boolean",
    description: "Show version and exit",
  },
} satisfies Record<string, Option>
