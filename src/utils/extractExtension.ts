import { fail } from "./fail"

export function extractExtension(file: string): string {
  return (
    file.split(".").pop()?.toString() ??
    fail(`can't extract extension from file '${file}'`)
  )
}
