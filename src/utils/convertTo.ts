import { serialize } from "bun:jsc"

export function convertTo(
  data: unknown,
  type: string,
): string | SharedArrayBuffer {
  switch (type) {
    case "yaml":
      return Bun.YAML.stringify(data, null, 2)
    case "jsc":
      return serialize(data)
    case "toml":
      throw new Error("TOML output is not supported by Bun")
  }
  return JSON.stringify(data, null, 2)
}
