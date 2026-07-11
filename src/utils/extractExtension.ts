export function extractExtension(file: string): string {
  const filename = file.split("/").at(-1) ?? file
  const extension = filename.split(".").pop()
  return extension && extension !== filename && !filename.startsWith(".")
    ? extension
    : "json"
}
