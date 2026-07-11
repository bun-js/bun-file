import type { CliArgs } from "./cliArgs"
import { convertTo } from "./convertTo"
import { extractExtension } from "./utils/extractExtension"

export async function writeOutput(data: unknown, args: CliArgs): Promise<void> {
  const outFile = args.output ?? args.positionals.at(1)
  if (outFile && isHttpUrl(outFile)) {
    const response = await fetch(outFile, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(
        `Failed to POST output to ${outFile}: ${response.status} ${response.statusText}`,
      )
    }
    return
  }

  const format = args.format ?? (outFile && extractExtension(outFile))
  if (format) {
    const output = convertTo(data, format)
    if (args.output) {
      await Bun.file(args.output).write(output)
    } else {
      console.log(output)
    }
  } else {
    console.log(process.stdout.isTTY ? data : JSON.stringify(data, null, 2))
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol
    return protocol === "http:" || protocol === "https:"
  } catch {
    return false
  }
}
