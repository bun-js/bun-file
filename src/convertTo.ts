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
  }
  return JSON.stringify(data, null, 2)
}
