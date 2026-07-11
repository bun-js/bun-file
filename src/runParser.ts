import { deserialize } from "bun:jsc"
import type { InputFile } from "./utils/getInputFile"

export async function runParser(
  file: InputFile,
  ext: string,
): Promise<unknown> {
  switch (ext) {
    case "yml":
    case "yaml":
      return Bun.YAML.parse(await file.text())
    case "toml":
      return Bun.TOML.parse(await file.text())
    case "jsonc":
      return Bun.JSONC.parse(await file.text())
    case "json5":
    case "json":
      return Bun.JSON5.parse(await file.text())
    case "jsonl":
      return Bun.JSONL.parse(await file.text())
    case "jsc":
      return deserialize(await file.arrayBuffer())
  }
}
