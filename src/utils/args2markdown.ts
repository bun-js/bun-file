type Options = Record<
  string,
  { short?: string; param?: string; description?: string }
>

export function args2markdown(options: Options): string {
  return Object.entries(options)
    .map(
      ([cmd, opt]): string =>
        `${opt.short ? `\`-${opt.short}\`, ` : ""}\`--${cmd}\` ${opt.param ? `[${opt.param}]()` : ""}\t${opt.description}`,
    )
    .join("\\\n")
}
