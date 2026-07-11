import type { CliArgs } from "./cliArgs"
import { convertTo } from "./utils/convertTo"
import { extractExtension } from "./utils/extractExtension"
import { isHttpUrl } from "./utils/isHttpUrl"
import { tryJson } from "./utils/tryJson"

export async function writeOutput(data: unknown, args: CliArgs): Promise<void> {
  const outFile = args.output ?? args.positionals.at(1)
  if (outFile && isHttpUrl(outFile)) {
    const response = await fetch(outFile, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok)
      throw `Failed to POST output to ${outFile}: ${response.status} ${response.statusText}`

    if (args.verbose) console.error(response, tryJson(await response.text()))
    return
  }

  const format = args.format ?? (outFile && extractExtension(outFile))
  if (outFile === "-") {
    if (format === "jsc" && !process.stdout.isTTY) {
      process.stdout.write(
        new Uint8Array(convertTo(data, format) as SharedArrayBuffer),
      )
      return
    }

    const output = format
      ? convertTo(data, format)
      : JSON.stringify(data, null, 2)
    console.log(
      output instanceof SharedArrayBuffer
        ? btoa(String.fromCharCode(...new Uint8Array(output)))
        : output,
    )
    return
  }

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
