import type { BunFile } from "bun"
import { fail } from "./fail"

export type InputFile = Pick<BunFile, "text" | "arrayBuffer">

export async function getInputFile(source: string | URL): Promise<InputFile> {
  if (typeof source === "string" || source.protocol === "file:") {
    return Bun.file(source)
  }

  if (source.protocol !== "http:" && source.protocol !== "https:") {
    fail(`Unsupported input URL protocol '${source.protocol}'`)
  }

  const response = await fetch(source)
  if (!response.ok) fail(`Failed to fetch input URL (${response.status})`)
  return new File([await response.arrayBuffer()], source.pathname)
}
