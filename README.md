# bun-file

[![npm version](https://img.shields.io/npm/v/%40bunx%2Ffile?style=flat-square)](https://www.npmjs.com/package/@bunx/file)
[![npm downloads](https://img.shields.io/npm/dm/%40bunx%2Ffile?style=flat-square)](https://www.npmjs.com/package/@bunx/file)
[![license](https://img.shields.io/npm/l/%40bunx%2Ffile?style=flat-square)](./LICENSE)
[![Bun](https://img.shields.io/badge/runtime-Bun%20%3E%3D1.3.14-f9f1e1?style=flat-square&logo=bun&logoColor=000)](https://bun.sh)

Read, convert, and write structured data from a small Bun-only CLI or a TypeScript import.

`bun-file` is useful as a shell pipeline tool: it reads the format implied by an input filename (or an explicit `--type`) and converts the value to JSON or another selected format.

`bun-file` is intentionally Bun-only. The package publishes its TypeScript source directly—there is no `dist` directory or build step.

## Requirements

- [Bun](https://bun.sh) 1.3.14 or newer

## Installation

```sh
bun add @bunx/file
```

## CLI

The executable is called `bun-file`.

For one-off commands, run it directly with `bunx` without installing the package:

```sh
# Read a file and print its parsed value
bunx @bunx/file config.toml

# Convert stdin to JSON
cat config.yaml | bunx @bunx/file --type yaml --format json

# Write the converted value to a file
bunx @bunx/file config.toml --format json --output config.json
```

```sh
# Read a file and print its parsed value
bun-file config.toml

# Convert stdin to JSON
cat config.yaml | bun-file --type yaml --format json

# Write the converted value to a file
bun-file config.toml --format json --output config.json

# Read a file from a URL
bun-file https://example.com/config.json

# Parse stdin explicitly
cat config.txt | bun-file --type json

# Convert between formats using a positional output
bun-file config.yaml config.json

# Convert and write with an option
bun-file config.json --format yaml --output config.yaml

# Send the parsed value as JSON to an HTTP endpoint
bun-file config.json --output https://example.com/import
```

The first positional argument is the input. The optional second positional argument is the output; `--output` takes precedence when both are provided. If an output format is selected, the converted value is printed or written in that format. With no output format, redirected stdout receives formatted JSON; an interactive terminal prints the parsed value directly.

Input formats are inferred from the filename extension. Use `--type` for stdin, extensionless files, or to override inference. URL extensions are inferred from the URL pathname, ignoring its query string; URLs without an extension default to JSON.

Local paths, `file:` URLs, and HTTP(S) URLs are supported as inputs. HTTP(S) input is fetched before parsing. HTTP(S) output is sent as a JSON `POST` request instead of being written to disk.

### Supported formats

| Format | Read | Write |
| --- | :---: | :---: |
| TOML | ✓ |  |
| YAML | ✓ | ✓ |
| JSON | ✓ | ✓ |
| JSONC | ✓ |  |
| JSON5 | ✓ |  |
| JSONL | ✓ | ✓ |
| JSC | ✓ | ✓ |

TOML can be read, but Bun does not provide a native TOML serializer, so TOML output is not supported.

JSON and JSON5 input use Bun's JSON5 parser, so JSON5 syntax is accepted for both `.json` and `.json5` files. JSC is Bun's binary serialized format; when writing JSC to redirected stdout, the binary bytes are preserved. HTTP output is always serialized as JSON, regardless of the requested output format.

Run `bun-file --help` for all options:

```text
bun-file [options] <input> [output]
```

| Option | Alias | Description |
| --- | :---: | --- |
| `--help` | `-h` | Show help and exit |
| `--type <format>` | `-t` | Set the input format |
| `--format <format>` | `-f` | Set the output format |
| `--output <path>` | `-o` | Write to a file or POST to an HTTP(S) URL |
| `--verbose` | `-v` | Show additional output, including HTTP response details |
| `--version` | `-V` | Show the installed version |

## Standalone binaries

Each GitHub Release includes standalone executables for Linux, macOS, and Windows. Download the asset matching your operating system and architecture from the [latest release](https://github.com/bun-js/bun-file/releases/latest).

Available assets:

- `bun-file-linux-x64`
- `bun-file-linux-arm64`
- `bun-file-darwin-x64`
- `bun-file-darwin-arm64`
- `bun-file-windows-x64.exe`

These executables include the Bun runtime and do not require Bun to be installed separately.

## API

The package exports the CLI entry point for use in Bun applications:

```ts
import { cli } from "@bunx/file"

await cli(["config.toml", "--format", "json"])
```

The CLI accepts the same argument array as the executable, making it convenient to embed in another Bun tool.

The default CLI executable is also available in the package's `bin` directory for Bun to run directly.

## Development

```sh
bun install
bun test
bun run check
```

## Publishing

This package does not require a compilation step. `bun publish` publishes the TypeScript source listed in `package.json`'s `files` field.

See the [publishing guide](./docs/publishing.md) for the complete npm, Trusted Publishing, and GitHub Actions setup.

With Mise installed, publish it with:

```sh
mise run publish
```

### GitHub Actions

The repository uses [Release Please](https://github.com/googleapis/release-please) to keep package versions, changelogs, and GitHub Releases synchronized:

1. Merge changes using [Conventional Commits](https://www.conventionalcommits.org/), such as `fix: handle empty input` or `feat: add jsonl output`.
2. Release Please opens or updates a release PR on `main`.
3. Merge the release PR to create the GitHub Release.
4. The [publish workflow](./.github/workflows/publish.yml) validates the release tag against `package.json`, runs the checks, and publishes to npm.

For secure, tokenless publishing, configure npm Trusted Publishing for the repository and `publish.yml`. The workflow requests the required GitHub OIDC permission and npm generates provenance automatically.

## License

[MIT](./LICENSE)
